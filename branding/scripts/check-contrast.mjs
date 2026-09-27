#!/usr/bin/env node
/**
 * Contrast gate — runs over BRAND.html, never appears inside it.
 *
 * Failure mode: the guide used to publish a "Pair / Hex / Ratio / WCAG" table.
 * It occupied identity space with an audit and, worse, failed pairs nobody had
 * proposed using together — light ink over the accent at 1.57:1, in a guide
 * where light text is never placed on the accent.
 * Why this script exists: an invented failure teaches the reader to ignore the
 * verdict column. The check stays; it stopped being content. This reads the
 * :root tokens and measures the pairs the product ACTUALLY uses.
 *
 * Usage:
 *   node check-contrast.mjs <BRAND.html>
 *   node check-contrast.mjs <BRAND.html> --pair=accent:bg --pair=text:surface
 *   node check-contrast.mjs <BRAND.html> --json
 *
 * Exits 1 if any required pair fails.
 */
import fs from 'node:fs'

/** Pairs every guide has to sustain, with the minimum each one needs. */
const REQUIRED = [
  { fg: 'text', bg: 'bg', min: 4.5, note: 'body on background' },
  { fg: 'text', bg: 'surface', min: 4.5, note: 'body on surface' },
  { fg: 'muted', bg: 'bg', min: 3, note: 'secondary on background' },
  { fg: 'muted', bg: 'surface', min: 3, note: 'secondary on surface' },
  { fg: 'accent', bg: 'bg', min: 3, note: 'accent as a signal on background' },
]

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

function parseHex(value) {
  const m = String(value).trim().match(HEX)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

function luminance([r, g, b]) {
  const lin = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/** Reads one declaration block and returns { name-without-prefix: hex }. */
function readTokens(html, selector = ':root') {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const block = html.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`))
  if (!block) return {}

  const tokens = {}
  for (const line of block[1].split(/;|\n/)) {
    const m = line.match(/--([\w-]+)\s*:\s*([^;]+)/)
    if (!m) continue
    const hex = parseHex(m[2])
    if (hex) tokens[m[1].replace(/^(color-|c-)/, '')] = m[2].trim()
  }
  return tokens
}

function resolve(tokens, name) {
  const direct = tokens[name]
  if (direct) return { name, value: direct }
  // Accept the aliases guides commonly use: text/ink, bg/background, surface/card.
  const alias = {
    text: ['ink', 'fg', 'foreground'],
    bg: ['background', 'base'],
    surface: ['card', 'panel', 'elev'],
    muted: ['dim', 'secondary', 'subtle'],
    accent: ['brand', 'primary'],
  }[name] || []
  for (const a of alias) if (tokens[a]) return { name: a, value: tokens[a] }
  return null
}

function main() {
  const args = process.argv.slice(2)
  const file = args.find((a) => !a.startsWith('--'))
  const asJson = args.includes('--json')
  const extra = args
    .filter((a) => a.startsWith('--pair='))
    .map((a) => a.slice(7).split(':'))
    .filter((p) => p.length === 2)
    .map(([fg, bg]) => ({ fg, bg, min: 4.5, note: 'pair passed on the command line' }))

  if (!file) {
    console.error('usage: node check-contrast.mjs <BRAND.html> [--pair=fg:bg] [--json]')
    process.exit(2)
  }

  const html = fs.readFileSync(file, 'utf8')
  const base = readTokens(html)

  if (!Object.keys(base).length) {
    console.error(`no :root block with hex values in ${file}`)
    process.exit(2)
  }

  // The theme toggle is mandatory in the shell, so half of real use happens
  // under the other theme.
  // Failure mode: measuring only :root left that half ungated, and a gold accent
  // sat at 1.72:1 on the light background with nobody warned.
  // The guide declares its default theme in :root and the alternate in a body
  // class; both body.theme-alt (current) and body.theme-light (older) are read.
  const overrides = ['body.theme-alt', 'body.theme-light']
    .map((sel) => readTokens(html, sel))
    .find((t) => Object.keys(t).length)

  const defaultTheme = /data-theme-default="light"/.test(html) ? 'light' : 'dark'
  const themes = [{ label: `${defaultTheme} (default)`, tokens: base }]
  if (overrides) {
    themes.push({ label: defaultTheme === 'light' ? 'dark' : 'light', tokens: { ...base, ...overrides } })
  }

  const rows = []
  for (const theme of themes) {
    for (const pair of [...REQUIRED, ...extra]) {
      const fg = resolve(theme.tokens, pair.fg)
      const bg = resolve(theme.tokens, pair.bg)
      if (!fg || !bg) {
        rows.push({ ...pair, theme: theme.label, status: 'missing', detail: `token ${!fg ? pair.fg : pair.bg} not found` })
        continue
      }
      const r = ratio(parseHex(fg.value), parseHex(bg.value))
      rows.push({
        ...pair,
        theme: theme.label,
        fgToken: fg.name,
        bgToken: bg.name,
        fgHex: fg.value,
        bgHex: bg.value,
        ratio: Math.round(r * 100) / 100,
        status: r >= pair.min ? 'ok' : 'FAIL',
      })
    }
  }

  if (asJson) {
    console.log(JSON.stringify({ file, themes: themes.map((t) => t.label), rows }, null, 2))
  } else {
    for (const r of rows) {
      const label = `${r.theme.padEnd(16)} ${r.fg}/${r.bg}`.padEnd(34)
      if (r.status === 'missing') console.log(`?      ${label} ${r.detail}`)
      else console.log(`${r.status.padEnd(6)} ${label} ${String(r.ratio).padStart(6)}:1  (min ${r.min}) — ${r.note}`)
    }
  }

  const failed = rows.filter((r) => r.status === 'FAIL')
  if (failed.length) {
    if (!asJson) console.error(`\n${failed.length} pair(s) below the minimum — fix the tokens before publishing.`)
    process.exit(1)
  }
  if (!asJson) console.log('\nContrast ok. This output does NOT go into BRAND.html — it is a gate, not content.')
}

main()

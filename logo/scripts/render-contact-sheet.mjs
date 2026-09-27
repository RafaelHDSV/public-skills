// Contact sheet across one or many logo dirs — the gate that catches what the
// verifier cannot: a set that is one idea redrawn, a silhouette that is the
// stock icon for its noun, and a lockup whose letters do not spell the brand.
//
// Built after the 2026-09-11 batch shipped 15 lockups reading PIMDL, IRALP,
// OFPFNNRO... every one of which passed verify-logo.mjs. Nothing mechanical
// saw it. A rendered sheet did, instantly.
//
// Usage:
//   node render-contact-sheet.mjs <out.png> <logo-dir> [<logo-dir> ...]
//   node render-contact-sheet.mjs <out.png> --glob=new-ideas/*/assets/logos
//   node render-contact-sheet.mjs <out.png> <dirs...> --mode=marks|tiny|lockup|letter
//
// modes: marks (92px, default) · tiny (20px favicon test) · lockup (wordmarks)
//        letter (160px, stroke marks only, on white — the view where an
//        accidental H/A/U/T is unmistakable; verify-logo WARNs, this shows)
// Renders dark and light side by side. ALWAYS open the PNG and look at it.
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const argv = process.argv.slice(2)
const out = argv.find((a) => !a.startsWith('--'))
const mode = (argv.find((a) => a.startsWith('--mode=')) || '--mode=marks').slice(7)
const dirs = argv.filter((a) => !a.startsWith('--') && a !== out)

if (!out || !dirs.length) {
  console.error('usage: render-contact-sheet.mjs <out.png> <logo-dir...> [--mode=marks|tiny|lockup|letter]')
  process.exit(2)
}

const SIZE = { marks: 92, tiny: 20, lockup: 52, letter: 160 }[mode]
if (!SIZE) {
  console.error('unknown --mode=' + mode)
  process.exit(2)
}

function inline(file) {
  return fs.readFileSync(file, 'utf8').replace(/<\?xml[^>]*\?>/, '').trim()
}

function cellsFor(dir) {
  if (!fs.existsSync(dir)) return []
  const all = fs.readdirSync(dir).filter((f) => f.endsWith('.svg'))
  if (mode === 'lockup') {
    return all
      .filter((f) => /lockup|wordmark/.test(f))
      .concat(all.filter((f) => f === 'favicon.svg'))
      .sort()
  }
  const marks = all.filter((f) => /^logo-v\d/.test(f))
  if (mode === 'letter') {
    // Only the stroke family. A filled mark cannot be mistaken for a letter the
    // way a two- or three-stroke figure can.
    return marks
      .filter((f) => {
        const svg = fs.readFileSync(path.join(dir, f), 'utf8')
        return /stroke-width/.test(svg) && /fill\s*=\s*["']none["']/.test(svg)
      })
      .sort()
  }
  return marks.concat(all.filter((f) => f === 'favicon.svg')).sort()
}

const groups = dirs
  .map((dir) => {
    const files = cellsFor(dir)
    if (!files.length) return null
    // Name the row after the project, not the assets/logos tail.
    const parts = dir.replace(/\\/g, '/').split('/').filter(Boolean)
    const label = parts[parts.indexOf('assets') - 1] || parts[parts.length - 1]
    return { label, dir, files }
  })
  .filter(Boolean)

if (!groups.length) {
  console.error('no .svg found under: ' + dirs.join(' '))
  process.exit(2)
}

const THEMES = [
  { key: 'dark', bg: '#141A22', card: '#1C2430', ink: '#8FA0B4', head: '#7FA8D0' },
  { key: 'light', bg: '#F4F6F8', card: '#FFFFFF', ink: '#5A6570', head: '#2B5C8A' },
]

function pane(theme) {
  const body = groups
    .map((g) => {
      const cells = g.files
        .map((f) => {
          const label = f.replace(/^logo-/, '').replace(/\.svg$/, '')
          return `<div class="cell"><div class="art">${inline(path.join(g.dir, f))}</div><div class="lab">${label}</div></div>`
        })
        .join('')
      return `<section><h2>${g.label}</h2><div class="row">${cells}</div></section>`
    })
    .join('\n')
  return `<div class="pane pane-${theme.key}">${body}</div>`
}

const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}
body{margin:0;display:flex;align-items:flex-start;font:12px/1.35 ui-sans-serif,system-ui,sans-serif}
.pane{flex:1;padding:16px;min-height:100vh}
${THEMES.map(
  (t) => `.pane-${t.key}{background:${t.bg};color:${t.ink}}
.pane-${t.key} h2{color:${t.head}}
.pane-${t.key} .cell{background:${t.card};border:1px solid ${t.key === 'dark' ? '#2A3644' : '#E2E8F0'}}`
).join('\n')}
h2{font:600 12px/1 ui-sans-serif;margin:14px 0 6px;letter-spacing:.06em;text-transform:uppercase}
.row{display:flex;gap:${mode === 'tiny' ? 14 : 10}px;flex-wrap:wrap;align-items:flex-end}
.cell{border-radius:8px;padding:8px;text-align:center}
.art svg{height:${SIZE}px;${mode === 'lockup' ? 'width:auto' : `width:${SIZE}px`};display:block;margin:0 auto}
.lab{margin-top:5px;font-size:9px;opacity:.8;max-width:${SIZE * (mode === 'lockup' ? 4 : 1) + 16}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style>${THEMES.map(pane).join('\n')}`

const htmlPath = path.resolve(out).replace(/\.png$/i, '') + '.html'
fs.writeFileSync(htmlPath, html)

const nCells = groups.reduce((a, g) => a + g.files.length, 0)
const perRow = mode === 'tiny' ? 14 : mode === 'letter' ? 4 : 6
const height = Math.max(
  700,
  groups.reduce((a, g) => a + 58 + Math.ceil(g.files.length / perRow) * (SIZE + 46), 40)
)

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => p && fs.existsSync(p))

if (!CHROME) {
  console.log('wrote ' + htmlPath + ' (no Chrome found — open it in a browser and look at it)')
  process.exit(0)
}

const png = path.resolve(out)
const r = spawnSync(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--screenshot=' + png,
    '--window-size=1600,' + Math.min(height, 16000),
    'file:///' + htmlPath.replace(/\\/g, '/'),
  ],
  { encoding: 'utf8', timeout: 180000 }
)

if (!fs.existsSync(png)) {
  console.error('screenshot failed: ' + (r.stderr || '').trim())
  console.log('wrote ' + htmlPath + ' — open it manually')
  process.exit(1)
}

console.log('wrote ' + png + '  (' + nCells + ' marks, ' + groups.length + ' sets, mode=' + mode + ')')
console.log('NOW OPEN IT. Read every lockup out loud: does it spell the brand name?')

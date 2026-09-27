// Build a lockup whose wordmark is correct by construction.
//
// Why this exists: the old rule was "never <text>, the font does not travel",
// with no sanctioned alternative. So marks got hand-drawn letterforms, and on
// 2026-09-11 all 15 lockups in new-ideas/ spelled nonsense — Aurora rendered
// PIMDL, Ronda rendered IRALP — and every one passed verify-logo.mjs.
//
// The font can travel. Google Fonts' css2 endpoint accepts `text=`, which
// returns a woff2 subset of only the glyphs the brand name uses: ~2.5 KB for
// "Aurora", 3.3 KB as base64. Embedded in the SVG, the file is self-contained
// and the letters are the real typeface — not a drawing of one.
//
// Usage:
//   node make-lockup.mjs <logo-dir> --name=Aurora --mark=logo-v1-horizon-rise.svg \
//     --font-query="Fraunces:opsz,wght@9..144,600" --ink=#E9EDF5 [--tracking=-0.01]
//     [--out=logo-lockup.svg] [--gap=18] [--size=34]
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const argv = process.argv.slice(2)
const dir = argv.find((a) => !a.startsWith('--'))
const opt = (k, d) => {
  const hit = argv.find((a) => a.startsWith('--' + k + '='))
  return hit ? hit.slice(k.length + 3) : d
}

const name = opt('name')
const markFile = opt('mark')
const fontQuery = opt('font-query')
const ink = opt('ink', '#E9EDF5')
const outName = opt('out', 'logo-lockup.svg')
const gap = Number(opt('gap', 18))
const fontSize = Number(opt('size', 34))
const tracking = opt('tracking', '0')

if (!dir || !name || !markFile || !fontQuery) {
  console.error(
    'usage: make-lockup.mjs <logo-dir> --name=Brand --mark=logo-v1-x.svg ' +
      '--font-query="Family:wght@600" [--ink=#hex] [--gap=18] [--size=34] [--tracking=-0.01]'
  )
  process.exit(2)
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function fetchSubset() {
  // The family spec is already URL-shaped: in css2, `+` separates the words of
  // a family name. Running it through encodeURIComponent turns that `+` into
  // %2B and asks for a family whose name literally contains a plus sign.
  //
  // Failure mode: every multi-word family (Plus Jakarta Sans, Source Sans 3,
  // IBM Plex Mono) returned 400, while single-word families worked — so the bug
  // stayed invisible until a lockup was built for a two-word font.
  // Why this is right: encode spaces, leave the rest of the spec alone.
  const familySpec = fontQuery.trim().replace(/\s+/g, '+')
  const url =
    'https://fonts.googleapis.com/css2?family=' +
    familySpec +
    '&text=' +
    encodeURIComponent(name)
  const css = await fetch(url, { headers: { 'User-Agent': UA } }).then((r) => {
    if (!r.ok) throw new Error('css2 ' + r.status + ' for ' + fontQuery)
    return r.text()
  })
  const woff2 = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/)?.[1]
  if (!woff2) throw new Error('no woff2 in css2 response — check the family/axis spec')
  const buf = Buffer.from(await fetch(woff2, { headers: { 'User-Agent': UA } }).then((r) => r.arrayBuffer()))
  const family = css.match(/font-family:\s*'([^']+)'/)?.[1] || fontQuery.split(':')[0]
  const weight = css.match(/font-weight:\s*([\d ]+)/)?.[1]?.trim() || '600'
  return { b64: buf.toString('base64'), bytes: buf.length, family, weight }
}

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => p && fs.existsSync(p))

// Measure the rendered wordmark instead of guessing. Chrome --dump-dom prints
// the DOM after scripts run, so the page writes the measurement into itself.
function measure(svgBody, tmp) {
  if (!CHROME) return null
  const probe = path.join(tmp, 'measure-lockup.html')
  fs.writeFileSync(
    probe,
    `<!doctype html><meta charset="utf-8"><body><svg id="s" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 120">${svgBody}</svg>
<div id="r">pending</div><script>
document.fonts.ready.then(function(){
  var t=document.getElementById('wm');
  document.getElementById('r').textContent='WIDTH='+t.getComputedTextLength().toFixed(2);
});
</script></body>`
  )
  const r = spawnSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--virtual-time-budget=6000',
      '--dump-dom',
      'file:///' + probe.replace(/\\/g, '/'),
    ],
    { encoding: 'utf8', timeout: 90000, maxBuffer: 64 * 1024 * 1024 }
  )
  const w = (r.stdout || '').match(/WIDTH=([\d.]+)/)?.[1]
  return w ? Number(w) : null
}

const markPath = path.join(dir, markFile)
if (!fs.existsSync(markPath)) {
  console.error('mark not found: ' + markPath)
  process.exit(2)
}

const markSvg = fs.readFileSync(markPath, 'utf8')
const markVB = markSvg.match(/viewBox="([\d.\s-]+)"/)?.[1]
if (!markVB) {
  console.error('mark has no viewBox')
  process.exit(2)
}
const [, , mw] = markVB.trim().split(/\s+/).map(Number)
const markInner = markSvg
  .replace(/<\?xml[\s\S]*?\?>/, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>/, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .trim()

const briefNoun = markSvg.match(/<!--\s*brief-noun:\s*(\S+)/)?.[1] || ''

const H = 64
const markBox = 48
const scale = markBox / mw
const textX = 4 + markBox + gap

const font = await fetchSubset()
const fontFace = `@font-face{font-family:'${font.family}';font-style:normal;font-weight:${font.weight};src:url(data:font/woff2;base64,${font.b64}) format('woff2');}`

const textEl = (id) =>
  `<text id="${id}" x="${textX}" y="${H / 2}" fill="${ink}" font-family="'${font.family}'" font-weight="${font.weight}" font-size="${fontSize}" letter-spacing="${tracking}em" dominant-baseline="central">${name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`

const tmpDir = fs.mkdtempSync(path.join(process.env.TEMP || '/tmp', 'lockup-'))
const measured = measure(`<defs><style>${fontFace}</style></defs>${textEl('wm')}`, tmpDir)
const textW = measured ?? name.length * fontSize * 0.58
if (measured === null) {
  console.warn('WARN: could not measure text width (no Chrome) — using an estimate; check the sheet')
}

const W = Math.round(textX + textW + 8)

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none" role="img" aria-label="${name}">
<!-- wordmark: ${name} -->
${briefNoun ? '<!-- brief-noun: ' + briefNoun + ' -->\n' : ''}<!-- wordmark-source: Google Fonts ${font.family} ${font.weight}, woff2 subset (${font.bytes}B) embedded below; the letters are the typeface, not a drawing of it -->
<defs><style>${fontFace}</style></defs>
<g transform="translate(4, ${(H - markBox) / 2}) scale(${scale.toFixed(4)})">
${markInner}
</g>
${textEl('wm')}
</svg>
`

const outPath = path.join(dir, outName)
fs.writeFileSync(outPath, svg)

// A wordmark has exactly one job and it is to be read. Ink tuned for a dark
// surface disappears on white \u2014 visible in any light/dark contact sheet \u2014 so
// the light-surface twin ships alongside it rather than being improvised later.
const inkLight = opt('ink-light')
let lightPath = null
if (inkLight) {
  lightPath = path.join(dir, outName.replace(/\.svg$/, '-light.svg'))
  fs.writeFileSync(lightPath, svg.split(ink).join(inkLight))
}

fs.rmSync(tmpDir, { recursive: true, force: true })

console.log(
  'wrote ' + outPath + '  (' + W + '\u00d7' + H + ', wordmark "' + name + '", ' +
    font.family + ' ' + font.weight + ', subset ' + font.bytes + 'B' +
    (measured === null ? ', width estimated' : ', width measured') + ')'
)
if (lightPath) console.log('wrote ' + lightPath + '  (light-surface ink ' + inkLight + ')')
else console.log('NOTE: no --ink-light given \u2014 no light-surface lockup was written')

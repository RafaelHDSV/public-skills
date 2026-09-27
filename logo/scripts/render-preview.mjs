// Build preview.html + optional headless PNG for logo review.
//
// Usage:
//   node render-preview.mjs <logo-dir> [--out=preview.png] [--sizes=96,48,24] [--themes=dark,light]
//
// Always writes preview.html. Tries Chrome/Edge headless when --out is set.
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
const dir = args.find((a) => !a.startsWith('--'))
const outArg = args.find((a) => a.startsWith('--out='))
const sizesArg = args.find((a) => a.startsWith('--sizes='))
const themesArg = args.find((a) => a.startsWith('--themes='))

if (!dir || !fs.existsSync(dir)) {
  console.error(
    'usage: render-preview.mjs <logo-dir> [--out=preview.png] [--sizes=96,48,24] [--themes=dark,light]'
  )
  process.exit(2)
}

const sizes = (sizesArg ? sizesArg.slice('--sizes='.length) : '96,48,24')
  .split(',')
  .map((s) => Number(s.trim()))
  .filter(Boolean)

const themes = (themesArg ? themesArg.slice('--themes='.length) : 'dark,light')
  .split(',')
  .map((s) => s.trim())

const svgFiles = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.svg'))
  .sort((a, b) => {
    const rank = (n) =>
      n === 'favicon.svg' ? 0 : /^logo-v1/.test(n) ? 1 : n.includes('lockup') ? 9 : 5
    return rank(a) - rank(b) || a.localeCompare(b)
  })

if (!svgFiles.length) {
  console.error('no .svg in ' + dir)
  process.exit(2)
}

const themeStyles = {
  dark: { bg: '#141A22', card: '#1C2430', label: '#9AA8B8' },
  light: { bg: '#F4F6F8', card: '#FFFFFF', label: '#5A6570' },
}

function relSvg(name) {
  return encodeURIComponent(name).replace(/%2F/g, '/')
}

const sections = themes
  .map((theme) => {
    const t = themeStyles[theme] || themeStyles.dark
    const cards = svgFiles
      .map((file) => {
        const rows = sizes
          .map(
            (sz) =>
              `<div class="cell"><img src="${file}" width="${sz}" height="${sz}" alt="${file} ${sz}px"/><span>${sz}px</span></div>`
          )
          .join('')
        return `<article class="mark"><h3>${file}</h3><div class="row">${rows}</div></article>`
      })
      .join('')
    return `<section class="theme theme-${theme}"><h2>${theme}</h2>${cards}</section>`
  })
  .join('')

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Logo preview</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font: 14px/1.4 system-ui, sans-serif; }
  .theme { padding: 24px; }
  .theme-dark { background: ${themeStyles.dark.bg}; color: ${themeStyles.dark.label}; }
  .theme-light { background: ${themeStyles.light.bg}; color: ${themeStyles.light.label}; }
  h2 { margin: 0 0 16px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
  .mark { background: var(--card); border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  .theme-dark .mark { --card: ${themeStyles.dark.card}; }
  .theme-light .mark { --card: ${themeStyles.light.card}; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .mark h3 { margin: 0 0 12px; font-size: 13px; font-weight: 600; color: inherit; }
  .row { display: flex; gap: 20px; align-items: flex-end; flex-wrap: wrap; }
  .cell { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .cell span { font-size: 11px; opacity: .85; }
</style>
</head>
<body>
${sections}
</body>
</html>`

const htmlPath = path.join(dir, 'preview.html')
fs.writeFileSync(htmlPath, html, 'utf8')
console.log('wrote ' + htmlPath)

const outFile = outArg ? path.resolve(outArg.slice('--out='.length)) : path.join(dir, 'preview.png')

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean)
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return null
}

const browser = findBrowser()
if (!browser) {
  console.log('no Chrome/Edge found — open preview.html manually for visual review')
  process.exit(0)
}

const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/')
const height = Math.max(900, svgFiles.length * themes.length * 120)
const shot = spawnSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--screenshot=' + outFile,
    '--window-size=900,' + height,
    fileUrl,
  ],
  { encoding: 'utf8' }
)

if (shot.status === 0 && fs.existsSync(outFile)) {
  console.log('wrote ' + outFile)
} else {
  console.log('headless screenshot failed — open preview.html manually')
  if (shot.stderr) console.error(shot.stderr.slice(0, 500))
}

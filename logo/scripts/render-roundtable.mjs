// Build roundtable.html — comparison grid for external + internal logo options.
//
// Usage:
//   node render-roundtable.mjs <logo-dir>
import fs from 'node:fs'
import path from 'node:path'

const dir = process.argv[2]
if (!dir || !fs.existsSync(dir)) {
  console.error('usage: render-roundtable.mjs <logo-dir>')
  process.exit(2)
}

function listFiles(sub, exts) {
  const p = path.join(dir, 'sketches', sub)
  if (!fs.existsSync(p)) return []
  return fs
    .readdirSync(p)
    .filter((f) => exts.some((e) => f.endsWith(e)))
    .sort()
}

const external = listFiles('external', ['.png', '.webp', '.jpg', '.jpeg', '.svg'])
const internal = listFiles('internal', ['.svg', '.png'])

const jsonPath = path.join(dir, 'roundtable-prompts.json')
let promptMap = {}
let promptsByProvider = {}
if (fs.existsSync(jsonPath)) {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  for (const p of data.prompts || []) {
    promptMap[p.id] = p
    const key = `${p.provider}-v${p.id.includes('v2') ? '2' : '1'}`
    promptsByProvider[key] = p
    promptsByProvider[p.provider] = promptsByProvider[p.provider] || p
  }
}

function matchPrompt(file) {
  const base = file.replace(/\.(png|svg|webp|jpg|jpeg)$/i, '')
  // cursor-v1-gestalt → ext-cursor-v1
  const m = base.match(/^(?:internal-)?(\w+)-v(\d+)/i)
  if (m) {
    const id =
      base.startsWith('internal-') || m[1] === 'internal'
        ? `int-${m[1] === 'internal' ? base.split('-')[1] : m[1]}-v${m[2]}`
        : `ext-${m[1]}-v${m[2]}`
    if (promptMap[id]) return promptMap[id]
    // internal-lettermark-v1
    const intId = `int-${base.replace(/^internal-/, '')}`
    if (promptMap[intId]) return promptMap[intId]
    const loose = Object.values(promptMap).find(
      (p) =>
        p.provider === m[1] &&
        (p.id.endsWith(`v${m[2]}`) || p.variant?.includes(m[1]))
    )
    if (loose) return loose
  }
  if (base.includes('lettermark') && promptMap['int-lettermark-v1']) {
    return promptMap['int-lettermark-v1']
  }
  if (base.includes('legacy') && promptMap['int-legacy-v1']) {
    return promptMap['int-legacy-v1']
  }
  return null
}

function cell(file, sub, source) {
  const rel = `sketches/${sub}/${file}`
  const meta = matchPrompt(file)
  const idGuess =
    meta?.id ||
    file.replace(/\.(png|svg|webp|jpg)$/i, '').replace(/^(\w+)-/, 'ext-$1-')
  const direction = meta?.direction || '?'
  const isLegacy = file.includes('legacy')
  const badges = [
    `<span class="badge dir">Dir ${direction}</span>`,
    isLegacy ? '<span class="badge legacy">legacy</span>' : '',
  ]
    .filter(Boolean)
    .join('')
  const isSvg = file.endsWith('.svg')
  const img = isSvg
    ? `<object data="${rel}" type="image/svg+xml" width="96" height="96"></object>`
    : `<img src="${rel}" width="96" height="96" alt="${file}"/>`
  return `<article class="cell">
    ${badges}
    <div class="thumb">${img}</div>
    <p class="id">${file}</p>
    <p class="meta">${source} · Direction ${direction}</p>
    <p class="pick">Aprovar: <code>aprovado ${idGuess}</code></p>
  </article>`
}

const extHtml = external.length
  ? external.map((f) => cell(f, 'external', 'external')).join('')
  : '<p class="empty">Nenhum PNG externo ainda — rode os provedores.</p>'

const intHtml = internal.length
  ? internal.map((f) => cell(f, 'internal', 'internal')).join('')
  : '<p class="empty">Nenhum SVG interno ainda.</p>'

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>Logo roundtable</title>
<style>
  body { font: 14px/1.4 system-ui, sans-serif; margin: 0; background: #0f1419; color: #e8ecf0; padding: 24px; }
  h1 { font-size: 18px; margin: 0 0 8px; }
  .muted { color: #8a97a8; font-size: 13px; margin-bottom: 24px; }
  section { margin-bottom: 32px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #8a97a8; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
  .cell { background: #1a222c; border-radius: 12px; padding: 12px; position: relative; }
  .thumb { display: flex; align-items: center; justify-content: center; min-height: 96px; background: #141a22; border-radius: 8px; margin-bottom: 8px; }
  .id { font-size: 11px; word-break: break-all; margin: 0 0 4px; font-weight: 600; }
  .meta, .pick { font-size: 10px; color: #8a97a8; margin: 0; }
  .pick code { color: #1a8a7a; font-size: 10px; }
  .badge { position: absolute; top: 8px; font-size: 9px; padding: 2px 6px; border-radius: 4px; }
  .badge.dir { left: 8px; background: #1a3d4a; color: #7dd3c0; }
  .badge.legacy { right: 8px; background: #5c3d3d; color: #f0c0c0; }
  .empty { color: #8a97a8; font-style: italic; }
</style>
</head>
<body>
<h1>Logo roundtable</h1>
<p class="muted">PNG = exploracao de conceito. Escolha uma celula; master = rebuild geometrico (nao auto-trace). Chat: <code>aprovado &lt;id&gt;</code></p>
<section>
<h2>Externos (${external.length})</h2>
<div class="grid">${extHtml}</div>
</section>
<section>
<h2>Internos (${internal.length})</h2>
<div class="grid">${intHtml}</div>
</section>
</body>
</html>`

const out = path.join(dir, 'roundtable.html')
fs.writeFileSync(out, html, 'utf8')
console.log('wrote ' + out)
console.log('external: ' + external.length + ', internal: ' + internal.length)

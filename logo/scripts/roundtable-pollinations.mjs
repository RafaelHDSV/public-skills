// Generate Pollinations roundtable PNGs — free HTTP API, no key.
//
// Usage:
//   node roundtable-pollinations.mjs <logo-dir>
import fs from 'node:fs'
import path from 'node:path'

const dir = process.argv[2]
if (!dir || !fs.existsSync(dir)) {
  console.error('usage: roundtable-pollinations.mjs <logo-dir>')
  process.exit(2)
}

const jsonPath = path.join(dir, 'roundtable-prompts.json')
if (!fs.existsSync(jsonPath)) {
  console.error('missing roundtable-prompts.json')
  process.exit(2)
}

const { prompts } = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
const entries = (prompts || []).filter((p) => p.id?.startsWith('ext-pollinations-'))
if (!entries.length) {
  console.error('no ext-pollinations-* prompts')
  process.exit(2)
}

const outDir = path.join(dir, 'sketches', 'external')
fs.mkdirSync(outDir, { recursive: true })

async function fetchImage(prompt, seed) {
  const q = new URLSearchParams({
    width: '1024',
    height: '1024',
    nologo: 'true',
    seed: String(seed),
  })
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${q}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

for (const entry of entries) {
  const slug = entry.id.replace('ext-pollinations-', 'pollinations-')
  const gestalt = entry.variant === 'minimal-3d' ? 'controle-minimal3d' : 'controle-lineart'
  const outFile = path.join(outDir, `${slug}-${gestalt}.png`)
  const seed = entry.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  process.stdout.write(`${entry.id} ... `)
  try {
    const buf = await fetchImage(entry.prompt, seed)
    fs.writeFileSync(outFile, buf)
    console.log('ok → ' + path.relative(dir, outFile))
  } catch (e) {
    console.log('fail: ' + e.message)
    process.exit(1)
  }
}

console.log('done')

// Emit prompts for /logo roundtable — concept-first, Direction-tagged.
//
// Usage:
//   node roundtable-prompt.mjs <logo-dir>
//
// Requires strategy.yaml with non-empty approved_directions.
// Reads mark-brief.md + logo-directions.md; writes roundtable-prompts.json.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Optional provider credentials, read from the PROJECT's .env — not from any
// path outside this skill. Every provider here is optional: with no .env at
// all, the roundtable still emits prompts and the Figma cells are skipped.
//
// Failure mode: this used to import a loader that lived outside the skill
// directory, so the file crashed the moment the skill was installed anywhere
// else — and it sat on the command path.
// Why this rule exists: a skill may not reach outside its own directory.
function loadProjectEnv(keys) {
  const envPath = path.join(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1).trim()
      if (/^(".*"|'.*')$/.test(val)) val = val.slice(1, -1)
      if (val && process.env[key] === undefined) process.env[key] = val
    }
  }
  return Object.fromEntries(keys.map((k) => [k, process.env[k] ? 'set' : 'missing']))
}

const env = loadProjectEnv(['FIGMA_FILE_KEY', 'FIGMA_CAPTURE_URL'])
const dir = process.argv[2]

if (!dir || !fs.existsSync(dir)) {
  console.error('usage: roundtable-prompt.mjs <logo-dir>')
  process.exit(2)
}

/** Minimal YAML subset for strategy.yaml (no dependency). */
function parseStrategy(text) {
  const getList = (key) => {
    const block = text.match(
      new RegExp(`${key}:\\s*\\n((?:\\s+-\\s+.+\n?)+)`, 'm')
    )
    if (block) {
      return block[1]
        .split('\n')
        .map((l) => l.replace(/^\s+-\s+/, '').trim())
        .filter((x) => x && x !== '""' && x !== "''")
    }
    const inline = text.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`))
    if (inline) {
      return inline[1]
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    }
    return []
  }
  const brandBlock = text.match(/brand:\s*\n((?:\s{2}.+\n?)+)/)
  const brandText = brandBlock ? brandBlock[1] : text
  const stripQ = (s) => (s || '').trim().replace(/^["']|["']$/g, '')
  return {
    brand: {
      name: stripQ(brandText.match(/name:\s*(.+)/)?.[1]) || 'Product',
      category: stripQ(brandText.match(/category:\s*(.+)/)?.[1]),
      audience: stripQ(brandText.match(/audience:\s*(.+)/)?.[1]),
    },
    brand_keywords: getList('brand_keywords'),
    avoid: getList('avoid'),
    approved_directions: getList('approved_directions')
      .map((d) => d.toUpperCase().replace(/[^A-D]/g, ''))
      .filter((d) => /^[A-D]$/.test(d)),
  }
}

function parseBrief(text) {
  const get = (key) => {
    const m =
      text.match(new RegExp(`\\*\\*${key}\\*\\*\\s*\\|\\s*([^\\n|]+)`)) ||
      text.match(new RegExp(`${key}:\\s*(.+)`))
    return m ? m[1].trim().replace(/<!--.*?-->/g, '').trim() : ''
  }
  return {
    brand_name: get('brand_name') || 'Product',
    must_read_as: get('must_read_as') || 'mark',
    primary_type: get('primary_type') || 'abstract',
    accent: text.match(/accent\s*\|\s*(#[0-9A-Fa-f]{3,8})/)?.[1] || '#1A8A7A',
    neutral_light: text.match(/neutral light\s*\|\s*(#[0-9A-Fa-f]{3,8})/)?.[1] || '#E8ECF0',
    neutral_dark: text.match(/neutral dark\s*\|\s*(#[0-9A-Fa-f]{3,8})/)?.[1] || '#141A22',
  }
}

/** Parse "## Direction X — Title" blocks from logo-directions.md */
function parseDirections(text) {
  const map = {}
  if (!text) return map
  const re =
    /##\s*Direction\s+([A-D])\s*[—\-–]\s*"?([^"\n]+)"?\s*\n([\s\S]*?)(?=##\s*Direction\s+[A-D]|$)/gi
  let m
  while ((m = re.exec(text))) {
    const id = m[1].toUpperCase()
    const title = m[2].trim().replace(/^<|>$/g, '')
    const body = m[3]
    const conceito =
      body.match(/\*\*Conceito:\*\*\s*(.+)/i)?.[1]?.trim() ||
      body.match(/Conceito:\s*(.+)/i)?.[1]?.trim() ||
      title
    const cues = body.match(/\*\*Visual cues:\*\*\s*(.+)/i)?.[1]?.trim() || ''
    const anti = body.match(/\*\*Anti-cues:\*\*\s*(.+)/i)?.[1]?.trim() || ''
    map[id] = { id, title, conceito, cues, anti }
  }
  return map
}

const strategyPath = path.join(dir, 'strategy.yaml')
if (!fs.existsSync(strategyPath)) {
  console.error(
    'missing strategy.yaml — run /logo strategy first (copy references/strategy.template.yaml)'
  )
  process.exit(2)
}

const strategy = parseStrategy(fs.readFileSync(strategyPath, 'utf8'))
if (!strategy.approved_directions.length) {
  console.error(
    'approved_directions empty in strategy.yaml — human must approve Logo Directions first'
  )
  process.exit(2)
}

const briefPath = path.join(dir, 'mark-brief.md')
const brief = fs.existsSync(briefPath)
  ? parseBrief(fs.readFileSync(briefPath, 'utf8'))
  : {
      brand_name: strategy.brand.name || 'Product',
      must_read_as: 'mark',
      primary_type: 'abstract',
      accent: '#1A8A7A',
      neutral_light: '#E8ECF0',
      neutral_dark: '#141A22',
    }

if (!brief.brand_name || brief.brand_name === 'Product') {
  brief.brand_name = strategy.brand.name || brief.brand_name
}

const dirMdPath = path.join(dir, 'logo-directions.md')
const directions = fs.existsSync(dirMdPath)
  ? parseDirections(fs.readFileSync(dirMdPath, 'utf8'))
  : {}

const approved = strategy.approved_directions
const keywords =
  strategy.brand_keywords.length > 0
    ? strategy.brand_keywords.join(', ')
    : brief.must_read_as
const avoidList =
  strategy.avoid.length > 0
    ? strategy.avoid.join(', ')
    : 'brain, rocket, code brackets, AI sparkles, bar chart, gear, robot'

function conceptPrompt(directionId, styleSuffix) {
  const d = directions[directionId] || {
    title: `Direction ${directionId}`,
    conceito: brief.must_read_as,
    cues: '',
    anti: '',
  }
  const anti = [avoidList, d.anti].filter(Boolean).join('; ')
  return [
    'Create a minimalist geometric symbol.',
    `Direction ${directionId}: ${d.title} — ${d.conceito}`,
    d.cues ? `Visual cues: ${d.cues}.` : '',
    `Communicate: ${keywords}.`,
    `Avoid: ${anti}.`,
    'Style refs: Stripe, Linear, Ramp, Vercel (feel, not copy).',
    `Brand context: "${brief.brand_name}" (${strategy.brand.category || 'product'}).`,
    `Colors: accent ${brief.accent}, light ${brief.neutral_light} on ${brief.neutral_dark}.`,
    'Flat monochrome preferred, square 1:1, centered, no text, no watermark, no phone mockup.',
    'Bold simple shapes, legible at 32px, no gradient, no photorealism.',
    styleSuffix ? `Variant style: ${styleSuffix}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

const variants = [
  { id: 'ext-cursor-v1', provider: 'cursor', variant: 'flat-icon', suffix: 'flat minimal icon, solid fills' },
  { id: 'ext-cursor-v2', provider: 'cursor', variant: 'geometric-solid', suffix: 'geometric solid silhouette, thick forms' },
  { id: 'ext-pollinations-v1', provider: 'pollinations', variant: 'minimal-3d', suffix: 'soft minimal 3D app icon style' },
  { id: 'ext-pollinations-v2', provider: 'pollinations', variant: 'line-art', suffix: 'bold line-art icon, 2 colors max' },
  { id: 'ext-stitch-v1', provider: 'stitch', variant: 'app-icon-a', suffix: 'mobile app icon, centered mark' },
  { id: 'ext-stitch-v2', provider: 'stitch', variant: 'app-icon-b', suffix: 'app icon alternate composition' },
  {
    id: 'ext-figma-v1',
    provider: 'figma',
    variant: 'design-system',
    suffix: 'design-system geometric mark',
    optional: true,
    requires_env: 'FIGMA_FILE_KEY',
  },
  {
    id: 'ext-figma-v2',
    provider: 'figma',
    variant: 'custom',
    suffix: 'custom ownable abstract mark',
    optional: true,
    requires_env: 'FIGMA_FILE_KEY',
  },
]

const prompts = variants.map((v, i) => {
  const direction = approved[i % approved.length]
  return {
    ...v,
    source: 'external',
    direction,
    output_glob: `sketches/external/${v.provider}-v${v.id.endsWith('v2') ? '2' : '1'}-*.png`,
    prompt: conceptPrompt(direction, v.suffix),
  }
})

const letterDir = approved[0]
const legacyDir = approved[Math.min(1, approved.length - 1)]

prompts.push(
  {
    id: 'int-lettermark-v1',
    provider: 'agent',
    variant: 'lettermark',
    source: 'internal',
    direction: letterDir,
    output_glob: 'sketches/internal/internal-lettermark-v1.svg',
    prompt: `Internal SVG lettermark only. Initials from "${brief.brand_name}". Geometric, thick, tokens ${brief.accent}/${brief.neutral_light}. Align to Direction ${letterDir}: ${(directions[letterDir] || {}).title || letterDir}.`,
  },
  {
    id: 'int-legacy-v1',
    provider: 'agent',
    variant: 'legacy',
    source: 'internal',
    direction: legacyDir,
    output_glob: 'sketches/internal/internal-legacy-v1.svg',
    prompt: `Internal legacy SVG (discouraged). Pictorial for Direction ${legacyDir}. Only if externals unavailable.`,
  }
)

fs.mkdirSync(path.join(dir, 'sketches', 'external'), { recursive: true })
fs.mkdirSync(path.join(dir, 'sketches', 'internal'), { recursive: true })

const externalCount = prompts.filter((p) => p.source === 'external').length
const jsonPath = path.join(dir, 'roundtable-prompts.json')
fs.writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      brief,
      strategy: {
        brand: strategy.brand,
        brand_keywords: strategy.brand_keywords,
        avoid: strategy.avoid,
        approved_directions: approved,
      },
      directions,
      env,
      prompts,
    },
    null,
    2
  ),
  'utf8'
)

const indexPath = path.join(dir, 'roundtable-index.md')
const rows = prompts
  .map((p) => {
    const status = p.optional ? 'optional' : 'pending'
    const file = p.source === 'internal' ? p.output_glob : ''
    return `| ${p.id} | ${p.source} | ${p.provider} | ${p.variant} | ${p.direction} | | ${file} | ${status} | |`
  })
  .join('\n')

const indexBody = `# Roundtable index

Gerado por \`roundtable-prompt.mjs\`. Directions: ${approved.join(', ')}.

| id | source | provider | variant | direction | family | file | status | nota_humana |
|----|--------|----------|---------|-----------|--------|------|--------|-------------|
${rows}

## approved_option

\`\`\`yaml
# id: ext-cursor-v1
# direction: B
# file: sketches/external/cursor-v1-....png
\`\`\`
`
fs.writeFileSync(indexPath, indexBody, 'utf8')

console.log('wrote ' + jsonPath)
console.log('wrote ' + indexPath)
console.log(
  'prompts: ' +
    prompts.length +
    ' (' +
    externalCount +
    ' external + 2 internal); directions: ' +
    approved.join(',')
)
console.log('env: FIGMA_FILE=' + env.FIGMA_FILE_KEY)
console.log('next: invoke each provider; save PNG/SVG; run render-roundtable.mjs')

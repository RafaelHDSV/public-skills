// Mechanical SVG logo verifier — countable gates for the logo skill.
//
// Usage:
//   node verify-logo.mjs <logo-dir> [BRAND.html] [--brief=mark-brief.md] [--bg=#141A22]
//
// Auto-loads <logo-dir>/mark-brief.md when present. Exits 1 on any FAIL.
import fs from 'node:fs'
import path from 'node:path'

const PRIMITIVES = ['rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline']
const DRAWN = [...PRIMITIVES, 'path', 'text', 'image', 'use']
const TAG = /<([a-zA-Z][\w:-]*)\b/g

const DEFAULT_FORBIDDEN = [
  'dossel', 'portico', 'garagem', 'luz', 'barra', 'portal', 'alpendre', 'brise',
  'tunel', 'oficina', 'balcao', 'chamine', 'toldo', 'tribuna', 'tesoura', 'bule',
  'gemelos', 'hangar', 'frontaria', 'campanario', 'empena', 'torreao', 'portada',
  'trave', 'vao', 'fresta', 'tanque', 'alcova', 'calha', 'poco', 'lacre', 'folio',
  'beam-wrong', 'mercado', 'celeiro', 'forno', 'portada',
]

const args = process.argv.slice(2)
const bgArg = args.find((a) => a.startsWith('--bg='))
const briefArg = args.find((a) => a.startsWith('--brief='))
const positional = args.filter((a) => !a.startsWith('--'))
const dir = positional[0]
const brandFile = positional[1]

if (!dir || !fs.existsSync(dir)) {
  console.error(
    'usage: verify-logo.mjs <logo-dir> [BRAND.html] [--brief=mark-brief.md] [--bg=#hex]'
  )
  process.exit(2)
}

function norm(hex) {
  let h = hex.slice(1).toLowerCase()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return '#' + h.slice(0, 6)
}

function luminance(hex) {
  const ch = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

function parseMarkBrief(file) {
  if (!file || !fs.existsSync(file)) return null
  const text = fs.readFileSync(file, 'utf8')
  const out = {
    brand_name: null,
    must_read_as: null,
    primary_type: null,
    forbidden: [...DEFAULT_FORBIDDEN],
  }

  const brand =
    text.match(/\*\*brand_name\*\*\s*\|\s*([^\n|]+)/)?.[1]?.trim() ||
    text.match(/brand_name:\s*"?([^"\n]+)"?/)?.[1]?.trim()
  if (brand && !brand.startsWith('<!--')) out.brand_name = brand

  const noun =
    text.match(/\*\*must_read_as\*\*\s*\|\s*([^\n|]+)/)?.[1]?.trim() ||
    text.match(/must_read_as:\s*(\S+)/)?.[1]?.trim() ||
    text.match(/<!-- one noun:\s*([^–\-]+)/)?.[1]?.trim()
  if (noun && !noun.startsWith('<!--')) out.must_read_as = noun.toLowerCase()

  const ptype =
    text.match(/\*\*primary_type\*\*\s*\|\s*([^\n|]+)/)?.[1]?.trim() ||
    text.match(/primary_type:\s*(\S+)/)?.[1]?.trim()
  if (ptype && !ptype.startsWith('<!--')) out.primary_type = ptype.toLowerCase().split(/\s+/)[0]

  const forbiddenLine =
    text.match(/\*\*forbidden_gestalts\*\*\s*\|\s*([^\n|]+)/)?.[1] ||
    text.match(/forbidden_gestalts:\s*([^\n]+)/)?.[1]
  if (forbiddenLine) {
    const extra = forbiddenLine
      .split(/[,;]/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s && !s.startsWith('<!--'))
    if (extra.length) out.forbidden = [...new Set([...out.forbidden, ...extra])]
  }

  return out
}

const bg = bgArg ? norm(bgArg.slice('--bg='.length)) : null
// A "-light" asset is drawn for a light surface, so grading it against the dark
// --bg reports every correct file as an invisible one. Surface follows filename.
const bgLightArg = args.find((a) => a.startsWith('--bg-light='))
const bgLight = norm(bgLightArg ? bgLightArg.slice('--bg-light='.length) : '#ffffff')

let briefFile = briefArg ? briefArg.slice('--brief='.length) : path.join(dir, 'mark-brief.md')
if (!fs.existsSync(briefFile)) briefFile = null
const markBrief = parseMarkBrief(briefFile)

/**
 * The names a wordmark in this directory is allowed to spell.
 *
 * mark-brief.md names ONE brand, and for a long time that was the whole truth.
 * It stopped being the whole truth when a directory started shipping a lockup
 * pair per candidate name: `handoff.yaml` declares them under `lockups:`, and a
 * file spelling one of those is correct, not a regression.
 *
 * What does NOT change: a wordmark spelling something nobody declared is still
 * a FAIL. That is the check that was missing when 15/15 lockups spelled nonsense
 * — the set got bigger, the gate did not get weaker.
 */
function sanctionedNames(d, brief) {
  const names = new Set()
  if (brief?.brand_name) names.add(brief.brand_name.toUpperCase())
  const hy = path.join(d, 'handoff.yaml')
  if (fs.existsSync(hy)) {
    const text = fs.readFileSync(hy, 'utf8')
    const block = text.split(/^lockups:\s*$/m)[1]
    if (block) {
      for (const m of block.matchAll(/^\s+name:\s*"?([^"\n]+?)"?\s*$/gm)) {
        names.add(m[1].toUpperCase())
      }
    }
  }
  return names
}

const SANCTIONED = sanctionedNames(dir, markBrief)

const tokens = new Set()
if (brandFile && fs.existsSync(brandFile)) {
  const css = fs.readFileSync(brandFile, 'utf8')
  for (const m of css.matchAll(/--[\w-]+\s*:\s*(#[0-9a-fA-F]{3,8})/g)) {
    tokens.add(norm(m[1]))
  }
}

function structure(svg) {
  const stack = []
  const errors = []
  const body = svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\?[\s\S]*?\?>/g, '')
    .replace(/<![\s\S]*?>/g, '')
  const re = /<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g
  let m
  while ((m = re.exec(body))) {
    const [, closing, tag, , selfClose] = m
    if (closing) {
      if (stack.pop() !== tag) errors.push('unbalanced tag: closing ' + tag)
    } else if (!selfClose) {
      stack.push(tag)
    }
  }
  if (stack.length) errors.push('unclosed tag: ' + stack[stack.length - 1])
  return errors
}

function countInsideGroups(drawable) {
  let n = 0
  let i = 0
  while ((i = drawable.indexOf('<g', i)) !== -1) {
    const end = drawable.indexOf('</g>', i)
    const seg = end === -1 ? drawable.slice(i) : drawable.slice(i, end)
    for (const m of seg.matchAll(TAG)) if (DRAWN.includes(m[1])) n++
    i = end === -1 ? drawable.length : end + 4
  }
  return n
}

/**
 * Anchor points and segment orientations of a path.
 * Relative commands are resolved — treating `l 20 42` as absolute would put the
 * point at (20,42) and every symmetry answer after it would be fiction.
 */
function pathGeometry(d) {
  const pts = []
  const segs = []
  let x = 0
  let y = 0
  const move = (px, py, kind) => {
    if (kind) segs.push({ dx: px - x, dy: py - y })
    pts.push([px, py])
    x = px
    y = py
  }
  const tokens = d.match(/[MLHVCSQTAZmlhvcsqtaz]|-?\d*\.?\d+/g) || []
  let i = 0
  let cmd = 'M'
  while (i < tokens.length) {
    if (/[MLHVCSQTAZmlhvcsqtaz]/.test(tokens[i])) cmd = tokens[i++]
    else if (!cmd) break
    const u = cmd.toUpperCase()
    const rel = cmd !== u
    const bx = rel ? x : 0
    const by = rel ? y : 0
    if (u === 'Z') continue
    if (u === 'M' || u === 'L') {
      if (i + 1 >= tokens.length) break
      move(bx + +tokens[i++], by + +tokens[i++], u === 'L')
    } else if (u === 'H') {
      if (i >= tokens.length) break
      move(bx + +tokens[i++], y, true)
    } else if (u === 'V') {
      if (i >= tokens.length) break
      move(x, by + +tokens[i++], true)
    } else if (u === 'A') {
      if (i + 6 >= tokens.length) break
      i += 5
      move(bx + +tokens[i++], by + +tokens[i++], false)
    } else if (u === 'C') {
      if (i + 5 >= tokens.length) break
      i += 4
      move(bx + +tokens[i++], by + +tokens[i++], false)
    } else if (u === 'Q') {
      if (i + 3 >= tokens.length) break
      i += 2
      move(bx + +tokens[i++], by + +tokens[i++], false)
    } else break
  }
  return { pts, segs }
}

/**
 * Does a stroke mark risk reading as a letter?
 *
 * Failure mode: four stroke marks in one batch read as H, A, U and a user icon.
 * Every one passed this verifier with zero FAIL.
 * Why this check exists: a symmetric stroke figure with two or three segments
 * is an alphabet. This narrows WHERE to look — it cannot read meaning, so it
 * is a WARN and never a FAIL, and a legitimate lettermark trips it on purpose.
 *
 * Narrow on purpose: stroke-only, 2-5 paths, and either mirror-symmetric about
 * the vertical centre or made entirely of axis-aligned segments.
 */
function letterformRisk(strokePaths, V) {
  // 2-5 paths: a caliper rebuilt with feet became five strokes and still read as H.
  if (strokePaths.length < 2 || strokePaths.length > 5) return null

  const geo = strokePaths.map(pathGeometry)
  const pts = geo.flatMap((g) => g.pts)
  const segs = geo.flatMap((g) => g.segs)
  if (pts.length < 3 || pts.length > 16) return null
  if (!segs.length) return null

  const tol = V * 0.06
  const xs = pts.map((p) => p[0])
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2

  const mirrored = pts.every(([px, py]) =>
    pts.some(([qx, qy]) => Math.abs(qx - (2 * cx - px)) <= tol && Math.abs(qy - py) <= tol)
  )

  // Axis-aligned means every segment is horizontal or vertical — a diagonal is
  // neither, and calling it axis-aligned flagged a perfectly good asymmetric
  // beam as a letter.
  const axisOnly = segs.every((s) => Math.abs(s.dx) <= tol || Math.abs(s.dy) <= tol)

  if (mirrored) return 'mirror-symmetric about the vertical centre'
  if (axisOnly) return 'every segment horizontal or vertical'
  return null
}

function pathBBox(d) {
  let x = 0
  let y = 0
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const add = (px, py) => {
    minX = Math.min(minX, px)
    maxX = Math.max(maxX, px)
    minY = Math.min(minY, py)
    maxY = Math.max(maxY, py)
    x = px
    y = py
  }
  const tokens = d.match(/[MLHVCSQTAZmlhvcsqtaz]|-?\d*\.?\d+/g) || []
  let i = 0
  while (i < tokens.length) {
    const cmd = tokens[i++]
    if (!/[MLHVCSQTAZmlhvcsqtaz]/.test(cmd)) continue
    const u = cmd.toUpperCase()
    if (u === 'M' || u === 'L') {
      if (i + 1 >= tokens.length) break
      add(+tokens[i++], +tokens[i++])
    } else if (u === 'H') {
      if (i >= tokens.length) break
      add(+tokens[i++], y)
    } else if (u === 'V') {
      if (i >= tokens.length) break
      add(x, +tokens[i++])
    } else if (u === 'A') {
      if (i + 6 >= tokens.length) break
      i += 5
      add(+tokens[i++], +tokens[i++])
    } else if (u === 'C') {
      if (i + 5 >= tokens.length) break
      i += 4
      add(+tokens[i++], +tokens[i++])
    } else if (u === 'Q') {
      if (i + 3 >= tokens.length) break
      i += 2
      add(+tokens[i++], +tokens[i++])
    }
  }
  if (minX === Infinity) return null
  return { minX, minY, maxX, maxY, area: (maxX - minX) * (maxY - minY) }
}

// Concentric ring drawn as one evenodd path: two curve-only subpaths and
// nothing else. Textual on purpose — pathBBox reads relative deltas as
// absolute, so a bbox test cannot see these shapes.
function isConcentricRing(d) {
  const subs = d.split(/(?=[Mm])/).filter((s) => /[Mm]/.test(s))
  // Ring (2 subpaths) or bullseye (3). Counting command *letters* undercounts,
  // because a circle is usually one `c`/`a` plus implicit repeated coordinate
  // groups — so require only that every subpath is curve-only.
  if (subs.length < 2 || subs.length > 3) return false
  return subs.every((s) => {
    const cmds = s.match(/[MLHVCSQTAZmlhvcsqtaz]/g) || []
    const curves = cmds.filter((c) => /[CSQTAcsqta]/.test(c)).length
    const straight = cmds.filter((c) => /[LHVlhv]/.test(c)).length
    return curves >= 1 && straight === 0
  })
}

function isFakeAxisPath(d) {
  const cmds = d.match(/[MLHVCSQTAZmlhvcsqtaz]/g) || []
  if (cmds.length < 8) return false
  const hv = cmds.filter((c) => /[HVhv]/.test(c)).length
  const curves = cmds.filter((c) => /[CSQTAcsqta]/.test(c)).length
  if (curves > 0) return false
  const subpaths = (d.match(/[Mm]/g) || []).length
  const ratio = hv / cmds.length
  if (subpaths >= 4 && /^[MLHVZmlhvz\s.\d-]+$/.test(d.trim())) return true
  return (ratio >= 0.75 && subpaths >= 3) || (ratio >= 0.85 && subpaths >= 2)
}

function detectGluedWedge(pathDatas, V) {
  const boxes = pathDatas.map((d) => ({ d, box: pathBBox(d) })).filter((p) => p.box)
  if (boxes.length < 2) return false
  const sorted = [...boxes].sort((a, b) => b.box.area - a.box.area)
  const maxArea = sorted[0].box.area
  for (let j = 1; j < sorted.length; j++) {
    const { d, box } = sorted[j]
    if (box.area > maxArea * 0.35) continue
    const rightEdge = box.maxX >= V * 0.78
    const pointCount = (d.match(/[ML]/gi) || []).length
    // A glued wedge is ONE shape with 3 to 4 vertices. Without those two floors
    // the rule caught a curved ribbon (whose bbox comes out degenerate because
    // pathBBox only reads M/L) and a pair of bars — two legitimate marks per batch.
    const singleShape = (d.match(/[Mm]/g) || []).length === 1
    const wedgeLike = pointCount >= 3 && pointCount <= 4 && (d.match(/[L]/gi) || []).length <= 3
    if (rightEdge && singleShape && box.area < maxArea * 0.32 && wedgeLike) return true
  }
  return false
}

function detectTwoPostLintel(d, V) {
  const subpaths = d.split(/(?=[Mm])/).filter(Boolean)
  let verticalBars = 0
  for (const sp of subpaths) {
    const b = pathBBox(sp)
    if (!b) continue
    const w = b.maxX - b.minX
    const h = b.maxY - b.minY
    if (h > V * 0.35 && w < V * 0.2 && w > V * 0.03) verticalBars++
  }
  return verticalBars === 2
}

function filenameForbiddenHits(name, forbidden) {
  const slug = name.toLowerCase()
  return forbidden.filter((f) => slug.includes(f))
}

function check(file) {
  const svg = fs.readFileSync(file, 'utf8')
  const name = path.basename(file)
  const isFavicon = name === 'favicon.svg'
  const isWide = name.includes('lockup') || name.includes('wordmark')
  const isMark = !isFavicon && !isWide
  const out = []
  const fail = (msg) => out.push({ level: 'FAIL', msg })
  const warn = (msg) => out.push({ level: 'WARN', msg })

  for (const e of structure(svg)) fail(e)
  for (const m of svg.matchAll(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g)) {
    fail('unescaped & at offset ' + m.index)
  }

  // Non-ASCII is usually an encoding mojibake, which is why this gate exists.
  // But brand names carry diacritics, and the embedded woff2 subset carries the
  // glyph.
  // Failure mode: failing on the accent blocked the CORRECT wordmark and
  // rewarded the wrong one, which passed clean.
  // So characters that appear in the declared brand name are accepted; any
  // other non-ASCII is still a FAIL.
  // The target is mojibake in what gets RENDERED. An XML comment never reaches
  // the screen, and the skill requires a reason line per mark — which may be
  // written in any language. Measuring the whole file failed the very
  // documentation the skill asks for.
  const declaredName = (markBrief?.brand_name || '') + (svg.match(/<!--\s*wordmark:\s*([^-]+?)\s*-->/)?.[1] || '')
  const allowed = new Set([...declaredName].filter((c) => c.charCodeAt(0) > 127))
  const rendered = svg.replace(/<!--[\s\S]*?-->/g, '')
  const nonAscii = [...new Set([...rendered].filter((c) => c.charCodeAt(0) > 127 && !allowed.has(c)))]
  if (nonAscii.length) {
    fail(nonAscii.length + ' non-ASCII character(s): ' + nonAscii.join(' '))
  }

  let V = 0
  const vb = svg.match(/viewBox="([\d.\s-]+)"/)
  if (!vb) {
    fail('no viewBox')
  } else {
    const [, , w, h] = vb[1].trim().split(/\s+/).map(Number)
    V = Math.min(w, h)
    if (!isWide && Math.abs(w - h) > 0.01) {
      fail('viewBox not square (' + w + 'x' + h + ')')
    }
  }

  // Wordmark provenance.
  //
  // Historical failure ("PIMDL", batch 2026-09-11): the old rule was a blanket
  // ban on <text>, with no sanctioned way to build a wordmark. Every lockup was
  // hand-drawn letterforms that spelled nonsense, and 15/15 passed this file.
  // A ban is not a method. Two routes are legal now, and both are checkable:
  //   1. <text> + an @font-face whose src is a base64 data: URL — the font
  //      travels inside the file, so the word is correct by construction.
  //   2. outlined letters + a <!-- wordmark: NAME --> comment matching the
  //      brand, backed by wordmark-proof.txt (rasterize, read it back, record).
  const hasText = /<text[\s>]/.test(svg)
  const embedsFont = /@font-face[\s\S]*?src\s*:\s*url\(\s*['"]?\s*data:/.test(svg)
  const declaredWordmark = svg.match(/<!--\s*wordmark:\s*([^\n>]+?)\s*-->/)?.[1]

  if (hasText && !embedsFont) {
    fail(
      '<text> without an embedded @font-face: the font does not travel. ' +
        'Embed a base64 woff2 in <defs><style>, or outline the letters and ' +
        'declare <!-- wordmark: NAME --> plus wordmark-proof.txt'
    )
  }

  if (isWide) {
    if (!declaredWordmark) {
      fail('lockup has no <!-- wordmark: NAME --> provenance comment')
    } else if (SANCTIONED.size && !SANCTIONED.has(declaredWordmark.toUpperCase())) {
      fail(
        'wordmark provenance "' +
          declaredWordmark +
          '" is not a sanctioned name — mark-brief brand_name and handoff.yaml ' +
          'lockups declare: ' +
          [...SANCTIONED].join(', ')
      )
    }
    if (!hasText && !fs.existsSync(path.join(dir, 'wordmark-proof.txt'))) {
      fail(
        'outlined wordmark with no wordmark-proof.txt — rasterize the lockup, ' +
          'read the word back, and record what you actually saw ' +
          '(rebuild-checklist.md, step W)'
      )
    }
  }

  const drawable = svg.replace(/<defs[\s\S]*?<\/defs>/g, '')
  const counts = {}
  for (const tag of DRAWN) counts[tag] = 0
  for (const m of drawable.matchAll(TAG)) {
    if (counts[m[1]] !== undefined) counts[m[1]]++
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const prims = PRIMITIVES.reduce((a, t) => a + counts[t], 0)

  const groups = drawable.split('<g').length - 1
  const layers = total - countInsideGroups(drawable) + groups
  const budget = isFavicon ? 3 : isWide ? 7 : 5
  if (layers > budget) {
    fail(layers + ' visual layers (budget ' + budget + ') — remove one layer')
  }

  const paths = [...drawable.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
  const richPath = paths.some(
    (d) => (d.match(/[MLHVCSQTAZmlhvcsqtaz]/g) || []).length >= 4
  )
  if (!richPath && prims >= 3) {
    fail(prims + ' primitives with no authored path — reads as stacked clip-art')
  }

  // 12. Fake axis-aligned path (stacked rects disguised as path)
  if (isMark && paths.some(isFakeAxisPath)) {
    fail('fake path: mostly H/V commands with multiple subpaths — reads as stacked rects')
  }

  // 13. Glued wedge / beam-wrong.
  // Filled shapes only: the pattern is a triangle glued to the edge of a solid
  // body. A stroke has a near-zero bbox area and trips the threshold by accident
  // — six legitimate stroke marks failed this way before the narrowing.
  const filledPaths = [...drawable.matchAll(/<path[^>]*>/g)]
    .filter((m) => !/stroke-width/.test(m[0]))
    .map((m) => m[0].match(/\sd="([^"]+)"/)?.[1])
    .filter(Boolean)
  // 13b. Letterform risk on stroke marks.
  if (isMark && V) {
    const strokePaths = [...drawable.matchAll(/<path[^>]*>/g)]
      .filter((m) => /stroke-width/.test(m[0]))
      .map((m) => m[0].match(/\sd="([^"]+)"/)?.[1])
      .filter(Boolean)
    const risk = letterformRisk(strokePaths, V)
    if (risk) {
      warn(
        'letterform risk: ' + strokePaths.length + ' stroke paths, ' + risk +
          ' — render it (--mode=letter) and check it does not read as a letter; H A U T X V are the usual accidents'
      )
    }
  }

  if (isMark && V && detectGluedWedge(filledPaths, V)) {
    fail('glued wedge at edge — beam-wrong pattern (triangle pasted on body)')
  }

  // 14. Two-post lintel (pi shape)
  if (isMark && V && paths.some((d) => detectTwoPostLintel(d, V))) {
    warn('two-post lintel detected — often reads as pi; use 3–4 posts or different noun')
  }

  // 14b. Concentric ring / donut. The most reused silhouette in the atlas:
  // carimbo (brief "stamp"), ronda ("ring") and roleta ("wheel") all shipped
  // the same target on 2026-09-11 and all passed. It reads as bullseye or
  // loading spinner, never as a named object — so it is only legal when the
  // brief actually asks for a ring.
  if (isMark) {
    const ringed = [...drawable.matchAll(/<path[^>]*>/g)].some((m) => {
      if (!/fill-rule\s*=\s*["']evenodd["']/.test(m[0])) return false
      const dd = m[0].match(/\sd="([^"]+)"/)?.[1]
      return dd ? isConcentricRing(dd) : false
    })
    if (ringed) {
      const noun = markBrief?.must_read_as || ''
      const msg =
        'concentric ring (donut) silhouette — most reused shape in failure-atlas.md; ' +
        'reads as target / loading spinner, not as a named object'
      if (/ring|circle|orbit|loop|disc|wheel|anel|circulo/.test(noun)) {
        warn(msg + ' — allowed only because must_read_as is "' + noun + '"')
      } else {
        fail(msg + '; must_read_as is "' + (noun || 'unset') + '", not a ring')
      }
    }
  }

  // 15. Pictorial without curves
  const primaryType = markBrief?.primary_type
  if (isMark && primaryType === 'pictorial') {
    const hasCurve = paths.some((d) => /[CSQTAcsqta]/.test(d))
    if (!hasCurve && paths.length) {
      warn('pictorial mark has no curves (A/C/Q) — often reads as clip-art blocks')
    }
  }

  // 16. Brief metadata + forbidden filename slugs
  const svgNoun = svg.match(/<!--\s*brief-noun:\s*(\S+)/)?.[1]?.toLowerCase()
  if (markBrief) {
    if (isMark && !svgNoun) {
      warn('missing <!-- brief-noun: ... --> in SVG (recommended)')
    }
    if (svgNoun && markBrief.must_read_as && svgNoun !== markBrief.must_read_as) {
      fail(
        'SVG brief-noun "' +
          svgNoun +
          '" != mark-brief must_read_as "' +
          markBrief.must_read_as +
          '"'
      )
    }
    const forbidden = markBrief.forbidden || DEFAULT_FORBIDDEN
    const hits = filenameForbiddenHits(name, forbidden)
    if (isMark && hits.length) {
      fail(
        'filename contains forbidden gestalt slug(s): ' +
          hits.join(', ') +
          ' (see mark-brief forbidden_gestalts)'
      )
    }
  } else if (isMark) {
    warn('no mark-brief.md — brief noun and forbidden slugs not verified')
  }

  const hexes = [
    ...new Set([...svg.matchAll(/#[0-9a-fA-F]{3,8}/g)].map((m) => norm(m[0]))),
  ]
  // A lockup is mark + wordmark, so its third hex is the wordmark neutral and
  // is expected; only the mark itself is held to the 2-colour target.
  if (hexes.length >= 4) {
    fail(hexes.length + ' colours in the mark (target 2, ceiling 3): ' + hexes.join(' '))
  } else if (hexes.length === 3 && !isWide) {
    warn('3 colours in the mark (target 2) — the third must be a neutral, not a 2nd accent')
  }

  if (tokens.size) {
    const orphans = hexes.filter((h) => !tokens.has(h))
    if (orphans.length) {
      fail('hex outside the BRAND.html tokens: ' + orphans.join(' '))
    }
  }

  if (V) {
    for (const m of drawable.matchAll(/\sr="([\d.]+)"/g)) {
      if (Number(m[1]) < V / 12) {
        warn('radius ' + m[1] + ' < viewBox/12 (' + (V / 12).toFixed(1) + ') — blurs at 16px')
      }
    }
    for (const m of drawable.matchAll(/stroke-width="([\d.]+)"/g)) {
      if (Number(m[1]) < V / 40) {
        warn('stroke-width ' + m[1] + ' < viewBox/40 (' + (V / 40).toFixed(1) + ')')
      }
    }
  }

  if (V) {
    for (const m of drawable.matchAll(/<rect[^>]*>/g)) {
      const w = Number((m[0].match(/\swidth="([\d.]+)"/) || [])[1])
      if (m[0].includes('rx=') && w >= V * 0.9) {
        fail('rounded rect covering the viewBox — app-icon chrome, remove it')
      }
    }
  }

  const isLightAsset = /[-.]light\./.test(name)
  const surface = isLightAsset ? bgLight : bg
  if (surface) {
    const ratios = hexes.map((h) => [h, contrast(h, surface)])
    const best = Math.max(...ratios.map(([, r]) => r), 0)
    if (best < 3) {
      fail('no mark colour reaches 3:1 against ' + surface + ' — invisible mark')
    }
    // The wordmark ink and the mark's accents are not held to the same bar. A
    // logo may legitimately sit at 1.8:1 on white — a brand yellow does. A
    // *wordmark* at 1.8:1 is unreadable, which is what shipped on vitrine
    // (1.14:1) in the 2026-09-11 batch. So grade the ink separately.
    const inkHex = norm(svg.match(/<text[^>]*\sfill="(#[0-9a-fA-F]{3,8})"/)?.[1] || '')
    for (const [h, r] of ratios) {
      if (h === inkHex) {
        if (r < 4.5) {
          fail(
            'wordmark ink ' + h + ' is ' + r.toFixed(2) + ':1 against ' + surface +
              ' (needs 4.5:1) — the word is the one thing that must be readable'
          )
        }
      } else if (r < 3) {
        warn(
          h + ' is ' + r.toFixed(2) + ':1 against ' + surface +
            ' — only valid over another mark colour'
        )
      }
    }
  }

  return out
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.svg')).sort()

if (!files.length) {
  console.error('no .svg in ' + dir)
  process.exit(2)
}

let failed = 0
for (const f of files) {
  const res = check(path.join(dir, f))
  const bad = res.filter((r) => r.level === 'FAIL')
  if (bad.length) failed++
  const label = bad.length ? 'FAIL' : res.length ? 'WARN' : 'PASS'
  console.log(label.padEnd(4) + ' ' + f)
  for (const r of res) console.log('       ' + r.level + ': ' + r.msg)
}

// Set-level range. A single mark can be flawless while the set of six is one
// idea drawn six times (aurora = six sunrises, ronda = four rings, batch
// 2026-09-11). No per-file check can see that, so classify each mark into a
// coarse silhouette family and require the set to span at least three.
function gestaltFamily(file) {
  const svg = fs.readFileSync(file, 'utf8')
  const drawable = svg.replace(/<defs[\s\S]*?<\/defs>/g, '')
  const els = [...drawable.matchAll(/<path[^>]*>/g)].map((m) => m[0])
  const ds = els.map((e) => e.match(/\sd="([^"]+)"/)?.[1]).filter(Boolean)
  if (!ds.length) return 'empty'
  if (els.some((e) => /fill-rule\s*=\s*["']evenodd["']/.test(e) && isConcentricRing(e.match(/\sd="([^"]+)"/)?.[1] || '')))
    return 'ring'
  if (/stroke-width/.test(drawable) && /fill\s*=\s*["']none["']/.test(drawable)) return 'stroked-line'
  const anyCurve = ds.some((d) => /[CSQTAcsqta]/.test(d))
  if (!anyCurve) return 'axis-blocks'
  if (ds.length === 1) return 'single-blob'
  return 'curved-solid'
}

const markFiles = files.filter((f) => /^logo-v\d/.test(f))
if (markFiles.length >= 3) {
  const fams = markFiles.map((f) => [f, gestaltFamily(path.join(dir, f))])
  const tally = {}
  for (const [, fam] of fams) tally[fam] = (tally[fam] || 0) + 1
  const distinct = Object.keys(tally).length
  const spread = Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => k + '×' + v)
    .join(', ')

  console.log('')
  console.log('set range: ' + distinct + ' silhouette families across ' + markFiles.length + ' marks (' + spread + ')')

  // Family is a coarse proxy: six genuinely different pictorials all land in
  // curved-solid. So range never fails on its own — it routes the question to
  // the critic, which looks at the rendered contact sheet. Only an exact
  // recolour below is unambiguous enough to block.
  const dominant = Math.max(...Object.values(tally))
  if (distinct < 3 || dominant > markFiles.length / 2) {
    console.log(
      'WARN set: thin range (' +
        dominant +
        '/' +
        markFiles.length +
        ' marks in one family) — render the contact sheet and answer ' +
        'logo-critic.md "set range" before shipping'
    )
  }

  const seen = new Map()
  for (const f of markFiles) {
    const norm = fs
      .readFileSync(path.join(dir, f), 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, '')
      .replace(/#[0-9a-fA-F]{3,8}/g, '#')
    if (seen.has(norm)) {
      console.log('FAIL set: ' + f + ' is a recolour of ' + seen.get(norm) + ' — filler variant')
      failed++
    } else seen.set(norm, f)
  }
}

console.log('')
console.log(files.length - failed + '/' + files.length + ' files with no FAIL')
console.log(
  tokens.size
    ? 'tokens loaded from ' + path.basename(brandFile) + ': ' + tokens.size
    : 'no BRAND.html: system fit not verified'
)
console.log(
  markBrief
    ? 'mark-brief: must_read_as=' +
        (markBrief.must_read_as || '(unset)') +
        ', forbidden=' +
        markBrief.forbidden.length +
        ' slugs'
    : 'no mark-brief.md: brief noun not verified'
)
if (!bg) console.log('no --bg: contrast against the surface not verified')

process.exit(failed ? 1 : 0)

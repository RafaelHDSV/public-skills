#!/usr/bin/env node
// Coverage of a productive diff by the union of the HML diffs — skill pr-review, parity gate.
//
// Usage:
//   node $PR_REVIEW_SKILL/scripts/diff-coverage.mjs \
//     --prod <diff-prod> --hml 9029=<diff> --hml 9116=<diff> [--threshold 90] [--json]
//
// The label before "=" is the HML PR number; it comes back in the output so the skill can
// subtract the PRs the reviewer did NOT approve (§ 3.1 rule 4).
//
// Exit code: 0 = coverage >= threshold, 1 = below the threshold, 2 = bad input.
//
// Why line coverage and not a hash of the whole diff:
//   Across 3 real AGX PROD/HML pairs (17/09/2026) NONE was byte-identical, and even so
//   96.4% and 97.8% of the PROD +/- lines appeared identical in the HML union. The productive diff
//   is taken against a base (`production`) that sits behind `main`, and a productive PR usually
//   ports SEVERAL HML PRs at once (core#9148 ports five). A whole-diff hash never matches;
//   the set of changed lines matches almost entirely — and what is left is exactly what deserves review.
//
// What counts as a "changed line": lines starting with + or - inside a hunk, excluding
// the ---/+++ headers. Context lines are NOT included: they diverge through branch drift,
// which is expected in a port and is not what the reviewer needs to look at.

import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

/**
 * Extracts the changed lines per file, as a multiset.
 * A multiset (not a Set) so that three identical `+  }` lines count three times:
 * with a Set, a PROD PR repeating a block would look covered by an HML PR that has it only once.
 * @returns {Map<string, Map<string, number>>} path -> (line -> how many times)
 */
export function changedLines(diff) {
  const byPath = new Map()
  let current = null

  for (const raw of diff.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')) {
    if (raw.startsWith('diff --git ')) {
      const m = raw.match(/ b\/(.*)$/)
      current = m ? m[1] : raw
      if (!byPath.has(current)) byPath.set(current, new Map())
      continue
    }
    if (!current) continue
    if (raw.startsWith('+++') || raw.startsWith('---')) continue
    if (raw[0] !== '+' && raw[0] !== '-') continue

    const counts = byPath.get(current)
    counts.set(raw, (counts.get(raw) ?? 0) + 1)
  }
  return byPath
}

const total = (byPath) => [...byPath.values()].reduce((n, m) => n + [...m.values()].reduce((a, b) => a + b, 0), 0)

/** Hash of the changed-line set — the "exactly equal" case is an equal hash and zero orphans. */
export function changeHash(byPath) {
  const parts = [...byPath.keys()].sort().map((p) => {
    const lines = [...byPath.get(p).entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return p + '\n' + lines.map(([l, n]) => `${n}\t${l}`).join('\n')
  })
  return createHash('sha256').update(parts.join('\n'), 'utf8').digest('hex')
}

/**
 * Compares PROD against several labeled HML diffs.
 * A PROD line is covered if some HML PR has the SAME line at the SAME path, and there is still
 * an occurrence left in that HML (consumption is by multiset).
 */
export function coverage(prod, hmls) {
  // consumable copy of each HML PR's counts
  const pool = hmls.map(({ label, byPath }) => ({
    label,
    byPath: new Map([...byPath].map(([p, m]) => [p, new Map(m)])),
  }))

  const orphans = new Map() // path -> uncovered lines
  const coveredBy = new Map() // label -> number of lines this HML covered
  const onlyFrom = new Map() // label -> lines covered ONLY by this HML PR
  let covered = 0
  let totalLines = 0

  for (const [path, counts] of prod) {
    for (const [line, times] of counts) {
      for (let i = 0; i < times; i++) {
        totalLines++

        const sources = pool.filter((h) => (h.byPath.get(path)?.get(line) ?? 0) > 0)
        if (sources.length === 0) {
          if (!orphans.has(path)) orphans.set(path, [])
          orphans.get(path).push(line)
          continue
        }

        const chosen = sources[0]
        const m = chosen.byPath.get(path)
        m.set(line, m.get(line) - 1)
        covered++
        coveredBy.set(chosen.label, (coveredBy.get(chosen.label) ?? 0) + 1)

        if (sources.length === 1) {
          if (!onlyFrom.has(chosen.label)) onlyFrom.set(chosen.label, [])
          onlyFrom.get(chosen.label).push({ path, line })
        }
      }
    }
  }

  const pct = totalLines === 0 ? 100 : (100 * covered) / totalLines
  const orphanCount = [...orphans.values()].reduce((n, a) => n + a.length, 0)

  return {
    totalLines,
    covered,
    coveragePct: Number(pct.toFixed(1)),
    orphanCount,
    orphans: [...orphans].map(([path, lines]) => ({ path, count: lines.length, lines })),
    coveredBy: Object.fromEntries(coveredBy),
    onlyFrom: Object.fromEntries([...onlyFrom].map(([k, v]) => [k, v])),
    exact: orphanCount === 0 && pct === 100,
  }
}

function parseArgs(argv) {
  const out = { prod: null, hmls: [], threshold: 90, json: false }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--prod') out.prod = argv[++i]
    else if (a === '--hml') {
      const v = argv[++i] ?? ''
      const eq = v.indexOf('=')
      if (eq === -1) out.hmls.push({ label: `hml${out.hmls.length + 1}`, path: v })
      else out.hmls.push({ label: v.slice(0, eq), path: v.slice(eq + 1) })
    } else if (a === '--threshold') out.threshold = Number(argv[++i])
    else if (a === '--json') out.json = true
  }
  return out
}

function main() {
  const { prod, hmls, threshold, json } = parseArgs(process.argv)

  if (!prod || hmls.length === 0) {
    console.error('usage: diff-coverage.mjs --prod <diff> --hml <label>=<diff> [--hml …] [--threshold 90] [--json]')
    process.exit(2)
  }

  let prodLines, hmlSets
  try {
    prodLines = changedLines(readFileSync(prod, 'utf8'))
    hmlSets = hmls.map(({ label, path }) => ({ label, byPath: changedLines(readFileSync(path, 'utf8')) }))
  } catch (err) {
    console.error(`error reading diff: ${err.message}`)
    process.exit(2)
  }

  const result = coverage(prodLines, hmlSets)
  result.threshold = threshold
  result.acimaDoLimiar = result.coveragePct >= threshold
  result.prodChangeHash = changeHash(prodLines)

  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log(`PROD: ${result.totalLines} changed lines in ${prodLines.size} files`)
    console.log(`HML:  ${hmls.map((h) => h.label).join(', ')} (${hmlSets.reduce((n, h) => n + total(h.byPath), 0)} lines)`)
    console.log(`Coverage: ${result.coveragePct}%  (threshold ${threshold}%)`)
    console.log(result.exact ? 'EXACTLY EQUAL — no orphan lines' : `Orphans: ${result.orphanCount} lines`)
    for (const o of result.orphans) console.log(`  - ${o.path}: ${o.count}`)
    for (const [label, lines] of Object.entries(result.onlyFrom)) {
      console.log(`  covered ONLY by #${label}: ${lines.length}`)
    }
  }

  process.exit(result.acimaDoLimiar ? 0 : 1)
}

if (process.argv[1]?.endsWith('diff-coverage.mjs')) main()

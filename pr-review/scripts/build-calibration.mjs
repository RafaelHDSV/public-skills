// Join collect-reviews.mjs raw output with local .reviews/ artifacts.
//
// Usage (any cwd — the skill directory is this file's parent):
//   node <skill-dir>/scripts/build-calibration.mjs <run-id.json>
//
// Prints comparison JSON on stdout; the agent writes the markdown.
//
// Variables:
//   REVIEWS_DIR            skill root (default: this file's parent directory)
//   REVIEWS_ARTIFACTS_DIR  artifact base dir (default: .reviews relative to cwd)
//   SINCE                  overrides the raw window (ISO or YYYY-MM-DD)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rawArg = process.argv[2]
if (!rawArg) {
  console.error('usage: node build-calibration.mjs <run-id.json>')
  process.exit(1)
}

const SKILL_DIR =
  process.env.REVIEWS_DIR ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RAW_DIR = path.join(SKILL_DIR, '.raw')
const REVIEWS_ROOT = process.env.REVIEWS_ARTIFACTS_DIR ?? path.join(process.cwd(), '.reviews')

const rawPath = path.isAbsolute(rawArg) ? rawArg : path.join(RAW_DIR, rawArg)
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'))

// Reviews older than `since` belong to past runs: collect-reviews filters
// PRs by `updated`, not reviews by `submitted_at`.
const since = process.env.SINCE ?? raw.since ?? ''

// Artifact index: the .reviews/ root **and** monthly files under .reviews/MM-YYYY/.
// .reviews/logs/ is never an artifact directory.
function indexArtifacts(root) {
  if (!fs.existsSync(root)) return []
  const found = []
  const collect = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.md'))
        found.push({ name: entry.name, full: path.join(dir, entry.name) })
    }
  }
  collect(root)
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== 'logs')
      collect(path.join(root, entry.name))
  }
  return found
}

const ARTIFACTS = indexArtifacts(REVIEWS_ROOT)

function listLocalArtifact(repoSlug, prNumber) {
  const suffix = `-${repoSlug}-pr-${prNumber}.md`
  // Newest = highest YYYY-MM-DD-HH-MM-SS prefix in the filename (the Flows A/B rule).
  const matches = ARTIFACTS.filter((a) => a.name.endsWith(suffix)).sort((a, b) =>
    a.name < b.name ? 1 : -1
  )
  return matches[0]?.full ?? null
}

function parseLocalVerdict(text) {
  const m = text.match(/(?:Preliminary verdict|Veredito preliminar)[^\n]*\|\s*`([^`]+)`/)
  return m?.[1] ?? null
}

function parseLocalFindings(text) {
  const rcs = [...text.matchAll(/^#{2,4}\s*RC-\d+/gm)].length
  const mels = [...text.matchAll(/^#{2,4}\s*MEL-\d+/gm)].length
  return { rcs, mels }
}

// CHANGES_REQUESTED -> fix -> APPROVED is normal. Pairing the local artifact
// with only the newest review would count that cycle as a divergence.
function classify(localVerdict, states) {
  if (!localVerdict) return 'veredito_indeterminado'
  const hadChangesRequested = states.includes('CHANGES_REQUESTED')
  const hadApproved = states.includes('APPROVED')

  if (localVerdict === 'request_changes') {
    if (hadChangesRequested) return 'veredito_alinhado'
    return hadApproved ? 'diverge_estrito' : 'veredito_inconclusivo'
  }
  if (localVerdict.startsWith('approve') || localVerdict.startsWith('aprovar')) {
    if (hadChangesRequested) return 'diverge_leniente'
    return hadApproved ? 'veredito_alinhado' : 'veredito_inconclusivo'
  }
  return 'veredito_inconclusivo'
}

const comparisons = []

for (const pr of raw.prs) {
  const inWindow = (pr.reviews ?? []).filter(
    (r) => !since || (r.submittedAt ?? '') >= since
  )
  if (!inWindow.length) continue

  const states = inWindow.map((r) => r.state)
  const latestReview = [...inWindow].sort((a, b) =>
    a.submittedAt < b.submittedAt ? 1 : -1
  )[0]

  const repoSlug = pr.repo
  const localPath = listLocalArtifact(repoSlug, pr.number)

  if (!localPath) {
    comparisons.push({
      repo: `${pr.owner}/${pr.repo}`,
      number: pr.number,
      url: pr.url,
      category: 'sem_artefato_local',
      githubStates: states,
      githubState: latestReview?.state,
    })
    continue
  }

  const localText = fs.readFileSync(localPath, 'utf8')
  const localVerdict = parseLocalVerdict(localText)
  const findings = parseLocalFindings(localText)

  comparisons.push({
    repo: `${pr.owner}/${pr.repo}`,
    number: pr.number,
    url: pr.url,
    localPath,
    archived: path.dirname(localPath) !== path.resolve(REVIEWS_ROOT),
    localVerdict,
    githubStates: states,
    githubState: latestReview?.state,
    githubSubmittedAt: latestReview?.submittedAt,
    hadChangesRequested: states.includes('CHANGES_REQUESTED'),
    localRcs: findings.rcs,
    localMels: findings.mels,
    githubCommentCount: pr.reviewComments?.length ?? 0,
    category: classify(localVerdict, states),
  })
}

const count = (c) => comparisons.filter((x) => x.category === c).length

const summary = {
  runId: raw.runId,
  since,
  reviewerLogin: raw.reviewerLogin,
  artifactsIndexed: ARTIFACTS.length,
  totalPrs: comparisons.length,
  vereditoAlinhado: count('veredito_alinhado'),
  divergeLeniente: count('diverge_leniente'),
  divergeEstrito: count('diverge_estrito'),
  vereditoDiverge: count('diverge_leniente') + count('diverge_estrito'),
  vereditoInconclusivo: count('veredito_inconclusivo'),
  vereditoIndeterminado: count('veredito_indeterminado'),
  semArtefatoLocal: count('sem_artefato_local'),
  comparisons,
}

console.log(JSON.stringify(summary, null, 2))

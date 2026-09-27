// Collect PRs reviewed by @me via gh search (read-only).
//
// Usage (any cwd — the skill directory is this file's parent):
//   node <skill-dir>/scripts/collect-reviews.mjs [since-YYYY-MM-DD]
//
// Writes <skill-dir>/.raw/<run-id>.json
//
// Variables:
//   REVIEWS_DIR  skill root (default: this file's parent directory)
//   RUN_ID       run id (default: compact ISO timestamp)
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const since =
  process.argv[2] ??
  new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)

const SKILL_DIR =
  process.env.REVIEWS_DIR ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RAW_DIR = path.join(SKILL_DIR, '.raw')
const runId =
  process.env.RUN_ID ??
  new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

fs.mkdirSync(RAW_DIR, { recursive: true })

function gh(args) {
  return JSON.parse(
    execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  )
}

function getMe() {
  return gh(['api', 'user']).login
}

function searchReviewedPrs(login, sinceDate) {
  return gh([
    'search',
    'prs',
    '--reviewed-by',
    login,
    `--updated=>${sinceDate}`,
    '--json',
    'number,title,updatedAt,url,repository',
    '--limit',
    '100',
  ])
}

function getReviews(owner, repo, number) {
  return gh([
    'api',
    `repos/${owner}/${repo}/pulls/${number}/reviews`,
    '--paginate',
  ])
}

function getReviewComments(owner, repo, number) {
  try {
    return gh([
      'api',
      `repos/${owner}/${repo}/pulls/${number}/comments`,
      '--paginate',
    ])
  } catch {
    return []
  }
}

const login = getMe()
const prs = searchReviewedPrs(login, since)

const payload = {
  runId,
  collectedAt: new Date().toISOString(),
  since,
  reviewerLogin: login,
  prs: [],
}

for (const pr of prs) {
  const owner = pr.repository.owner?.login
  const repo = pr.repository.name
  if (!owner || !repo) continue
  const reviews = getReviews(owner, repo, pr.number)
  const mine = reviews.filter(
    (r) =>
      r.user?.login === login &&
      ['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED'].includes(r.state)
  )
  if (!mine.length) continue

  payload.prs.push({
    owner,
    repo,
    number: pr.number,
    title: pr.title,
    url: pr.url,
    updatedAt: pr.updatedAt,
    reviews: mine.map((r) => ({
      id: r.id,
      state: r.state,
      body: r.body ?? '',
      submittedAt: r.submitted_at,
      commitId: r.commit_id,
    })),
    reviewComments: getReviewComments(owner, repo, pr.number).filter(
      (c) => c.user?.login === login
    ),
  })
}

const outPath = path.join(RAW_DIR, `${runId}.json`)
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8')
console.log(outPath)
console.log(JSON.stringify({ prs: payload.prs.length, since, login }))

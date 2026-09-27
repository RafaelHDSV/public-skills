#!/usr/bin/env node
// Publishes findings as a GitHub PENDING REVIEW — skill pr-review, --comment flag.
//
// Usage:
//   node $PR_REVIEW_SKILL/scripts/post-pending-review.mjs \
//     --repo AGX-Software/core --pr 9148 --commit <sha> --input <achados.json> [--dry-run]
//
//   Guard 1 alone, before any analysis (read-only):
//   node $PR_REVIEW_SKILL/scripts/post-pending-review.mjs --repo AGX-Software/core --pr 9148 --check-pending
//
// ============================== STRUCTURAL LOCK ==================================
// This script is NOT capable of submitting a review. The payload is built by buildPayload(),
// which constructs a literal object with exactly three keys — commit_id, body, comments.
// Nowhere in this file is "event" read from the input, and no code path adds it.
// Submitting would require editing the code, not passing an argument.
//
// Why: § 1.4 of CLAUDE.md allows commenting in a draft and nothing else. The verdict
// (APPROVE / REQUEST_CHANGES / COMMENT) belongs to the human reviewer, always. A lock that relies
// on the agent remembering the rule is a lock that fails the day a prompt insists.
// ==================================================================================

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const MARCA_PROIBIDA = /\b(ia|a\.?i\.?|intelig[eê]ncia artificial|agente|assistente|llm|copilot|claude|cursor|gerad[oa] automaticamente|autom[aá]tic[oa]mente gerad)/i
const VEREDITO_PROIBIDO = /\b(approve_with_notes|aprovar_com_ressalvas|request_changes|aprovar|approve|approved|reject|lgtm)\b/i

function gh(args, { allowFail = false } = {}) {
  try {
    return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  } catch (err) {
    if (allowFail) return null
    const body = err.stdout || err.stderr || err.message
    throw Object.assign(new Error(`gh ${args.slice(0, 3).join(' ')} failed: ${body}`), { ghOutput: body })
  }
}

/** Guard 1 — GitHub accepts only one pending review per user per PR. */
function pendingReviewExistente(repo, pr) {
  const raw = gh(['api', `repos/${repo}/pulls/${pr}/reviews`, '--paginate'], { allowFail: true })
  if (!raw) return null
  const mine = JSON.parse(raw).filter((r) => r.state === 'PENDING')
  return mine.length ? mine[0] : null
}

/** Guard 2 — the tip must not have moved since the analysis. */
function tipAtual(repo, pr) {
  const raw = gh(['pr', 'view', String(pr), '--repo', repo, '--json', 'headRefOid'])
  return JSON.parse(raw).headRefOid
}

/**
 * Guard 3 — anchor only to a line that exists in a diff hunk.
 * Returns Map<path, { right:Set<number>, left:Set<number> }>.
 */
export function linhasAncoraveis(diff) {
  const porArquivo = new Map()
  let path = null
  let velha = 0
  let nova = 0

  for (const raw of diff.replace(/\r\n/g, '\n').split('\n')) {
    const git = raw.match(/^diff --git .* b\/(.*)$/)
    if (git) {
      path = git[1]
      if (!porArquivo.has(path)) porArquivo.set(path, { right: new Set(), left: new Set() })
      continue
    }
    if (!path) continue

    const hunk = raw.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
    if (hunk) {
      velha = Number(hunk[1])
      nova = Number(hunk[2])
      continue
    }
    if (raw.startsWith('+++') || raw.startsWith('---')) continue

    const alvo = porArquivo.get(path)
    if (raw.startsWith('+')) alvo.right.add(nova++)
    else if (raw.startsWith('-')) alvo.left.add(velha++)
    else if (raw.startsWith(' ')) {
      alvo.right.add(nova++)
      velha++
    }
  }
  return porArquivo
}

/** Guard 4 — no origin mark and no verdict in the published text (§ 1.3 and § 1.4). */
function violacoesDeTexto(findings, body) {
  const out = []
  if (MARCA_PROIBIDA.test(body)) out.push('review body has an origin mark (§ 1.3)')
  if (VEREDITO_PROIBIDO.test(body)) out.push('review body has a verdict (§ 1.4)')
  for (const f of findings) {
    if (MARCA_PROIBIDA.test(f.body)) out.push(`${f.id}: origin mark in the comment (§ 1.3)`)
  }
  return out
}

/**
 * Builds the payload. Three keys, that is all.
 * No input field reaches the request without going through this function.
 */
export function buildPayload({ commitId, body, comments }) {
  return {
    commit_id: commitId,
    body,
    comments: comments.map((c) => ({
      path: c.path,
      line: c.line,
      side: c.side === 'LEFT' ? 'LEFT' : 'RIGHT',
      body: c.body,
    })),
  }
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? null : process.argv[i + 1]
}

function main() {
  const repo = arg('repo')
  const pr = arg('pr')
  const commitId = arg('commit')
  const input = arg('input')
  const dryRun = process.argv.includes('--dry-run')

  if (process.argv.includes('--check-pending')) {
    if (!repo || !pr) {
      console.error('usage: post-pending-review.mjs --repo <owner/repo> --pr <N> --check-pending')
      process.exit(2)
    }
    const pendente = pendingReviewExistente(repo, pr)
    console.log(JSON.stringify(pendente ? { ok: false, reason: 'pending_exists', reviewId: pendente.id } : { ok: true, pending: false }, null, 2))
    process.exit(pendente ? 1 : 0)
  }

  if (!repo || !pr || !commitId || !input) {
    console.error('usage: post-pending-review.mjs --repo <owner/repo> --pr <N> --commit <sha> --input <json> [--dry-run]')
    process.exit(2)
  }

  const dados = JSON.parse(readFileSync(input, 'utf8'))
  const findings = dados.findings ?? []
  let body = dados.body ?? ''

  // ---- guard 1
  const pendente = pendingReviewExistente(repo, pr)
  if (pendente) {
    console.log(JSON.stringify({ ok: false, reason: 'pending_exists', reviewId: pendente.id }, null, 2))
    process.exit(1)
  }

  // ---- guard 2
  const tip = tipAtual(repo, pr)
  if (tip !== commitId) {
    console.log(JSON.stringify({ ok: false, reason: 'head_moved', expected: commitId, actual: tip }, null, 2))
    process.exit(1)
  }

  // ---- guard 3
  const diff = gh(['pr', 'diff', String(pr), '--repo', repo])
  const ancoras = linhasAncoraveis(diff)
  const comments = []
  const semAncora = []

  for (const f of findings) {
    const alvo = f.path ? ancoras.get(f.path) : null
    const lado = f.side === 'LEFT' ? 'left' : 'right'
    if (alvo && f.line && alvo[lado].has(Number(f.line))) comments.push(f)
    else semAncora.push(f)
  }

  if (semAncora.length) {
    body += (body ? '\n\n' : '') + semAncora.map((f) => `**${f.path ?? 'general'}${f.line ? `:${f.line}` : ''}** — ${f.body}`).join('\n\n')
  }

  // ---- guard 4
  const violacoes = violacoesDeTexto(comments, body)
  if (violacoes.length) {
    console.log(JSON.stringify({ ok: false, reason: 'texto_proibido', violacoes }, null, 2))
    process.exit(1)
  }

  const payload = buildPayload({ commitId, body, comments })

  if (dryRun) {
    console.log(JSON.stringify({ ok: true, dryRun: true, temEvent: 'event' in payload, posted: comments.length, inBody: semAncora.length, payload }, null, 2))
    process.exit(0)
  }

  const dir = mkdtempSync(join(tmpdir(), 'pr-review-'))
  const file = join(dir, 'payload.json')
  writeFileSync(file, JSON.stringify(payload))

  let resposta
  try {
    resposta = JSON.parse(gh(['api', `repos/${repo}/pulls/${pr}/reviews`, '-X', 'POST', '--input', file]))
  } catch (err) {
    // process.exit below skips `finally`, so the payload is removed here too.
    rmSync(dir, { recursive: true, force: true })
    const texto = err.ghOutput ?? ''
    if (/one pending review/i.test(texto)) {
      console.log(JSON.stringify({ ok: false, reason: 'pending_exists' }, null, 2))
    } else if (/HTTP 403/.test(texto)) {
      console.log(JSON.stringify({ ok: false, reason: 'forbidden' }, null, 2))
    } else {
      console.log(JSON.stringify({ ok: false, reason: 'erro', detalhe: texto.slice(0, 400) }, null, 2))
    }
    process.exit(1)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        reviewId: resposta.id,
        state: resposta.state,
        posted: comments.length,
        inBody: semAncora.length,
        skipped: [],
      },
      null,
      2,
    ),
  )
}

if (process.argv[1]?.endsWith('post-pending-review.mjs')) main()

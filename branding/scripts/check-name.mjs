#!/usr/bin/env node
/**
 * Name availability signals — domains, deploy slug, handles, holder identity.
 *
 * Failure mode: an earlier version checked only the hosts someone remembered to
 * type, and stopped at DNS. The product's exact name went unchecked.
 *
 * What this does instead:
 *   - The TLD ladder comes from the NAME, not from a hand-written list. Given
 *     "Aurora" it always checks aurora.com, .com.br, .app, .dev, .io and the
 *     deploy slug. "I forgot to check the .com" is no longer possible.
 *   - RDAP instead of DNS. DNS only says it resolves; RDAP says WHO registered
 *     it and WHEN. "Taken" with no owner is a useless fact — the guide has to
 *     show the domain was analysed, not merely that it is out of reach.
 *   - A national registry (here, .br) returns the registrant with a company ID
 *     in the handle. It is the cheapest answer to "is there a company with this
 *     name in that country?".
 *   - GitHub and npm are included because a dev-tool name that is already a
 *     package or an org is a real conflict, and both answer 404 cleanly.
 *
 * Instagram is deliberately absent: logged out, the platform returns 200 and
 * identical HTML for a free handle and a taken one, so any reading would be
 * invented. Social handles and trademarks come from the WebSearch pass in
 * references/name-validation.md.
 *
 * Network: rdap.org, the national RDAP endpoint, api.github.com,
 * registry.npmjs.org, and the home page of any registered domain (to read its
 * <title>). No credentials.
 *
 * Usage:
 *   node check-name.mjs Aurora
 *   node check-name.mjs Aurora --slug=aurora-daily
 *   node check-name.mjs Aurora --suggest=10   # plus a ladder of free candidates
 *   node check-name.mjs Aurora --json
 */

const DEFAULT_TLDS = ['com', 'com.br', 'app', 'dev', 'io']

// --- suggesting free domains -----------------------------------------------
// Failure mode: the exact ladder answers "is the name taken?" and for a good
// name the answer is almost always yes, so the Naming section shipped six rows
// of TAKEN and no way out.
// A diagnosis is not a decision: the guide also has to show where you can
// register. Candidates come out in order of desirability and the search stops
// as soon as it has the requested number of free names.
const SUGGEST_TLDS = ['io', 'sh', 'tools', 'co', 'net', 'page', 'run', 'me']
const SUGGEST_PREFIXES = ['get', 'use', 'try', 'meu']
const SUGGEST_SUFFIXES = ['app', 'hq', 'kit', 'hub', 'tool']
const STRONG_TLDS = ['com', 'com.br', 'app', 'dev']

/** Candidates in order of desirability: the exact name first, then prefixes,
 *  then suffixes. Inside each group, strong TLDs before exotic ones. */
function suggestionLadder(label, ladderAlreadyChecked) {
  const seen = new Set(ladderAlreadyChecked)
  const out = []
  const push = (domain, shape) => {
    if (seen.has(domain)) return
    seen.add(domain)
    out.push({ domain, shape })
  }

  for (const t of SUGGEST_TLDS) push(`${label}.${t}`, 'exact name')
  for (const t of STRONG_TLDS) for (const p of SUGGEST_PREFIXES) push(`${p}${label}.${t}`, `prefix ${p}`)
  for (const t of STRONG_TLDS) for (const s of SUGGEST_SUFFIXES) push(`${label}${s}.${t}`, `suffix ${s}`)

  return out
}
const RDAP_HEADERS = { accept: 'application/rdap+json', 'user-agent': 'brand-check/1.0' }
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
const TIMEOUT = 15000
const CONCURRENCY = 6

/** "Aurora Daily" -> "auroradaily"; used as the domain label and handle. */
function slugify(name, { keepDash = false } = {}) {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
  return keepDash ? base.replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') : base.replace(/[^a-z0-9]+/g, '')
}

async function get(url, { headers = {}, method = 'GET' } = {}) {
  return fetch(url, {
    method,
    redirect: 'follow',
    headers: { 'user-agent': UA, ...headers },
    signal: AbortSignal.timeout(TIMEOUT),
  })
}

function vcardField(entity, field) {
  const arr = entity?.vcardArray?.[1]
  if (!Array.isArray(arr)) return undefined
  const hit = arr.find((x) => x[0] === field)
  return hit?.[3]
}

function rdapHolder(json) {
  const entities = Array.isArray(json.entities) ? json.entities : []
  const registrant = entities.find((e) => (e.roles || []).includes('registrant'))
  const registrar = entities.find((e) => (e.roles || []).includes('registrar'))

  const holder = vcardField(registrant, 'fn')
  const registrarName = vcardField(registrar, 'fn')
  // Some national registries publish the holder's company ID in the handle.
  const doc = registrant?.handle && /^\d{11,14}$/.test(registrant.handle) ? registrant.handle : undefined
  const created = (json.events || []).find((e) => e.eventAction === 'registration')?.eventDate

  return { holder, registrarName, doc, created: created ? created.slice(0, 10) : undefined }
}

function formatCnpj(d) {
  if (!d || d.length !== 14) return d
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

/** The home page title — visible proof that someone is using the domain. */
async function siteTitle(domain) {
  try {
    const res = await get(`https://${domain}/`)
    if (!res.ok) return undefined
    const html = (await res.text()).slice(0, 60000)
    const raw = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    if (!raw) return undefined
    const text = raw.replace(/\s+/g, ' ').trim()
    return text ? text.slice(0, 70) : undefined
  } catch {
    return undefined
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function checkDomain(domain, attempt = 0) {
  const endpoints = domain.endsWith('.br')
    ? [`https://rdap.registro.br/domain/${domain}`, `https://rdap.org/domain/${domain}`]
    : [`https://rdap.org/domain/${domain}`]

  for (const url of endpoints) {
    try {
      const res = await get(url, { headers: RDAP_HEADERS })

      if (res.status === 404) {
        return { kind: 'domain', target: domain, signal: 'free', detail: 'no RDAP record' }
      }

      // Public RDAP rate-limits bursts. In a batch that becomes "unknown"
      // everywhere, and the guide goes back to publishing rows with no signal —
      // exactly what the skill forbids.
      if (res.status === 429 || res.status >= 500) {
        if (attempt < 3) {
          await sleep(1500 * (attempt + 1))
          return checkDomain(domain, attempt + 1)
        }
      }

      const ct = res.headers.get('content-type') || ''
      if (!res.ok || !ct.includes('json')) continue

      const json = await res.json()
      const { holder, registrarName, doc, created } = rdapHolder(json)
      const title = await siteTitle(domain)

      const parts = []
      if (holder) parts.push(doc ? `${holder} (ID ${formatCnpj(doc)})` : holder)
      else if (registrarName) parts.push(`via ${registrarName}`)
      if (created) parts.push(`since ${created}`)
      if (title) parts.push(`site: "${title}"`)

      return {
        kind: 'domain',
        target: domain,
        signal: 'taken',
        detail: parts.join(' · ') || 'registered (RDAP publishes no holder)',
      }
    } catch {
      /* try the next endpoint */
    }
  }

  if (attempt < 3) {
    await sleep(1500 * (attempt + 1))
    return checkDomain(domain, attempt + 1)
  }

  return { kind: 'domain', target: domain, signal: 'unknown', detail: 'RDAP did not answer' }
}

async function checkVercel(host) {
  try {
    const res = await get(`https://${host}`, { method: 'HEAD' })
    const err = res.headers.get('x-vercel-error') || ''

    if (res.status === 404 && err.includes('DEPLOYMENT_NOT_FOUND')) {
      return { kind: 'deploy', target: host, signal: 'free', detail: 'no deployment' }
    }
    if (res.ok) {
      const title = await siteTitle(host)
      return { kind: 'deploy', target: host, signal: 'taken', detail: title ? `live deployment · "${title}"` : 'live deployment' }
    }
    return { kind: 'deploy', target: host, signal: 'unknown', detail: `HTTP ${res.status}${err ? ` (${err})` : ''}` }
  } catch (e) {
    return { kind: 'deploy', target: host, signal: 'unknown', detail: e.message || 'network failure' }
  }
}

async function checkGithub(handle) {
  try {
    const res = await get(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
      headers: { accept: 'application/vnd.github+json' },
    })
    if (res.status === 404) return { kind: 'handle', target: `github.com/${handle}`, signal: 'free', detail: 'no account' }
    if (!res.ok) return { kind: 'handle', target: `github.com/${handle}`, signal: 'unknown', detail: `HTTP ${res.status}` }

    const json = await res.json()
    const who = [json.type, json.name].filter(Boolean).join(' · ')
    return { kind: 'handle', target: `github.com/${handle}`, signal: 'taken', detail: who || 'account exists' }
  } catch (e) {
    return { kind: 'handle', target: `github.com/${handle}`, signal: 'unknown', detail: e.message || 'network failure' }
  }
}

async function checkNpm(pkg) {
  try {
    const res = await get(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`)
    if (res.status === 404) return { kind: 'package', target: `npm/${pkg}`, signal: 'free', detail: 'no package' }
    if (!res.ok) return { kind: 'package', target: `npm/${pkg}`, signal: 'unknown', detail: `HTTP ${res.status}` }

    const json = await res.json()
    const desc = (json.description || '').replace(/\s+/g, ' ').slice(0, 60)
    return { kind: 'package', target: `npm/${pkg}`, signal: 'taken', detail: desc || 'package published' }
  } catch (e) {
    return { kind: 'package', target: `npm/${pkg}`, signal: 'unknown', detail: e.message || 'network failure' }
  }
}

async function pooled(items, worker, limit = CONCURRENCY) {
  const out = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      out[i] = await worker(items[i])
    }
  })
  await Promise.all(runners)
  return out
}

function parseArgs(argv) {
  const flags = {}
  const positional = []
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=')
      flags[k] = v === undefined ? true : v
    } else positional.push(a)
  }
  return { flags, positional }
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2))
  const brand = positional[0]

  if (!brand) {
    console.error('usage: node check-name.mjs <Brand> [--slug=<slug>] [--tlds=com,app] [--extra=a.com,b.io] [--suggest=N] [--json]')
    process.exit(2)
  }

  const label = slugify(brand)
  const slug = flags.slug ? slugify(String(flags.slug), { keepDash: true }) : label
  const tlds = flags.tlds ? String(flags.tlds).split(',').map((t) => t.trim()).filter(Boolean) : DEFAULT_TLDS
  const extra = flags.extra ? String(flags.extra).split(',').map((d) => d.trim().toLowerCase()).filter(Boolean) : []

  const domains = [...new Set([...tlds.map((t) => `${label}.${t}`), ...extra])]
  const vercelHosts = [...new Set([`${label}.vercel.app`, `${slug}.vercel.app`])]

  const jobs = [
    ...domains.map((d) => () => checkDomain(d)),
    ...vercelHosts.map((h) => () => checkVercel(h)),
    () => checkGithub(label),
    () => checkNpm(label),
  ]

  const results = await pooled(jobs, (job) => job())

  // --suggest=N: walk the ladder until N free domains are found. It exits
  // early on purpose — checking 40 candidates to display 8 wastes RDAP calls.
  const wantFree = flags.suggest === true ? 8 : Number(flags.suggest || 0)
  const suggestions = []
  if (wantFree > 0) {
    const ladder = suggestionLadder(label, domains)
    let free = 0
    for (let i = 0; i < ladder.length && free < wantFree; i += CONCURRENCY) {
      const wave = ladder.slice(i, i + CONCURRENCY)
      const checked = await pooled(wave, (c) => checkDomain(c.domain).then((r) => ({ ...r, shape: c.shape })))
      for (const r of checked) {
        suggestions.push(r)
        if (r.signal === 'free') free++
      }
    }
  }

  if (flags.json) {
    console.log(JSON.stringify({ brand, label, slug, checkedAt: new Date().toISOString(), results, suggestions }, null, 2))
    return
  }

  const badge = { free: 'FREE', taken: 'TAKEN', unknown: '?' }
  for (const r of results) {
    console.log(`${badge[r.signal].padEnd(8)} ${r.target.padEnd(30)} ${r.detail}`)
  }

  if (suggestions.length) {
    const free = suggestions.filter((r) => r.signal === 'free')
    console.log(`\n--- available (${free.length} of ${suggestions.length} candidates checked) ---`)
    for (const r of free) console.log(`FREE     ${r.target.padEnd(30)} ${r.shape}`)
    const blocked = results.filter((r) => r.signal === 'taken').length
    if (free.length <= blocked) {
      console.log(`\nWARNING: ${free.length} free against ${blocked} taken — raise --suggest so the Naming section ends with more ways out than dead ends.`)
    }
  }

  console.log('\nSignals, not clearance. Trademark and social handles: the WebSearch pass in name-validation.md.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

# Name validation — domains, deploy slug, handles, company, trademark

The agent **produces signals**; it does **not** give legal clearance. But an unchecked signal
is not a signal: every row in the guide's table comes from a check that actually ran, with a date.

> **Failure mode:** a batch shipped with "signal not verified in this batch" in the only two
> rows of the Naming section — a brand guide that never looked at the name.
> **Why this file exists:** the check is cheap and the omission is invisible.

## Rule 1 — the exact name, always

The product is called Aurora → the guide shows `aurora.com`, `aurora.com.br`, `aurora.app`,
`aurora.dev`, `aurora.io`, `aurora.vercel.app`. **Taken is a result, not a reason to omit.**
The reader needs to see that the `.com` of the name was analysed and belongs to someone else —
that is exactly the fact that decides whether the name survives.

Qualified variants (`get<name>.com`, `<name>app.com`, `<slug>.vercel.app`) come **in addition
to** the exact ladder, never instead of it.

## Rule 2 — four candidates, each checked on its own

The section ships **four selectable names**, one per quadrant of
[naming-candidates.md](naming-candidates.md). Every one carries **its own** availability data:
a shared or assumed row is the same lie as an unchecked one.

**Every candidate gets the exact ladder plus `--suggest`, coined ones included.**

The first version of this rule exempted coined names, reasoning that a taken coined name *is*
the finding. Measured on a batch of 60 (2026-09-15), that exemption put **13 of 30** coined
candidates below Rule 3 — `Sigill` came back 3 free against 5 taken with nothing to register.
The exemption assumed nobody had thought of the word. Somebody usually has.

## Rule 3 — more ways out than dead ends

The exact ladder answers *"is the name taken?"* and, for a good name, the answer is almost
always yes. Six rows of TAKEN is a diagnosis, not a decision — the reader closes the section
knowing the name is contested and with nowhere to register.

**Free rows must outnumber taken ones for every candidate, not just the one on top.** The page
lets the reader stand on any of the four; a candidate with no way out is a dead end wearing a
card. If the count fails, the search did not go far enough: raise `--suggest` and run again.

`unknown` is a rate-limit scar, not a signal. A candidate that comes back with two or more
`unknown` rows was throttled — wait and re-run that one alone, and keep the new record only if
it is **less** unknown than the old. Retrying into the same throttle must not overwrite a good
answer with a worse one.

The suggestion ladder comes out in order of desirability and stops as soon as it has the
requested number of free names — checking 40 candidates to display 8 wastes RDAP calls.

| Order | Shape | Example |
|-------|-------|---------|
| 1 | **Exact name** on a TLD beyond the ladder | `aurora.sh`, `aurora.co`, `aurora.me`, `aurora.page` |
| 2 | **Prefix** on a strong TLD | `getaurora.com.br`, `myaurora.app`, `tryaurora.dev` |
| 3 | **Suffix** on a strong TLD | `aurorahq.com`, `aurorakit.dev` |

The exact name on a secondary TLD beats a prefix on a strong one: what you preserve is the
word, because the word is what people type from memory.

## What runs

```bash
node "$BRANDING_SKILL/scripts/check-name.mjs" Aurora --slug=aurora-daily
node "$BRANDING_SKILL/scripts/check-name.mjs" Aurora --suggest=10
node "$BRANDING_SKILL/scripts/check-name.mjs" Aurora --suggest=10 --json
```

| Layer | Source | Signal |
|-------|--------|--------|
| **Domain** | RDAP (`rdap.org`; `.br` via `rdap.registro.br`) | 404 = free · 200 = taken **plus holder, registrar and date** |
| **Company / national ID** | RDAP from the `.br` registry — the `registrant` handle is the company ID | Legal name and formatted ID of whoever holds the `.com.br` |
| **Site in use** | GET on a taken domain's home page, reading `<title>` | Shows who already uses the name publicly |
| **Deploy** | HEAD on `*.vercel.app` | `DEPLOYMENT_NOT_FOUND` = free · 200 = live deployment |
| **GitHub** | `api.github.com/users/<name>` | 404 = free · 200 = User/Organization + name |
| **npm** | `registry.npmjs.org/<name>` | 404 = free · 200 = package description |

RDAP instead of DNS, because DNS only says it resolves. "Taken" with no owner is a useless
fact; the guide has to show **who** took it. A `.com.br` held by a food company since 1996 is a
naming decision, not a log line.

## What the script does not do — and why

| Surface | Situation | Route |
|---------|-----------|-------|
| **Instagram** | Logged out, the platform returns **200 and identical HTML** for a free handle and a taken one. Any automatic reading would be invented | `WebSearch` (below) plus manual confirmation |
| **Trademark registry** | Most national registries need a session; no public API | `WebSearch` plus a link to the manual search |
| **Company by name** | There is no public search for a company **by name**, only by registration number | The ID from the `.com.br` above, plus `WebSearch` |

Inventing a signal is worse than declaring the gap. Where there is no check, the row says
`not automatically verifiable` **with the link to the manual check** — never "not verified".

## The WebSearch pass (required, one per name)

After the script, one search per chosen name. Target: category conflict, social handle,
registered trademark.

```
"<Name>" software            → a namesake product in the same category
"<Name>" trademark           → a known registration or dispute
instagram.com/<name>         → an existing profile, and whose
```

Record **only what appeared**. No relevant result is itself a result: the row becomes
`no apparent conflict in the category`, with the date. "No legal risk" and "trademark free"
stay forbidden — the agent cannot assert that.

## Tables in `BRAND.html` (Naming section)

Three tables: the exact ladder, what is available, and the conflict surface.

**Availability — `aurora` · checked 2026-09-14**

| Target | Signal | Who / detail |
|--------|--------|--------------|
| `aurora.com` | Taken | via MarkMonitor · since 1989 · "Vistance Networks" |
| `aurora.com.br` | Taken | AURORA BEBIDAS E ALIMENTOS FINOS LTDA · ID 61.296.646/0001-52 |
| `aurora.io` | **Free** | No RDAP record |
| `aurora-daily.vercel.app` | **Free** | No deployment |

**Available — where you can register today**

| Domain | Shape | Why it qualifies |
|--------|-------|------------------|
| `aurora.sh` | exact name | Word intact; developers read `.sh` as a tool |
| `aurora.co` | exact name | Word intact; a short, accepted stand-in for `.com` |
| `getaurora.com.br` | prefix | Legible name on the national TLD |

**Name conflict — searched 2026-09-14**

| Surface | Signal | Finding |
|---------|--------|---------|
| GitHub | Taken | `github.com/aurora` — User |
| npm | Taken | `aurora` published — an ECS game engine |
| Instagram | Not verifiable | Same HTML logged out for free and taken — link out to `instagram.com/aurora` |
| Company / national ID | Incorporated | `AURORA BEBIDAS E ALIMENTOS FINOS LTDA (ID 61.296.646/0001-52)` — holder of `aurora.com.br` |
| Commercial use seen | 2 sites live | `aurora.dev` — "Aurora: dynamic link previews" |

The last two rows come out of the availability data the script already collected, not out of a
second search: a registrant with a company ID is the strongest evidence of an incorporated
business on the name, and a `<title>` on a taken domain is the strongest evidence that the name
is in commercial use. Both are **evidence rows, not verdicts** — neither is a trademark search,
and the row says so.

One footer line for the whole document, never per section:
*Availability signals · not a substitute for a registrar or a trademark office.*

## Quality gate

- [ ] `check-name.mjs` ran on the product's **exact name**, not only variants
- [ ] Every row has a real signal and a date — none says "not verified"
- [ ] A taken domain shows **who** holds it (registrant, registrar, or the site title)
- [ ] A taken national domain carries the company name and ID when the registry publishes it
- [ ] `WebSearch` ran for category, social handle and trademark; findings are in the conflict table
- [ ] A gap is declared as a gap, with the link to the manual check
- [ ] The **Available** table is present, with `--suggest` set high enough
- [ ] **Free rows outnumber taken rows for every candidate**, coined ones included
- [ ] No candidate carries two or more `unknown` rows — those were throttled, not checked
- [ ] Enum values from the script are localised in the artifact (`no RDAP record` → the
      product's language); registrant names, page titles and package descriptions are quoted
      **verbatim**, because translating a quote invents evidence
- [ ] One disclaimer, in the footer

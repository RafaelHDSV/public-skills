---
name: logo
description: >-
  Use when creating logos, marks, favicons, wordmarks or brand symbols.
  Triggers: logo, mark, favicon, brand symbol, /logo strategy, /logo roundtable,
  /logo master, /logo expand. Produces a set of at least 6 authored SVG marks
  spanning 3 silhouette families, a favicon, and a lockup pair whose wordmark is
  real type — never hand-drawn letters. Not a full brand guide; that is skill
  branding.
license: MIT
metadata:
  author: RafaelHDSV
---

> **Self-contained.** Every script here is Node stdlib only — no npm install, no file outside
> this skill directory. `$LOGO_SKILL` below means this skill's own directory; substitute the
> real path when you run a command.
>
> **Network:** nothing by default. `make-lockup.mjs` fetches a woff2 subset from
> `fonts.googleapis.com`. The optional roundtable reaches whichever image provider you enable.
> No credentials are required for the default path.
>
> **Chrome:** optional. Rendering scripts use headless Chrome when present (`CHROME_PATH`, or
> the usual install locations) and otherwise write the HTML and tell you to open it yourself.
>
> **Language:** these instructions and templates are English. The brand artifact follows the
> product's audience.

# Logo — strategy-first authoring with a look gate

> **Provenance.** Shape only, no copied file, from
> [logo-generator](https://github.com/op7418/logo-generator-skill) (op7418; README states MIT, there is
> no `LICENSE` file) and
> [logo-creator](https://github.com/ReScienceLab/opc-skills/tree/main/skills/logo-creator)
> (ReScienceLab/opc-skills, Apache-2.0, no `NOTICE`). Checked 27/09/2026. Detail:
> [references/sources.md](references/sources.md).

**Core rule:** a good mark comes from a **concept**, not from a competition between generators.
The master is **always** an authored geometric SVG. The agent orchestrates; it never invents a
pictorial master without an approved Direction and a named referent.

## The path

```
1. Strategy Workshop → strategy.yaml + logo-directions.md
   STOP — human approves approved_directions
2. mark-brief.md — inherits avoid/keywords from the Direction; specific_referent required
3. Author the set: >=6 marks, >=3 silhouette families, ONE ROUTE EACH
   references/mark-construction.md · references/rebuild-checklist.md
4. render-contact-sheet.mjs → OPEN THE PNG AND LOOK
   No score counts before this step.
5. logo-critic.md hard gate
   memorability>=7, uniqueness>=7, favicon>=6, legibility>=7,
   set_range>=6, icon_set_test <=1 library shape, wordmark_read == brand_name
6. verify-logo.mjs → render-preview.mjs → stranger-prompt.mjs
   STOP — human approves the master
7. expand — favicon, lockup + light twin, handoff.yaml
```

**Forbidden:** a pictorial master with no `approved_directions` and no `specific_referent`.
**Forbidden on the happy path:** auto-tracing PNG → SVG (`traced-from` is legacy only).

### Why authoring is the default, not a roundtable

> **Failure mode:** the documented default required external image generators behind accounts
> and MCP servers, so in practice every run took the escape hatch instead — and the escape
> hatch was described as a compromise.
> **Why this rule exists:** the master is an authored rebuild either way. External sketches are
> a mood board, never the deliverable. The step that actually catches defects is step 4.

`/logo roundtable` still exists as an **optional exploration step between 2 and 3**, for when
you have a provider and want visual reference before drawing. See
[references/providers.md](references/providers.md). It changes nothing downstream.

## Invocation modes

| Mode | Trigger | Delivers |
|------|---------|----------|
| **`strategy`** | `/logo strategy`, or `/logo` with no strategy yet | `strategy.yaml` + `logo-directions.md` + STOP |
| **`brief`** | `/logo brief` | `mark-brief.md` (requires approved strategy) |
| **`roundtable`** | `/logo roundtable` — **optional** | Provider grid + `roundtable.html` |
| **`master`** | default continuation | Authored set → look → Critic → verify |
| **`expand`** | after master approval | favicon, lockup + light twin, `handoff.yaml` |
| **`legacy`** | explicit only | SVG/trace with no strategy — **not recommended** |

### `--no-stop` — running without a human present

Add `--no-stop` to run the same path with the agent standing in for the human gates. It does
**not** skip steps: the contact sheet is still rendered and looked at, the Critic still runs,
the verifier still has to come back clean.

It buys skipping the **wait** at the two STOPs, agent-chosen Directions marked provisional,
and many projects in one pass. It never buys skipping step 4, the Critic, the verifier or
`specific_referent`.

Record in `strategy.yaml`: `auto_approved: true` and `human_review_owed: true`. Say so once in
the chat summary. **Never** write it into the brand guide — that is process, not identity.

> **Failure mode:** a batch with no sanctioned human-free path invented a bypass flag and, with
> it, skipped the roundtable, the Critic, the verifier and the preview — all at once, across
> every project.
> **Why this rule exists:** a gate with no route for batch is a gate that gets routed around.

When several projects run in one pass, finish with **one contact sheet holding all of them**:

```bash
node "$LOGO_SKILL/scripts/render-contact-sheet.mjs" sheet.png <dir1> <dir2> ... --mode=marks
node "$LOGO_SKILL/scripts/render-contact-sheet.mjs" lockups.png <dirs...> --mode=lockup
```

A silhouette repeated across projects only shows up this way. Project by project, each one passes.

## How many marks the set ships

**At least 6 marks**, spanning **≥3 silhouette families** (`gestaltFamily` in
[scripts/verify-logo.mjs](scripts/verify-logo.mjs): `axis-blocks`, `stroked-line`,
`curved-solid`, `single-blob`, `ring`). Three is not a set — it is the recommendation plus two
footnotes, and three marks fail `set_range` on their own.

| Rule | Why |
|------|-----|
| ≥6 marks | The brand guide lets the reader promote any of them; three gives nothing to compare |
| ≥3 families | A different family forces a different **conceptual route**, not the same shape repainted |
| No family over half the set | That is the `set_range` gate; above it the Critic must answer from the contact sheet |
| One reason line per mark | An alternative with no reason is filler — the line ships in `handoff.yaml` |

**A different family is not a different mark.** Redrawing the same sunrise with a stroke
instead of a fill changes the family and not the idea. Each mark needs its own **route** to the
referent: the sky, the window that frames it, the sheet it produces — three objects, not three
finishes.

## Strategy Workshop (blocking)

Templates: [references/strategy.template.yaml](references/strategy.template.yaml),
[references/logo-directions.template.md](references/logo-directions.template.md).

Minimum questions: brand (name, category, audience), positioning 1–10, `brand_keywords`,
`avoid` (sector clichés). Produce 4 Directions (title + concept + cues/anti-cues). Only then
move on.

## Scripts

```bash
# Look before judging — accepts many dirs; --mode=marks|tiny|lockup|letter
node "$LOGO_SKILL/scripts/render-contact-sheet.mjs" <out.png> <logo-dir...> [--mode=lockup]

# Lockup — the wordmark is correct by construction (NEVER draw letters)
node "$LOGO_SKILL/scripts/make-lockup.mjs" <logo-dir> \
  --name=<Brand> --mark=logo-v1-<gestalt>.svg \
  --font-query="<family>" --ink=<light> --ink-light=<dark>

# After authoring, before shipping. --bg is the DARK surface, --bg-light the
# light one; a -light file is graded against the light surface.
node "$LOGO_SKILL/scripts/verify-logo.mjs" <logo-dir> [BRAND.html] [--bg=#141A22] [--bg-light=#FFFFFF]
node "$LOGO_SKILL/scripts/render-preview.mjs" <logo-dir> --out=<logo-dir>/preview.png
node "$LOGO_SKILL/scripts/stranger-prompt.mjs" <logo-dir> --brief-noun=<noun>

# Optional exploration only
node "$LOGO_SKILL/scripts/roundtable-prompt.mjs" <logo-dir>
node "$LOGO_SKILL/scripts/roundtable-pollinations.mjs" <logo-dir>
node "$LOGO_SKILL/scripts/render-roundtable.mjs" <logo-dir>
```

**The step that cannot be skipped** is `render-contact-sheet.mjs` and **opening the PNG**.

> **Failure mode:** fifteen lockups spelled `PIMDL`, `IRALP` and `OFPFNNRO` and passed the
> verifier with zero FAIL. Later, four stroke marks read as `H`, `A`, `U` and a user icon —
> also zero FAIL.
> **Why this rule exists:** no geometric check reads a letter or a meaning. One look caught all
> of them at once. The verifier narrows where to look; it does not replace looking.

## Required read order

1. [references/logo-critic.md](references/logo-critic.md) — thresholds and human tests
2. [references/wordmark.md](references/wordmark.md) — **before any lockup**
3. [references/mark-construction.md](references/mark-construction.md) — type, principles, drawing order
4. [references/rebuild-checklist.md](references/rebuild-checklist.md)
5. [references/calibration-profile.md](references/calibration-profile.md)
6. [references/mark-proof.md](references/mark-proof.md) — how to prove a mark survives
7. [references/failure-atlas.md](references/failure-atlas.md) — on redraw
8. [references/providers.md](references/providers.md) — only for the optional roundtable
9. [references/trace-checklist.md](references/trace-checklist.md) — legacy only

## Human gates

```yaml
# After the workshop:
approved_directions: [A, B, C]
```

In chat: `approved directions A B C`, then `approved master`. With `--no-stop`, the agent
records `auto_approved: true` instead and says so once.

## Target files

```
<logo-dir>/
  strategy.yaml
  logo-directions.md
  mark-brief.md
  logo-v<N>-<gestalt>.svg    >= 6, >= 3 silhouette families
  favicon.svg
  logo-lockup.svg + logo-lockup-light.svg          the primary name
  logo-lockup--<slug>.svg + ...--<slug>-light.svg  one pair per extra name
  logo-critic.md
  handoff.yaml
  contact-sheet.png          the PNG that was actually looked at
  preview.png
  wordmark-proof.txt         custom-lettering route only
  sketches/                  optional roundtable only
```

`handoff.yaml` is the interface. Skill `branding` — and anything else consuming this set —
reads it and nothing deeper:

```yaml
recommended: logo-v1-horizon-rise.svg
referent: "The first band of light above the horizon line, seen from a window."
alternatives:
  - file: logo-v7-window-sill.svg
    route: "the dawn framed by a window"
    why_not: "at 16px the frame survives and the light does not"
lockups:
  aurora:  { name: "Aurora",  dark: logo-lockup.svg,          light: logo-lockup-light.svg }
  daybook: { name: "Daybook", dark: logo-lockup--daybook.svg, light: logo-lockup--daybook-light.svg }
```

### One lockup pair per candidate name

A consumer that lets the reader switch the brand name needs a wordmark for each candidate. The
caller supplies the names; this skill renders each one through `make-lockup.mjs` and lists the
pairs under `lockups:`.

> **The mark survives a rename. The wordmark does not.**

The symbol comes from the **referent** in the mark brief — the object it draws. That object does
not change when the word does, so a rename regenerates only the lockups. Every `logo-v*.svg` and
the favicon stay exactly as they are, and the consumer is expected to say so.

**Pick each ink by luminance, not by token role.** `--ink` is for the dark surface and
`--ink-light` for the light one, so passing `--text` and `--bg` straight through works only
while the palette is dark-first. Invert the palette and the light-surface lockup comes out
`#E6EAEE` on white — 1.21:1, an invisible word. Sort the two colours by relative luminance and
give the lighter one to `--ink`.

**The provenance gate checks a set, not a name.** `verify-logo.mjs` fails any wordmark spelling
something nobody declared — that is the check that was missing when 15/15 lockups spelled
nonsense. With several candidates the sanctioned set is `mark-brief.brand_name` **plus** every
`lockups:*.name` in `handoff.yaml`. The set got bigger; the gate did not get weaker.

## Checklist

```
- [ ] strategy.yaml + logo-directions.md
- [ ] approved_directions recorded (or auto_approved with --no-stop)
- [ ] mark-brief.md with specific_referent
- [ ] >=6 marks authored, >=3 silhouette families, one route each
- [ ] render-contact-sheet.mjs → PNG OPENED AND LOOKED AT
- [ ] logo-critic.md pass: true (set_range, icon_set_test, wordmark_read)
- [ ] verify-logo.mjs zero FAIL + `set range` line read + preview + stranger
- [ ] STOP — master approved
- [ ] [expand] favicon, lockup via make-lockup.mjs (+ light twin)
- [ ] handoff.yaml written
```


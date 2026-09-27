---
name: branding
description: >-
  Use when creating or evolving product branding from an idea or an existing
  project. Triggers: branding, brand identity, naming, palette, brand
  guidelines, rebranding, new product idea, improve current brand. Produces
  docs/BRAND.html — an interactive brand guide with palette, type specimens,
  a logo proof sheet, voice, and one embedded example product screen — plus
  real SVG marks under assets/logos/. Requires skill logo, which produces the
  marks. Logo-only requests go straight to skill logo. Not for local UI polish.
license: MIT
metadata:
  author: RafaelHDSV
  requires: logo
---

> **Dependency:** this skill does not draw marks. It invokes skill **`logo`** and embeds what
> that skill produces. Without `logo` installed, stop — see *Logo delivery*.
>
> **Network:** the naming step reaches `rdap.org`, a national RDAP endpoint, `api.github.com`,
> `registry.npmjs.org`, and the home page of any domain found registered (to read its
> `<title>`). The guide loads web fonts from `fonts.googleapis.com`. No credentials.
>
> **Language:** these instructions are English. The **artifact** follows the product's
> audience — keep `BRAND.html` in the language its readers speak.
>
> `$BRANDING_SKILL` and `$LOGO_SKILL` below mean each skill's own directory; substitute the
> real paths when running a command.

# Branding — one artifact, `docs/BRAND.html`

A self-contained HTML brand guide: positioning, naming with real availability signals, palette,
type specimens, a logo proof sheet, voice, and **one embedded example product screen**.
`assets/logos/` holds **real SVG files** produced by skill `logo` — never prompts.

## Routing

| Situation | Flow |
|-----------|------|
| New product, side project, "brand this concept" | **Flow A — Greenfield** |
| Existing repo with UI; audit, refresh, rebrand | **Flow B — Evolve** |
| Only marks wanted, no guide | Skill **`logo`**, not this one |
| One button colour tweak, or mockup exploration | Neither — that is UI work |

If the user says "new idea" or gives only a concept → A. If they point at a repo or a live site
→ B. When ambiguous, ask **one** question: greenfield or evolve?

## Artifacts

| Artifact | Rule |
|----------|------|
| **`docs/BRAND.html`** | Self-contained; brand fonts, CSS variables, one example screen; open it in a browser to review |
| **`assets/logos/`** | From skill `logo`: **≥6** marks spanning **≥3 silhouette families**, favicon, both lockups, and `handoff.yaml` |
| **`docs/DESIGN.md`** | Optional handoff for code — written when the project moves to implementation |

Before a repo exists, both live under `<workdir>/<slug>/`. Skeleton:
[references/BRAND-template.html](references/BRAND-template.html).

## Logo delivery — hard dependency on skill `logo`

**Skill `logo` is required.** Announce `Using logo for mark production` and invoke it.

> **If skill `logo` is not installed, stop.** Tell the user to install it. Do **not** write a
> mark brief, a prompt, or a placeholder instead — "no logo brief without SVG files" is a rule
> of this skill, and degrading quietly produces exactly the artifact the rule exists to prevent.

Branding never reads inside the logo skill, or inside `<logo-dir>` beyond this contract:

| File | What branding uses it for |
|------|---------------------------|
| `logo-v<N>-<gestalt>.svg` (**≥6**) | The mark grid and the proof sheet |
| `favicon.svg` | `<link rel="icon">` |
| One lockup pair **per candidate name** | Header, sidebar, example screen, both themes, all four names |
| **`handoff.yaml`** | Recommended mark, its referent, each alternative's route and reason, and the `lockups:` map |

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

Branding supplies the **candidate names** when invoking `logo`; `logo` renders one wordmark pair
for each and lists them under `lockups:`.

Branding passes the product name, the `:root` tokens and the `BRAND.html` path when invoking
`logo`; `logo` runs its own verifier against those tokens. Branding does not run it.

### The logo section is a proof sheet, not a gallery

It must **prove the mark survives**. Which tests, and why:
`$LOGO_SKILL/references/mark-proof.md`. How they become a section, and how clicking an
alternative promotes it: [references/logo-proof-sheet.md](references/logo-proof-sheet.md).

> **Failure mode:** a 44px dark-only grid let fifteen lockups ship spelling nonsense without
> anyone noticing.
> **Why this rule exists:** the guide is the last place the mark is looked at before it ships.
> If the guide cannot reveal a broken mark, nothing will.

## The sections

| Section | Spec | The one rule that matters |
|---------|------|---------------------------|
| **Naming** | [naming-candidates.md](references/naming-candidates.md) · [name-validation.md](references/name-validation.md) | Four selectable names, one per quadrant; each checked on its own; never write "not verified" |
| **Colours** | [brand-guide-shell.md](references/brand-guide-shell.md) | ≥96px of colour per card, with the role **inside** the card |
| **Logos** | [logo-proof-sheet.md](references/logo-proof-sheet.md) | Clicking any mark promotes it through every test |
| **Voice** | [voice-section.md](references/voice-section.md) | A lexicon and three real strings, not adjectives |
| **Example screen** | [example-screen.md](references/example-screen.md) | Name the core job, then pick an archetype and justify it |
| **Shell** | [brand-guide-shell.md](references/brand-guide-shell.md) | Light/dark toggle, exercised; lockups swap with it |

**Sections the guide does not have:** handoff/file paths, contrast audit, rejected sketches,
batch provenance. The test for any new block: *is the reader deciding about the brand, or
auditing how it was made?* Prose rules: [prose-density.md](references/prose-density.md).

### Naming — four quadrants, switchable in the page

A single name is a diagnosis with no cure: the good ones are all taken. The section ships **four
candidates**, one per quadrant of [naming-candidates.md](references/naming-candidates.md) —
generic and coined, in the product's language and in English — each with its **own** availability
data.

Clicking a candidate renames the whole document: the page title, the hero heading, **every
lockup**, all three naming tables, and **every place the prose names the product** — the voice
intro, the example screen, the CLI commands inside it. The hook list is in
[brand-guide-shell.md](references/brand-guide-shell.md).

What stays literal is the same word used as a common noun — the metaphor row, the lexicon, `tinta
de carimbo`. Those explain where a generic candidate came from; renaming them produces nonsense.

> **The mark survives a rename. The wordmark does not.** The symbol comes from the product's
> referent, which a new word does not change. Say this in the page: a reader who expects the
> symbol to change has misunderstood where identity lives.

### Example screen — the three steps that stop it being generic

1. **Name the core job:** *"the user opens the product to ______"*. If the product yields an
   artifact, the screen **is** the artifact.
2. **Pick an archetype** from the 16 in `example-screen.md`. *Console / ops* is one of sixteen,
   not the default.
3. **Justify it in one line** under the `<h2>`.

> **Failure mode:** fifteen identical screens, because the gate asked for "nav + summary +
> entity list" and the template showed exactly that skeleton.
> **Why this rule exists:** the agent delivered what was specified. The specification was the bug.

## Gates

Contrast is a gate, not a section — it must exit 0 in **both** themes and its output never
reaches the page:

```bash
node "$BRANDING_SKILL/scripts/check-contrast.mjs" <BRAND.html>
```

Naming runs on the exact name, with suggestions, plus one `WebSearch` pass:

```bash
node "$BRANDING_SKILL/scripts/check-name.mjs" <Brand> --slug=<slug> --suggest=10
```

## Flow A — Greenfield

Full steps: [references/flow-a-greenfield.md](references/flow-a-greenfield.md).

1. **Positioning** — thesis, ICP, differentiation, anti-positioning.
2. **Naming** — shortlist → chosen name → `check-name.mjs --suggest` → one `WebSearch` pass → three tables.
3. **Visual direction** — adjectives, references, anti-defaults.
4. **Colour + typography** — `:root` tokens, live swatches and type specimens.
5. **Logos** — **invoke skill `logo`**, passing name, tokens and the guide path.
6. **Voice** — lexicon, three microcopies, one same-intent pair.
7. **Example screen** — core job, archetype, justification.
8. **Shell** — sidebar nav, copy-to-clipboard, theme toggle, mark promotion.
9. **Compile** — one `docs/BRAND.html`; tell the user to open it.

**Gate:** the marks exist as files; the example screen passes its quality gate; the guide was
opened in a browser and **looked at**, in both themes.

## Flow B — Evolve

Full steps: [references/flow-b-evolve.md](references/flow-b-evolve.md).

Inventory → audit → scope → improve (invoke `logo` if the marks change) → update the HTML and
its changelog section → sync `docs/DESIGN.md` if asked.

## Checklist

```
- [ ] Flow selected (A greenfield / B evolve)
- [ ] Brief captured (audience, category, tone, constraints)
- [ ] Four name candidates, one per quadrant; each with its OWN availability data
- [ ] check-name.mjs --suggest on EVERY candidate (coined included) + WebSearch
- [ ] Selecting a candidate swaps title, hero, ALL lockups, all three tables and every
      brand mention in the prose; the page was read once under a coined name
- [ ] The page says the marks do not change with the name
- [ ] Swatch cards >=96px of colour, role inside the card
- [ ] check-contrast.mjs exits 0 in both themes; output stays out of the page
- [ ] Skill logo invoked; its checklist complete; handoff.yaml present
- [ ] >=6 marks, >=3 families; clicking an alternative promotes it through the proof sheet
- [ ] Voice: lexicon + 3 microcopies + same-intent pair
- [ ] Core job named, archetype chosen and justified, example screen built
- [ ] Shell interactive; theme toggle exercised; lockups swap with it
- [ ] No handoff / rejected / contrast / batch-note section left in the page
- [ ] docs/BRAND.html opened in a browser and looked at
- [ ] Anti-generic self-critique passed — references/anti-generic.md
```

## Anti-generic self-critique (required)

Three tables of clusters the work drifts toward on its own:
[references/anti-generic.md](references/anti-generic.md). Record the answers in the guide's
**Decisions and trade-offs** section.

## Handoff to implementation

After `docs/BRAND.html` is stable, copy the `:root` tokens into `docs/DESIGN.md`. That file is
the contract for whoever writes the CSS.

## Constraints

- Do not commit unless explicitly asked.
- **No markdown-only brand guide** unless the user explicitly asks for MD instead of HTML.
- **No logo brief without SVG files.**
- **Never write "signal not verified".** A row with no real check is a gap: say so, with the
  manual link.
- Trademark: flag obvious conflicts and link the registry — **no legal clearance**.

## Additional resources

- Sections: [name-validation.md](references/name-validation.md) · [voice-section.md](references/voice-section.md) · [example-screen.md](references/example-screen.md) · [logo-proof-sheet.md](references/logo-proof-sheet.md) · [brand-guide-shell.md](references/brand-guide-shell.md)
- Flows: [flow-a-greenfield.md](references/flow-a-greenfield.md) · [flow-b-evolve.md](references/flow-b-evolve.md)
- Critique: [anti-generic.md](references/anti-generic.md) · [prose-density.md](references/prose-density.md)
- Scripts: [check-name.mjs](scripts/check-name.mjs) · [check-contrast.mjs](scripts/check-contrast.mjs)
- Template: [BRAND-template.html](references/BRAND-template.html)

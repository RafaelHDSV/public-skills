# Example screen — mandatory in `docs/BRAND.html`

Every brand guide embeds **one product screen**, pure CSS, in the same file. Not a link to a
design tool, not a generic card grid.

## The screen answers one question

*"How does this brand behave when someone actually uses the product?"* — identity (mark,
palette, type) tied to the **core job** from the positioning thesis.

## The failure this replaces

> **Failure mode:** fifteen guides shipped **the same screen**: chrome with a logo, a sidebar
> of filters, three metric tiles, a list of entities with status badges. One product generated
> text, another was a catalogue, a third was a calibration matrix — all three appeared as the
> same ops dashboard.
> **Why this file exists:** the gate asked for "realistic density (nav + summary + list)" and
> the template showed exactly that skeleton. The agent delivered what was specified. **One
> template produces fifteen identical screens** — so the template became a catalogue, and the
> choice became a recorded decision.

## Step 1 — name the core job

Before drawing, one sentence: *"the user opens the product to ______"*. The screen shows **that
moment** — not the settings for it, not a dashboard about it.

The rule that resolves half the cases: **if the product yields an artifact, the screen is the
artifact.** A standup generator is not a board of cards; it is the text ready to paste. A
contract generator shows the contract. A link shortener shows the link and its click curve.

## Step 2 — pick the archetype

| # | Archetype | Form | Fits when |
|---|-----------|------|-----------|
| 1 | **Console / ops** | Metrics + filterable list + attention signal | Monitoring, queues, fleet health — **not** the default |
| 2 | **Finished artifact** | The document/text/file produced, with copy or export | The product yields output the person takes away |
| 3 | **Editor / canvas** | Composition area + toolbar + inspector | Creation, editing, authoring |
| 4 | **Stepped flow** | Progress + one step at a time + side summary | Onboarding, guided calculation, long form |
| 5 | **Record / detail** | One entity in depth: attributes, tabs, history | The value is in the detail, not the list |
| 6 | **Conversation** | Turns, authorship, composer at the bottom | Chat, support, agent, comments |
| 7 | **Timeline** | Events in chronological order with a time anchor | Audit, feed, history, changelog |
| 8 | **Dense grid** | Table with many columns and bulk operations | Tabular data *is* the product |
| 9 | **Columns board** | State columns with movable cards | Work that travels between stages |
| 10 | **Calendar / schedule** | Time grid, occupied blocks | Time is the main axis |
| 11 | **Showcase** | Visual grid with price/attribute and one item highlighted | Catalogue, marketplace, portfolio |
| 12 | **Terminal / log** | Monospaced output in flow, with a command | A CLI or CI tool |
| 13 | **Mobile 375px** | One narrow frame, one flow | The product is born on the phone |
| 14 | **Comparison** | Two or more sides, differences marked | The product exists to confront A with B |
| 15 | **First use** | Empty state with a real next step | The value is in starting without friction |
| 16 | **Map / graph** | Nodes and edges on a canvas, with an intensity legend | The information is relational; a list would destroy it |

**Archetype 1 has to be earned.** It is one of sixteen. If the answer to step 1 is not literally
"keep track of many things at once", it is the wrong one.

## Step 3 — record the choice

One line in `<p class="muted">` under the `<h2>`: which job the screen shows, and why that
archetype. It is the sentence that prevents a silent drift back to the dashboard.

> Preview of the standup text ready to paste — **finished artifact**, because the value is the
> output, not a panel about it.

## Requirements (any archetype)

| Requirement | Detail |
|-------------|--------|
| **Embedded** | Full mock in `#preview`, same file, same `:root` tokens |
| **Logo visible** | Recommended mark or lockup in the screen's chrome |
| **Tokens only** | Colours from `:root` — no loose hex |
| **Typography live** | Display, body and mono in a real hierarchy |
| **The core job** | The screen shows the moment named in step 1 |
| **State semantics** | If the product has states, they appear with the semantic tokens |
| **Microcopy on-brand** | Drawn from the lexicon in the Voice section |
| **Density of the archetype** | An editor full of metric tiles is wrong; so is a console with three rows |
| **Self-contained** | CSS in `<style>`; `<img>` only for the logo files — no framework |
| **One real interaction** | Filter, tab, copy, a row that opens detail — see [brand-guide-shell.md](brand-guide-shell.md) |

## Do not include

- **A token/typography annotation table.** The screen sits beside the colour and type sections
  in the same document; the table repeated them and pushed the screen below the fold.
- A caption explaining that the mock is interactive — interaction presents itself.
- The archetype name as decoration: it appears **once**, in the justification line.

## In a batch (several products at once)

The gate that was missing:

- [ ] No archetype appears in **more than 3** of the batch's projects
- [ ] Two products in the same category do not share an archetype
- [ ] The batch → archetype table fits in one glance, and **was looked at**
- [ ] Archetype 1 used only for products that genuinely monitor something

Side by side is the only way to see repetition. Project by project, every screen passes.

## Quality gate

- [ ] Core job written in one sentence before drawing
- [ ] Archetype chosen from the catalogue and **justified** in the document
- [ ] Recommended logo on the screen, not a text placeholder
- [ ] 3 typographic roles visible
- [ ] 4 semantic colour uses
- [ ] A stranger guesses what the product does from the screen alone
- [ ] No annotation table
- [ ] No default SaaS layout unless the brief asks for it

## Relationship to other work

| Concern | Role |
|---------|------|
| Design tokens | Supply the `:root` values the screen consumes |
| Voice section | Its rules apply to every string in the mock |
| Multi-screen prototyping | Optional exploration — it **does not** replace this section |
| Implementation | Implements the same tokens in code after handoff |

## Evolve flow

When refreshing an existing brand, base the screen on the **main live route**. The archetype
comes from the real screen, not the catalogue — and if the real screen is a generic console,
that is a finding of the audit, not a template to copy.

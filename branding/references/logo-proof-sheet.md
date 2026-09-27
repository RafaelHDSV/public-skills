# Logo section — rendering the proof sheet in `BRAND.html`

> **What this is for:** turning the tests a mark has to survive into a section of the brand
> guide, and letting the reader put any mark through them.
> **What lives elsewhere:** *which* tests, and why, belong to skill `logo` —
> `$LOGO_SKILL/references/mark-proof.md`. Do not restate them here.
> **Related:** [brand-guide-shell.md](brand-guide-shell.md), [prose-density.md](prose-density.md).

## What the section renders

In this order, all of it driven by one mark at a time — the **mark in proof**:

1. Size ladder — 128 / 48 / 24 / 16 px on one baseline
2. Four surfaces — product dark, white, flat accent, mid grey
3. Monochrome — black on white, white on black
4. Both lockups, each on its own background, ≥48px tall
5. Clear space, drawn; minimum size, declared
6. Four misuses, each with the error actually applied
7. The full set of marks, clickable

Content for 1–6 comes from `handoff.yaml`; the reasons in 7 come from the same file.

## Clicking a mark promotes it

The grid is not a shop window. **Clicking any mark puts it in proof across the whole section** —
ladder, surfaces, monochrome, clear space, misuse — and the name and referent line follow it.

| Why | Detail |
|-----|--------|
| Comparing requires the same test | Two marks at 44px side by side decide nothing; at 16px on mid grey, they decide |
| The recommendation is a hypothesis | If the second option holds up better, the document has to let that show |
| Otherwise the choice belongs to the generator | Promotion puts the decision in the reader's hands, which is the point of the guide |

Mechanics: every `<img>` in the section that shows the mark in proof carries `data-mark-slot`;
the click rewrites their `src`, marks the card active, and swaps the `<code>` name plus the
referent line (from a small JSON block holding one note per mark). A **Restore recommended**
button undoes it. Opening the raw SVG stays available as a link inside the card — the click
itself is the promotion.

Promotion is **reading state**, not a write: nothing changes under `assets/logos/`, and
reloading returns to the recommended mark. Changing the recommendation for real means editing
the logo dir.

## The guide's own lockup follows the theme

Header, sidebar and example screen swap between `logo-lockup.svg` and `logo-lockup-light.svg`
with the theme toggle.

> **Failure mode:** without that swap, the first click on "light theme" erased the brand from
> the document explaining the brand.
> **Why this rule exists:** it only surfaced when someone ran the toggle and looked.

The pair **inside** the proof sheet stays fixed: there, the job is showing both at once.

## What does not enter the section

| Out | Reason | Where it lives |
|-----|--------|----------------|
| *Rejected in this batch* table | A list of files nobody received, with defects nobody can check. Process, not brand | `mark-brief.md`, `logo-critic.md` |
| *The wordmark says* caption | A gate, not a caption — see `mark-proof.md` | `logo-critic.md` + chat summary |
| WCAG contrast table | Accessibility audit, not identity; and it failed pairs nobody proposed using together | A gate before publishing — [brand-guide-shell.md](brand-guide-shell.md) |
| Batch / pending-review note | Process provenance | `strategy.yaml` + chat summary |
| File paths and handoff listings | The repository already says where files are | Nowhere |

The test for any new block: **is the reader deciding about the brand, or auditing how it was
made?** If the second, it belongs in the logo dir.

## Quality gate

- [ ] All six tests rendered, driven by the mark in proof
- [ ] **Every** mark in the set is clickable and promotes through the whole section
- [ ] Restore button present
- [ ] Each mark carries its one-line reason, read from `handoff.yaml`
- [ ] Header/sidebar/example-screen lockups swap with the theme; the proof pair stays fixed
- [ ] No rejected table, no contrast table, no batch note, no handoff listing
- [ ] Whole page reviewed in **both themes**

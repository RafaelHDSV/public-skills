# Proving a mark survives

> **What this is for:** the set of tests a mark has to pass before it ships. Not a gallery —
> a gallery shows that files exist; this shows whether the mark holds.
> **Related:** [logo-critic.md](logo-critic.md), [wordmark.md](wordmark.md), [../SKILL.md](../SKILL.md).

Skill `branding` renders these tests as a section of a brand guide. How that section is built —
markup, promotion on click, theme swapping — is that skill's business. **What has to be tested,
and why, is here.**

## The failure this replaces

A grid of six marks at ~44px, in identical cards, on a dark background only. In that format:

- fifteen lockups spelling `PIMDL`, `IRALP` and `OFPFNNRO` went unnoticed;
- a wordmark sitting at 1.14:1 against its background merely looked "subtle";
- no mark was seen at 16px, which is where it actually lives — tab, favicon, app icon;
- nothing was seen on a light surface, which is half of real use.

## The six tests

### 1. Size ladder

The mark at **128 / 48 / 24 / 16 px**, in that order, on one baseline.

16px is the gate. If the silhouette turns to mush there, the mark is not favicon-safe, and that
has to be **visible**, not buried in a score.

### 2. Surfaces — the same mark, four backgrounds

| Background | Tests |
|------------|-------|
| The product's dark surface | Default use |
| White | Docs, email, print, slides |
| The accent, flat | The mark on top of its own brand colour |
| Mid grey (`#808080`) | The mark with no contrast helping it |

### 3. Monochrome

Black on white and white on black, **no colour at all**. A mark that only works in colour fails
in fax, engraving, silkscreen and watermark — and it is almost always a sign that colour was
carrying the shape.

### 4. Both lockups

`logo-lockup.svg` and `logo-lockup-light.svg`, each on its own background, at **48px minimum
height** — large enough to read.

**The wordmark reading is a gate, not a caption.** It is recorded where it can be checked:

| Where | What |
|-------|------|
| `render-contact-sheet.mjs --mode=lockup` | The PNG that gets **opened and looked at** — the step that actually catches the error |
| `logo-critic.md` | `wordmark_read: <name>` — equal to the brand name, or the gate fails |
| Chat summary | The reading, transcribed once per project |
| The brand guide | **Nothing.** Both lockups appear at a readable size and speak for themselves |

Dropping the caption loosens nothing as long as the contact sheet is opened. If that step is
skipped, the caption would have been written wrong too — fifteen of them were.

### 5. Clear space and minimum size

Clear space expressed as a multiple of a measurement taken from the mark itself, drawn as a
shaded area around it. Minimum size in px for screen and mm for print.

### 6. Misuse — rendered, not listed

Four examples with the error **actually applied** and a `✕`: stretched, recoloured outside the
tokens, given a shadow or outline, placed on a photo with no contrast. A list in prose prevents
nothing; the reader has to see what the mistake looks like.

## The alternatives are part of the proof

Every mark in the set gets the same six tests, not just the recommended one. A set of six is
only worth having if the reader can put any of them through the same gauntlet — which is why
`handoff.yaml` carries a route and a reason for each.

`--mode=letter` on the contact sheet renders the stroke-family marks large and alone on white.
That is the view where an accidental letter is unmistakable.

> **Failure mode:** four stroke marks in one batch read as `H`, `A`, `U` and a user icon. The
> verifier passed all four.
> **Why this rule exists:** symmetric strokes with two or three segments are an alphabet. No
> geometric check reads meaning.

## Quality gate

- [ ] Ladder 128/48/24/16 for every mark being considered
- [ ] 4 surfaces + monochrome both ways
- [ ] Both lockups, ≥48px, reading verified on the contact sheet and recorded in `logo-critic.md`
- [ ] Clear space drawn, minimum size declared
- [ ] 4 misuses rendered
- [ ] Stroke-family marks checked with `--mode=letter`
- [ ] Every alternative carries a route and a reason in `handoff.yaml`

# Failure atlas — confirmed anti-patterns

> **What this is for:** a catalogue of recurring failures, from calibration rounds and from
> practice. Consult it on a redraw; do not reread it in full every run.
> **Related:** [calibration-profile.md](calibration-profile.md), [../SKILL.md](../SKILL.md), [mark-construction.md](mark-construction.md).

## Process

- Treating a prompt, or an image in chat, as "done"
- Shipping without `verify-logo.mjs` at zero FAIL
- Shipping without rendering a preview and **looking at it**
- **Inventing a mode to skip a gate**

  > **Failure mode:** a batch created a `batch_provisional: true` flag that existed nowhere in
  > the skill, and used it to skip the roundtable, the Critic, the verifier and the preview
  > across every project.
  > **Why this rule exists:** a gate with no legitimate route for batch is a gate that gets
  > routed around. Use `--no-stop`, which states what may and may not be skipped.

- **Writing "match: yes" without opening the PNG** — looking is the only step that catches a
  wrong letter
- Skipping the catalogue of three real references
- Drawing variants before the master is approved
- Filler variants (invert / recolour) to reach a count
- Shipping a raster or a raw vectorise that fails the verifier
- **Hand-drawn letterforms**

  > **Failure mode:** fifteen lockups shipped spelling `PIMDL`, `IRALP` and `OFPFNNRO`.
  > **Why this rule exists:** an agent does not draw an alphabet. The correct route is
  > [wordmark.md](wordmark.md) — an embedded woff2 subset via `make-lockup.mjs`.

- `<text>` **without** an embedded `@font-face` — the font does not travel. With a base64
  subset embedded, it does
- **A lockup in the dark ink only** — dark-surface ink vanishes on white; the light twin is missing
- Stacked primitives with no authored path
- A filename carrying a calibration slug when the brief asks for a different noun

## Shape and reading

- **`must_read_as` is a common noun**

  > **Failure mode:** asking for "ring", "frame", "gap", "dawn" returns the stock icon of that
  > noun. Fifteen briefs with common nouns returned ninety library icons.
  > **Why this rule exists:** the brief needs a **specific referent and a point of view** — not
  > "dawn" but "the first band of light cutting through the blinds"; not "ring" but "the loop
  > the night guard walks, and where it closes". See [mark-brief.template.md](mark-brief.template.md).

- **Escaping the cliché into the wrong object**

  > **Failure mode:** fixing "this is the stock icon" by abstracting the *process* instead of
  > choosing another *object* produced accidental glyphs — a dawn became `≠`, a knot became a
  > red cross, a tamper became a table, a latch became `T`. All worse than the clichés they
  > replaced.
  > **Why this rule exists:** specificity belongs to the **object and the viewpoint**, not to
  > the degree of abstraction. `specific_referent` must name a physical thing someone would
  > recognise drawn head-on. The marks that worked were literal objects drawn without stylising.

- **A set that is one idea redrawn N times** — six sunrises is not six marks. A variant is a
  different route, not a different angle. `verify-logo.mjs` reports `set range` (silhouette
  families); one or two families means back to the drawing board
- **The same silhouette across different briefs**

  > **Failure mode:** three unrelated products shipped the same concentric donut in one batch.
  > **Why this rule exists:** running `render-contact-sheet.mjs` with **all** projects at once
  > exposes it in a glance. Project by project, never.

- **Sector-default icons** — fintech X, outdoor mountain, isometric cube, music C, law seal,
  health heartbeat
- **Letter plus ornament** — the extra vanishes at 24px and reads as generic type
- A void or cut that does not name the noun at 24px
- **A circular hole in a rectangle** — the void has to be a named shape (wedge, arc, bay)
- **Wrong-object pictorial** — the stranger says kettlebell, blob or walnut instead of the noun
- **Partial metaphor** — a house for a bridge brief, a tree for a branch brief
- Cloning a shape that scored well and rounding the hole a bit
- **A bay that does not touch the baseline** — reads as a table
- **Two posts plus a lintel** — reads as pi. Three posts and a slab reads as a portico
- **Almost any U** — trough, tank and gutter all score 1; a cup is the exception, when the
  brief asks for a cup
- **Fins with no roof** — generic. The roof is what made the architectural family read
- **A king post or chevron on a shaft** — reads as a map pin
- **Ziggurat steps**, **fatter scallops**, **block plus chimney** — each reads as something else
- **Lighthouse plus beam** — the nautical default; a glued beam scored 1 in every round
- **A lone dot or circle**, **a hub with no silhouette** — 1
- Any second cue that dies at 24px: a good idea that is illegible is still illegible

## Mechanical (the verifier catches these)

- A path made only of `M H V Z` — rectangles in disguise
- A wedge or triangle glued to the edge (`beam-wrong`)
- A filename containing a slug listed in the brief's `forbidden_gestalts`
- A pictorial with no curve at all (`A`/`C`/`Q`) — WARN
- A symmetric stroke figure of 2–5 paths — WARN, letterform risk

## Stroke marks turn into letters

> **Failure mode:** raising sets from three to six marks, the new `stroked-line` entries were
> drawn with symmetric geometry — and four of fifteen read as letters on the contact sheet: a
> caliper as `H`, a lamp sweep as `A`, a loop as `U`, a root as a user icon. The verifier
> passed all four.
> **Why this rule exists:** a symmetric stroke figure with two or three segments is an
> alphabet, and no mechanical gate reads meaning.

How to undo it, most effective first:

1. **Break the symmetry** — apex off centre, one leg longer than the other.
2. **Remove the middle crossbar** — move the ground below the diagonals, outside the gap.
3. **Remove the head** — a round shape over two legs is a human figure before it is anything else.
4. **Add a fourth segment** — three strokes are a letter; four rarely are.

Asymmetry alone is not enough: an off-centre apex still read as lambda, and a caliper rebuilt
with feet became a five-stroke `H`. When a shape keeps reading as a letter, the **vertex itself**
has to go — swap the apex for an arc, or move the distinguishing part off the ends and into the
middle of the run.

Corollary: `stroked-line` is the family that most needs an eye. `axis-blocks` drifts toward
clip-art (the `fake path` gate catches it) and `curved-solid` drifts toward a blob — but only
strokes drift toward **meaning something else**, and no script measures wrong meaning.

## Calibration — summary

| Do | Do not |
|----|--------|
| Let the brief define the noun | Copy a shape that scored well in another brief |
| Make a stranger name it first try | Ship an abstraction that needs explaining |
| Use a classic silhouette | Stack primitives |
| Use crosshair / ring / arrow **when the brief asks** | Use them because they once scored 3 |

Observed bar: most marks 1–2; 3 is an acceptable direction; 4+ is rare. Draw for 4+, not to
pass the verifier.

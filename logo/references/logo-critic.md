# Logo Critic — the hard gate before shipping

> **What this is for:** judging the authored set *before* verify and expand. Any score under
> the threshold sends it back to the drawing board.
> **Related:** [rebuild-checklist.md](rebuild-checklist.md), [mark-proof.md](mark-proof.md), [../SKILL.md](../SKILL.md).

## When to run it

Once the marks exist and **before** `verify-logo.mjs` or master approval.
Artifact: `<logo-dir>/logo-critic.md`.

**Non-negotiable prerequisite — look at the PNG.** Before writing a single score:

```bash
node "$LOGO_SKILL/scripts/render-contact-sheet.mjs" <out.png> <logo-dir>
node "$LOGO_SKILL/scripts/render-contact-sheet.mjs" <out.png> <logo-dir> --mode=letter
```

and **open the files**.

> **Failure mode:** scores written from reading the SVG source. Fifteen lockups spelled
> `PIMDL` and `IRALP`; no amount of code reading caught it. Later, four stroke marks read as
> `H`, `A`, `U` and a user icon; same result.
> **Why this rule exists:** pixels catch what source does not.

## Rubric

Judge the set (SVG plus the rendered sheet at 24px and 128px):

```yaml
memorability: 1-10   # recalled tomorrow without seeing the name?
scalability: 1-10    # survives 16-32px?
uniqueness: 1-10     # not the default icon of the sector?
favicon: 1-10        # reads as a favicon / app icon?
legibility: 1-10     # clear silhouette, no noise?
set_range: 1-10      # are the marks distinct routes, or one idea redrawn N times?
failures: []         # e.g. generic SaaS icon, resembles X, too many details

# Text questions — answer them, do not score them:
icon_set_test: ""    # name up to 3 icon libraries (Lucide / Phosphor / Feather /
                     # Material) that already have this silhouette. Two or more
                     # means it is an icon, not a mark.
wordmark_read: ""    # what your eyes read in the rendered lockup, verbatim
letterform_check: "" # for each stroke mark: what it read as at 160px
```

## Hard gate (pass)

```
pass = memorability >= 7
   AND uniqueness >= 7
   AND favicon >= 6
   AND legibility >= 7
   AND set_range >= 6
   AND icon_set_test names at most 1 library
   AND wordmark_read == brand_name
   AND letterform_check names no letter
```

**`icon_set_test`** is the gate that separates a mark from an icon.

> **Failure mode:** a batch passed everything else and shipped ninety library icons —
> heartbeat, padlock, bullseye, speech bubble, four-square grid, AI sparkle.
> **Why this rule exists:** if the silhouette already exists in Lucide, it belongs to nobody.

**`wordmark_read`** is transcription, not intention: write what appeared on screen. If the
field repeats the brand name because you know what it is, the gate was not run.

**`letterform_check`** is the same discipline for stroke marks. The verifier raises a WARN for
symmetric stroke figures, but it cannot read meaning — `--mode=letter` and your eyes can.

`scalability` is required in the YAML as a diagnostic; it does not block on its own, but under
6 it must appear in `failures`.

If `pass: false` → verify and expand are **forbidden**. Redraw.

## Output template

Write this to `<logo-dir>/logo-critic.md`:

```yaml
memorability:
scalability:
uniqueness:
favicon:
legibility:
set_range:
icon_set_test: ""
wordmark_read: ""
letterform_check: ""
failures:
  -
pass: false
verdict: blocked | ok
next: redraw | another route | back to the workshop
```

## Typical failures

- Generic SaaS icon (brain, rocket, `</>`, bar chart, gear)
- Resembles a known brand mark
- Too many details to survive as a favicon
- Clip-art / illustration feel
- Direction mismatch — the drawing says one concept, the brief says another
- **Icon-library silhouette** — heartbeat, padlock, bullseye, speech bubble, 2x2 grid, sparkle, spinner
- **Dictionary illustration** — the drawing of the brief's noun with no point of view
- **Accidental letterform** — a stroke mark that reads as H, A, U, T, V or X
- **Wordmark illegible or wrong** — it does not spell the brand, or it disappears on a light surface
- **Set with no range** — most of the set in one silhouette family

## Human tests — on the recommended mark

No script runs these. They come from `logo-design.md`, which no longer exists: the pipeline
moved to `../SKILL.md` and the craft moved to [mark-construction.md](mark-construction.md).

| Test | Pass criteria |
|------|---------------|
| **Reference parity** | Does not look like clip-art next to Linear / Vercel / Notion |
| **Stranger** | "What is it?" → the correct noun, without reading the name |
| **Squint** | Gestalt legible at 48px |
| **Favicon** | Legible at 32px and 16px |
| **Monochrome** | Works in a single colour |
| **Design intent** | The sentence describes meaning, not geometric construction |
| **Clip-art stack** | You cannot describe it as "I stacked some shapes" |
| **Letterform** | It does not read as a letter — see `--mode=letter` on the contact sheet |

**Design intent** is the most diagnostic of these. If the only honest sentence about the mark is
"three bars of different heights", there is no idea — there is construction.

**Letterform** is the newest and the one no script fully covers. The verifier raises a WARN for
symmetric stroke marks, but it cannot read meaning; only looking can.

## Forbidden

- Copying shapes from GitHub, GitLab, Linear, Vercel, etc.
- Prompt-only delivery (no SVG on disk)
- **v6 = invert/recolour of v1**, or **v3 = scaled v1**
- Shipping a weak variant just to hit the count
- **Hand-drawn letterforms anywhere** — the lockup uses `<text>` with an embedded woff2
  subset, which is the opposite rule; see [wordmark.md](wordmark.md)
- A filename that diverges from the gallery gestalt
- Sparkle / cyber gradient / generic SaaS indigo
- Baked-in app-icon chrome
- Stacked primitives (rect + rect + triangle) with no authored path
- Hex outside the brand's colour system

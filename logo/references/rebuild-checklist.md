# Authoring checklist — brief → master SVG

> **What this is for:** the happy path from an approved Direction to the shipped set. Any
> sketch is *visual reference*; the master is **clean authored geometry**, never an auto-trace.
> **Source of truth:** this file + [logo-critic.md](logo-critic.md).
> **Related:** [mark-construction.md](mark-construction.md), [trace-checklist.md](trace-checklist.md) (legacy), [../SKILL.md](../SKILL.md).

## Before

- [ ] `strategy.yaml` with `approved_directions`
- [ ] `mark-brief.md` with `specific_referent` — *which* exemplar, *seen from where*
- [ ] Tokens from the brief
- [ ] If the optional roundtable ran: the chosen sketch open beside you, as silhouette
      inspiration — not as a path dump

## While drawing

- [ ] **≥6 marks, ≥3 silhouette families, one route each** — the objects differ, not the
      finishes
- [ ] Few nodes; one main gesture per mark; detail via `evenodd`/`clipPath` only if needed
- [ ] Max 2 brand colours + a neutral
- [ ] Required comments:

```html
<!-- brief-noun: <must_read_as> -->
<!-- route: <this mark's own route to the referent> -->
```

- [ ] Save as `logo-v<N>-<gestalt>.svg` at the top of the logo dir
- [ ] **Forbidden:** auto-trace (Trace Bitmap / potrace), or a path with hundreds of points
- [ ] **Forbidden:** stacked primitives with no authored path — a mark you can describe as
      "I stacked some shapes" has construction where an idea should be

## Step W — the wordmark, when building the lockup

One route, no practical exception: [wordmark.md](wordmark.md).

```bash
node "$LOGO_SKILL/scripts/make-lockup.mjs" <logo-dir> \
  --name=<Brand> --mark=logo-v1-<gestalt>.svg \
  --font-query="<family>" --ink=<light neutral> --ink-light=<dark neutral>
```

- [ ] The wordmark is `<text>` + an embedded `@font-face` woff2 subset — **never** drawn letters
- [ ] `<!-- wordmark: <Brand> -->` matches `brand_name` in the brief
- [ ] The light twin (`logo-lockup-light.svg`) is written
- [ ] Render it and **read it out loud**: does it spell the brand?
- [ ] Custom lettering (rare): `wordmark-proof.txt` records what was **seen**, not what was intended

## After

- [ ] `render-contact-sheet.mjs` — **open the PNG** (light + dark). This comes first: everything
      else judges what it showed
- [ ] `--mode=letter` for the stroke-family marks — a symmetric stroke figure is an alphabet
- [ ] [logo-critic.md](logo-critic.md) hard gate (`pass: true`), including `icon_set_test`,
      `set_range` and `wordmark_read`
- [ ] `verify-logo.mjs` zero FAIL — and read the `set range` line
- [ ] A stranger names `must_read_as`
- [ ] Gestalt matches the approved Direction, not merely "looks like the sketch"
- [ ] `write-handoff.mjs` — every alternative has a route and a reason

## If the set fails

Record the rejected directions in `mark-brief.md`, then either draw another route inside the
same Direction or go back to the workshop. Do not ship a weak variant to reach the count.

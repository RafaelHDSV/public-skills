# Mark construction — how to draw the set

> Type choice, construction principles and drawing order. The **pipeline** does not live here:
> it lives once, in [../SKILL.md](../SKILL.md).
>
> **Failure mode:** this file used to restate the whole pipeline as `Phase 0 … Phase 0.7`, and
> the two copies drifted — the reference called the roundtable *exploration only* while the
> skill sold it as mandatory.
> **Why this rule exists:** a duplicated list is a list that goes stale, and the agent reads the
> stale one first.

Wordmark and lettermark craft is **not** here either: it lives in [wordmark.md](wordmark.md),
which is the only place that describes how the brand name gets set.

## 1. Choose the type

Use the catalog taxonomy. **One primary type per mark.**

| Deliverable | Rule |
|-------------|------|
| **Isolated mark** | Transparent SVG, square `viewBox`, mark centered with clearspace |
| **Favicon** | **Redrawn** simplification — max 3 layers; test at 16px |
| **Lockup** | Mark + wordmark as `<text>` with an **embedded woff2 subset** — never drawn letters; see [wordmark.md](wordmark.md) |
| **Variants** | Quality quorum — see below |

### Quality quorum

**Target: 6 families. Floor: 3.**

Six real options give the client something to choose between, and exploring six forces you past the first obvious idea. But the count is a target, never a licence: the old rule demanded 6 files and forbade omitting any, and the actual effect was **filling the quota with weak marks** — exactly the anti-pattern the catalog already condemns ("6 forced variants dilute quality").

Rules in force:

- Ship **6 families** whenever 6 pass the verifier and parity.
- A family that fails is **redrawn**, not shipped and not silently dropped.
- Only after repeated redraws does a family leave the delivery, and then with a **recorded reason** in `BRAND.html` — never as a recolor of another mark to hit the number.
- Prefer **3 strong to 6 mediocre**. If you end below 6, say so explicitly and say why.

### Six families (exploration map)

Each `logo-vN-*.svg` maps to **exactly one** row. Two variants in the same family means one of them is redundant.

| File | Family | Typical type | Forbidden |
|------|--------|--------------|-----------|
| `logo-v1-*.svg` | **Literal craft** | Ownable pictorial | Recolor of v2–v6 |
| `logo-v2-*.svg` | **Ownable abstract** | Sweep, orbit, solid form + notch | Copying Linear/Vercel |
| `logo-v3-*.svg` | **Literal + context** | Mark + repos/status/points | Broken miniature of v1 |
| `logo-v4-*.svg` | **Contained** | Mark inside a viewport/badge | v2 in a box for no reason |
| `logo-v5-*.svg` | **Minimal scene or negative space** | One context, or the mark knocked out of a solid form | v1 plus one extra line |
| `logo-v6-*.svg` | **Lettermark or alternative mono** | Monogram OR a mono treatment of v2/v3 | **Invert/recolor of v1 alone** |

A **wordmark** is a legitimate seventh asset (`logo-wordmark.svg`) and can take one of the six option slots when the product name is short and distinctive — see the catalog's product→type matrix.

### Filename == gestalt

The file slug **must** match the gallery title in `BRAND.html`. If the gestalt changes, rename the file — `logo-v5-harbor-ring.svg` titled "Signal Bars" is leftover from an old iteration and makes the next person (or agent) draw against the wrong map.

```
logo-v<N>-<gestalt-in-kebab>.svg     e.g. logo-v2-lens-notch.svg
```

### Distinctness test (mandatory)

| Variant | Gestalt in 3 words | Type | Reference that inspired it |
|---------|--------------------|------|----------------------------|
| v1 | e.g. front striped tower | pictorial | Docker |
| v2 | e.g. solid disc notch | abstract | Apple (negative space) |

**Automatic failure:** two rows with the same 3 words; v6 described as "v1 dark/light"; v3 described as "small v1".

---
## 2. Construction principles

### Simplicity with purpose

| Real brand | Elements | Lesson |
|------------|----------|--------|
| Vercel | 1 triangle | Closed shape, fixed proportion |
| Linear | 3 straight lines | Consistent rhythm and angle |
| Grafana | 1 spiral | Domain (metrics) in the shape |
| Docker | 1 silhouette | Literal, with craft in the contour |

### How craft is actually built (the "how", not just the "don't")

The difference between a mark and clip-art almost always comes down to **one** of these four decisions:

**1. One silhouette, detail subtracted.** Draw **one** closed path and take the detail out of it with `clipPath`, `mask`, or `fill-rule="evenodd"` holes. Detail **added** on top as loose shapes is what produces the stacked reading.

```xml
<!-- yes: stripes cut out of ONE silhouette -->
<defs><clipPath id="body"><path d="…silhouette…"/></clipPath></defs>
<path d="…silhouette…" fill="#E8ECF0"/>
<g clip-path="url(#body)" stroke="#141A22" stroke-width="2.6">…</g>

<!-- also yes: evenodd nesting — disc fills, mark voids, stripes fill again -->
<path fill-rule="evenodd" d="M…disc… Z M…mark… Z M…stripe… Z"/>

<!-- no: loose rectangle + rectangle + triangle -->
```

**2. Beam/light with no pasted triangle.** A filled triangular wedge glued to a rectangle is the most reliable tell of an AI-generated logo. Alternatives with craft:

- **Tapered path** — a closed contour that narrows to a point (real variable width, not a uniform `stroke`)
- **Curved stroke** plus a low-opacity twin for the halo (editorial style)
- **Radar wedge** anchored at the centre of a disc (Grafana, PlanetScale) — it belongs to the disc rather than being stuck onto it
- **Negative space** — a gap in a ring, or a notch cut into a solid form, suggests the light without drawing it

**3. Optical correction.** Maths is not balance. Round and pointed shapes need roughly 2% overshoot to *look* the same size as flat ones; the visual centre of a bottom-heavy shape sits above the geometric centre.

**4. Geometric rhythm, not uniform.** Stripes, bars and rings at equal intervals read as an icon grid. A progression (each interval × ~0.8) reads as drawing — and, on a lighthouse, also as the perspective of the tower tapering.

### Failure modes seen in practice

Cheap to avoid once named:

| Symptom | Cause | Fix |
|---------|-------|-----|
| Reads as a **chess pawn** | Ball or thin lantern on a neck | Lantern is a **house** that overhangs a short fat shaft; add one beam if needed |
| Reads as a **Christmas tree** | Strong taper with no visible gallery ledge | Make the gallery clearly overhang the shaft top; keep the lantern a box |
| Reads as a **pie chart** | Wedge anchored at the centre of a ring | Do not anchor at the centre; cut a notch into a solid form instead |
| Reads as a **leaf** | Crescent with no enclosing form | Give it a frame, or make it a solid form with a void |
| Reads as **speed lines** | Several thin rays fanning out | Fewer, thicker bands — or drop the fan |
| Stripes read as an **artifact** | Bands too small relative to the shape they cross | Bands span the full width of the form, or leave them out |
| Tagged **generic / clip-art** | Sector-default icon (X, mountain, candy, isometric cube, music C, law seal) | Different noun; if the industry icon *is* the mark, discard |
| Tagged **illegible** on a letter | Ornament on a normal letter (pulse, keel) smaller than 24px | Rebuild the **letter** so the metaphor is the skeleton, or drop lettermark |
| Reads as **map pin / pac-man / info-i** | Teardrop, bitten disc, I in a circle | Change the silhouette before shipping |
| Tagged **generic** on a hole-in-box | Circular punch in a rectangle (well, stamp, CD) | Void must be a **named shape**: wedge, arch, rectangular bay |
| Reads as the **wrong object** | Pot→kettlebell, saddle→blob, knot→washer | Rebuild until a stranger hits the brief noun |
| Domain tool as mark | I-beam, ECG, piano key, mill-nut, anvil | Still clip-art of the trade — pick a place or a use-void |
| Reads as a **table / pi** | Two posts + lintel (Gemeos 1); bay that stops above the baseline | **Four** posts + roof slab (Dossel 5) or three (Alpendre 4 / Portico 5). Pediment optional |
| Clone of a **4/5 dies** | Hat / stretch / missing piece (Frontaria, Campanario, Empena, Torreao, Portada, Trave, Vao) | One family per construction; Portal needs **twins + merlons**, Celeiro needs **peak and brace**, Forno needs the **house** |
| A **U-trough** is generic | Tanque, Alcova, Calha (all 1) | Only Barra's cup silhouette; do not generalize to basins |
| King post is an **arrow** | Chevron on a stick (Tesoura 1) | Drop. Do not mark structure as a map pin |
| Reads as a **pyramid** | Stacked steps (Tribuna 1) | Drop |
| Awning **worse when fatter** | Toldo 1 after Mercado 4+ilegivel | Do not iterate scallops |
| Fins **generic** | Three bars, no roof (Brise 3) | Put a roof mass on them (Alpendre) |
| Chimney reads as a **T / hydrant** | Block + stick, beside *or* on the roof (Chamine 2) | Do not mark a factory with a chimney bump; pick a place-void or drop |
| Transom / shutter reads as **blinds** | Horizontal bars in a bay (Oficina 1) | Repeating **verticals under a roof** (Portico 5), not bars in a hole |
| Arch reads as **nothing** | Walk-through U with no second cue (Tunel 2) | Name the place: merlons (Portal 4), not a naked arch |
| Vessel is a **blob** | Handle hole + spout (Bule 1) | Cup as a U silhouette (Barra 4), not a kettle |
| Lighthouse is **generic** | Lantern + beam (Farol 3) | Nautical default — pick a different noun |

### Design system integration

- Colors **only** from tokens already in the `BRAND.html` `:root` (check 8 fails anything else).
- Mark accent = primary token; neutral = `--ink-100` / `--ink-950`.
- Minimum clearspace = **1×** the mark height on all sides.

### Technical SVG

| Rule | Detail |
|------|--------|
| **Mark-only** | No `<rect rx="14">` app-icon chrome |
| **Valid XML** | ASCII attributes; open every file in a browser |
| **Unified paths** | Prefer 1 silhouette; detail via `clipPath` or `evenodd` |
| **Favicon 32×32** | Its own `viewBox`; never rely on `scale()` |
| **`aria-label`** | Short description, no accents and no em dash |

### Light and dark surfaces

A mark whose body is `--ink-100` disappears on a light background. Ship either:

- a **usage variant** (`logo-<name>-light.svg`) with the neutral inverted — declare it in the HTML as a usage variant, **not** as a new family; or
- a **negative-space** mark, where the form is the accent and the figure is the void — it works on both surfaces for free.

---
## 3. Drawing order

**Master mode (default):**

```
mark-brief.md → references → type → master mark (v1 only)
  → verifier → render-preview → stranger → STOP for human approval
```

**Expand mode (after "aprovado"):**

```
favicon → lockup → remaining families up to 6 → verify all → render-preview → gallery
```

1. **mark-brief.md first** — no SVG before brief.
2. **Master mark only** — recommended candidate before any variant.
3. **Verifier + preview + stranger** — before showing anything as done.
4. **Human gate** — expand only after approval.
5. **Favicon** — redrawn simplification, not scaled.
6. **Lockup** — build it with `make-lockup.mjs`; never draw the letters. Optical alignment only.
7. **Variants** — 3–6 strong families; see [failure-atlas.md](failure-atlas.md) on redraw.
8. **Gallery** — 112px+ preview, caption, family, reference.

---

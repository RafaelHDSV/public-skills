# Mark brief

> Copy to `<logo-dir>/mark-brief.md` after the Strategy Workshop.
>
> **Field names are English and never translated** — `verify-logo.mjs` reads them by name.
> Values are yours, in any language.

## Strategy link

| Field | Value |
|-------|-------|
| **strategy_file** | strategy.yaml |
| **directions_file** | logo-directions.md |
| **approved_directions** | <!-- mirror strategy.yaml, e.g. A, B, C --> |

## Product

| Field | Value |
|-------|-------|
| **brand_name** | <!-- exact, with capitals: the verifier compares it to the lockup wordmark --> |
| **primary_use** | app icon / header / favicon / print |
| **must_read_as** | <!-- one noun, aligned to the approved Direction --> |
| **specific_referent** | <!-- required: see below --> |
| **primary_type** | pictorial / abstract / lettermark / wordmark / combination |
| **metaphor** | <!-- one sentence from the winning Direction --> |

### `specific_referent` — the field that prevents a stock icon

`must_read_as` is a common noun, and a common noun has a stock icon. Asking for "ring" returns
the Lucide ring; asking for "dawn" returns a sun over a horizon.

> **Failure mode:** fifteen briefs written with common nouns returned ninety library icons.
> **Why this field exists:** it answers **which** exemplar, and **seen from where**.

| `must_read_as` | ❌ what came back | ✅ `specific_referent` |
|----------------|-------------------|------------------------|
| dawn | a sun rising behind a line | the first band of light cutting through the slats of a blind |
| ring | a concentric ring (= bullseye) | the closed route the night guard walks, and the point where it restarts |
| stamp | a concentric circle | the edge of ink left behind when the stamp is pressed crooked |
| gap | a key with a missing tooth | two aligned columns where one row has no partner |

Test: if the sentence describes something an illustrator would draw the same way for any
product in the sector, it is not specific yet. Keep going until the sentence only fits **this**
brand.

**And keep naming a physical thing.** The symmetric mistake is escaping the cliché by
abstracting the *process*, which produces an accidental glyph.

> **Failure mode:** a redraw of "light through a slat" became `≠`; one of "knot" became a red
> cross; one of "tamper" became a table. All worse than the clichés they replaced.
> **Why this test exists:** the sentence has to pass this:

> Can someone draw this head-on, without stylising, and can someone else name the object?

If not, the referent is still a concept.

## Constraints

- Legible at 16–32px
- Monochrome-safe
- No mascot, no gradient
- Respects `strategy.yaml` → `avoid`

## References (feel, not shapes)

1. **Same sector:**
2. **Adjacent:**
3. **Aspirational:**

## Anti-reference

| Field | Value |
|-------|-------|
| **sector_default_icon** | <!-- the stock icon for this industry --> |
| **forbidden_gestalts** | <!-- from strategy.avoid + calibration --> |

## Tokens

| Role | Hex |
|------|-----|
| accent | `#` |
| neutral light | `#` |
| neutral dark | `#` |

## The set — one route per mark

At least 6 marks, at least 3 silhouette families. Fill one row per mark: the **route** is the
object this mark takes to the referent, not its finish.

| File | Route | Why it is not the recommended one |
|------|-------|-----------------------------------|
| `logo-v1-` | | **recommended** |
| `logo-v2-` | | |

## SVG metadata

```html
<!-- brief-noun: <must_read_as> -->
<!-- route: <this mark's own route to the referent> -->
```

# Wordmark — how to set the brand name

> **What this is for:** the sanctioned ways to put the brand name into a lockup.
> **Related:** [rebuild-checklist.md](rebuild-checklist.md), [failure-atlas.md](failure-atlas.md), [../scripts/make-lockup.mjs](../scripts/make-lockup.mjs).

## The failure this file prevents

> **Failure mode:** the only instruction was one line in the atlas — **"wordmark as `<text>`"**,
> listed as a failure because the font does not travel with the file. True, and it left no
> sanctioned way to make a wordmark at all. So the agent drew letterforms by hand.
> **Why this file exists:** a prohibition with no route is a prohibition that gets improvised
> around.

Across one batch of fifteen, hand-drawn lettering produced:

| Brand | Lockup actually rendered |
|-------|--------------------------|
| Aurora | `PIMDL` |
| Ronda | `IRALP` |
| Expresso | `OFPFNNRO` |
| Vinheta | `KUGRFN` |
| Vitrine | `VLIIIƐ` (and 1.14:1 against the surface — invisible) |

**15 of 15 wrong. 15 of 15 passed `verify-logo.mjs`**, because the verifier checked geometry and
nobody rendered the file and read it.

Two lessons, both now enforced:

1. **A prohibition is not a method.** Banning `<text>` without giving a correct route guarantees
   the agent invents a worse one. Hand-drawing an alphabet is not a thing an agent can do.
2. **Only a rendered pixel can confirm a letter.** No geometric check will ever catch `PIMDL`.

## Route 1 — embedded subset font (default)

The font *can* travel. Google Fonts' `css2` endpoint takes a **`text=`** parameter and returns a
woff2 containing only the glyphs that string uses. `Aurora` → 5 glyphs → **2.4 KB**, 3.3 KB as
base64. Embed that in the SVG and the file is self-contained and the letters are the real
typeface.

```bash
node "$LOGO_SKILL/scripts/make-lockup.mjs" <logo-dir> \
  --name=Aurora \
  --mark=logo-v1-horizon-rise.svg \
  --font-query="Fraunces:opsz,wght@9..144,600" \
  --ink=#E9EDF5 --ink-light=#14202C
```

The script fetches the subset, embeds it as `@font-face`, measures the rendered width with
headless Chrome (`--dump-dom`, so the viewBox is real and not estimated), and writes both the
dark-surface lockup and its light twin.

The `--font-query` is exactly the `family=` value from the guide's Google Fonts link — copy it
from `BRAND.html` so the lockup and the running type are the same cut.

Resulting file carries its own provenance:

```html
<!-- wordmark: Aurora -->
<!-- wordmark-source: Google Fonts Fraunces 600, woff2 subset (2484B) embedded below; ... -->
<defs><style>@font-face{font-family:'Fraunces';...src:url(data:font/woff2;base64,...)}</style></defs>
<text id="wm" ...>Aurora</text>
```

`verify-logo.mjs` accepts `<text>` **only** when an `@font-face` with a `data:` src is present.

**It survives `<img>`.** This matters, because `BRAND.html` references logos as
`<img src="assets/logos/logo-lockup.svg">`, and an SVG loaded that way runs in a sandbox that
blocks every external resource — a `<link>` to Google Fonts inside the SVG would silently render
the fallback. A `data:` URI is not an external resource, so the embedded subset renders normally,
verified at 56px and at 22px. This is the reason the font must be **embedded** and not linked.

## Route 2 — custom lettering (opt-in only)

Drawing the letters is legitimate brand work, but only when someone is actually designing
letterforms — never as a workaround for route 1. It requires:

| Requirement | Why |
|-------------|-----|
| `<!-- wordmark: NAME -->` matching `brand_name` in the mark brief | verifier can compare |
| `wordmark-proof.txt` in the logo dir | forces the render-and-read step |
| A rendered PNG that was actually looked at | the only check that catches `PIMDL` |

`wordmark-proof.txt` records what was **seen**, not what was intended:

```
rendered: assets/logos/logo-lockup.svg at 52px, dark + light
read back: "Aurora"
expected:  "Aurora"
match: yes
```

Writing "match: yes" without opening the PNG is the failure this file exists to stop.

## Always, both routes

- Render the lockup on **dark and light** and look at it —
  `render-contact-sheet.mjs <out.png> <dir> --mode=lockup`.
- Ink must clear **4.5:1** against the surface it sits on. On a lockup the verifier treats
  low contrast as FAIL, not WARN: an unreadable wordmark is a broken wordmark.
- Ship the light-surface twin (`logo-lockup-light.svg`). Dark-only ink is half a deliverable.
- Never `<text>` without the embedded face, even "temporarily" — temporary files ship.

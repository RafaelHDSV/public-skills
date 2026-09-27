# Flow A — Greenfield branding

Use when there is **no** established product brand, or the user presents a **new idea** only.

## Intake (one pass)

Capture before naming: product, audience, category, tone, constraints, surfaces, scope.

## Phase 5 — Logos

**Invoke skill `logo`.** Announce `Using logo for mark production` and follow `$LOGO_SKILL/SKILL.md` completely.

Pass: product name, `:root` tokens from this guide, output dir `assets/logos/` (or `.docs/<slug>/assets/logos/`), and any constraints from the brief.

Branding then embeds the proof sheet (Recommended, references, shipped alternatives with a reason) into `BRAND.html`. Rejected sketches, contrast audit and batch provenance stay in the logo dir — do not re-implement the logo checklist here.

## Phase 2b — Name signals

Run [check-name.mjs](../scripts/check-name.mjs) with the **exact product name**, then one `WebSearch` pass for category conflict, Instagram and trademark. Record both tables in the Naming section — see [name-validation.md](name-validation.md). Never write "signal not checked"; declare a gap as a gap, with the manual link. No legal clearance claims.

## Phase 8 — Example screen

Read [example-screen.md](example-screen.md). Build a CSS-only mock in `#preview` **after** tokens, type, and logo are stable.

Depict the **primary user task** from positioning (e.g. dashboard list, checkout, editor). Include: recommended logo in chrome, 3 typography roles, semantic status colors if applicable, on-brand copy.

## Phase 9 — Guide shell

Read [brand-guide-shell.md](brand-guide-shell.md). Add sticky nav, copy-to-clipboard, tabs/collapsible, logo modal, and example-screen micro-interactions.

## Phase 10 — Compile `docs/BRAND.html`

Tell the user to open it in a browser. Verify every logo `<img>` loads, shell interactivity works, and the example screen reads as the product thesis.

## Exit criteria

- [ ] Skill `logo` completed (SVGs on disk, verifier clean)
- [ ] Gallery + Recommended documented in the HTML
- [ ] Example screen passes quality gate in [example-screen.md](example-screen.md)
- [ ] Guide shell passes quality gate in [brand-guide-shell.md](brand-guide-shell.md)

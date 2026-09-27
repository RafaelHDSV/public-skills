# Flow B — Evolve existing branding

Use when the product **already exists**: repo, site, app, or partial brand docs.

## Discovery checklist

| Source | Extract |
|--------|---------|
| `docs/BRAND.html` | Current canonical brand (preferred) |
| `docs/BRAND.md` | Legacy — migrate to HTML if present |
| `assets/logos/`, `public/` | Existing SVG/PNG marks |
| `assets/logos/_rejeitadas/` | Marks already rejected — read before redrawing |
| `docs/DESIGN.md` | Tokens, type, components |
| Live UI | CSS variables, Tailwind, copy samples |

## Phase 1 — Inventory

Build an inventory table; embed the summary in the HTML.

Run skill **`logo`**'s `verify-logo.mjs` on the existing set **first** — it usually names the problem faster than reading the files, and it tells you whether the current marks are salvageable or need redrawing.

## Phase 2 — Audit (`brand-guidelines`)

Severity-ranked issues; render as an HTML list/table.

For logos specifically, separate three findings that look alike but are not:

| Finding | Meaning |
|---------|---------|
| Mechanical FAIL | Objectively broken — `<text>`, stacked primitives, off-system hex |
| Parity failure | Passes the script, still reads as clip-art — needs a redraw |
| Stale metadata | Filename, gallery title or distinctness row disagree with the file |

## Phase 3 — Scope agreement

Tighten / refresh / rebrand — confirm if large.

## Phase 4 — Targeted improvements

| Gap | Action |
|-----|--------|
| Logo refresh | **Invoke skill `logo`**; regenerate SVG; render and look before shipping |
| Weak family | Redraw it. Only drop after repeated attempts, with the reason recorded in the HTML |
| Rejected marks | Move to `assets/logos/_rejeitadas/` as a record — do not delete, do not leave in the active set |
| Token chaos | New swatches in the HTML `:root` |
| Missing brand doc | Migrate MD → HTML if needed |

## Phase 5 — Update `docs/BRAND.html`

Merge changes; add a **Changelog** section with the date. Update every logo `<img>` ref if files changed, and update the distinctness and rejected-directions tables in the same pass.

Refresh the **example screen** when tokens, logo, or positioning changed — see [example-screen.md](example-screen.md). Base it on the primary live route when a UI exists.

## Phase 6 — Sync implementation

Update `docs/DESIGN.md` + code when the user wants same-session implementation.

## Exit criteria

- [ ] HTML updated; browser-reviewable
- [ ] Logo files on disk match the HTML gallery, filenames included
- [ ] Skill `logo` completed (`verify-logo.mjs` zero FAIL)
- [ ] Rejected marks archived with a recorded reason
- [ ] Changelog entry added
- [ ] No prompt-only logo deliverables
- [ ] Example screen reflects current positioning and tokens

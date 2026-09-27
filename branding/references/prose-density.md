# Prose density in `docs/BRAND.html`

The guide is for **review in browser** — interactivity (toast, modal, hover) replaces instructional copy.

## Write

| Pattern | Example |
|---------|---------|
| **Tables over paragraphs** | Domain signals in a table; date in `<h3>` or column — not a disclaimer paragraph above |
| **One global disclaimer** | Footer only: domain and trademark signals are not legal confirmation |
| **Collapsible for depth** | Gate commands, annotation tables, rejection lists in `<details>` |
| **Short cells** | `NXDOMAIN` not "NXDOMAIN — no DNS record" when the badge already says available |

## Do not write

- "Clique para copiar" on every swatch — toast handles it
- "Clique para ampliar" on every logo card — modal + hover suffice
- Repeated limits blocks per section (registrar, INPI, agent, lawyer…)
- "Mock interativo: filtre por…" before an obviously interactive UI
- Script re-run commands in body — lives in skill/docs, not the artifact

## Skill vs artifact

| Lives in skill/reference | Lives in BRAND.html |
|--------------------------|---------------------|
| `check-name.mjs` usage | Result table + date |
| Legal limits explanation | One footer line |
| verify-logo command | Nothing — it is a gate, not content |
| `check-contrast.mjs` output | Nothing — see [brand-guide-shell.md](brand-guide-shell.md) |
| Rejected sketches, batch provenance | Nothing — `mark-brief.md` / `strategy.yaml` |
| Artifact paths and file names | Nothing — the repo already says where files are |

## The guide shows the brand, not the process

The test for any new block: **is the reader of this document deciding about the brand, or
auditing how it was made?** If the second, the block belongs in the logo directory.

> **Failure mode:** four blocks accumulated that failed this test — a table of rejected
> sketches, a WCAG contrast table, a batch provenance note, and an entire Handoff section
> listing file paths.
> **Why this rule exists:** none of the four was about the brand, and together they pushed the
> parts that were below the fold.

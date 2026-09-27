# Trace checklist — LEGACY / fallback only

> **Status:** off the happy path. Prefer [rebuild-checklist.md](rebuild-checklist.md).
> Auto-trace (Trace Bitmap, potrace) stays **forbidden**.
> Use this file only when a human explicitly asks for `/logo legacy`, or when an internal
> candidate is already clean geometry and passes the Critic without a redraw.

## When (rare)

- A human asked for a trace, in those words
- An internal SVG candidate is already geometric and survives the Critic unchanged

## Checklist, if forced

- [ ] The source is recorded in `mark-brief.md`
- [ ] Redraw the silhouette — do **not** vectorise blind
- [ ] Provenance comment, if you must:

```html
<!-- brief-noun: ... -->
<!-- traced-from: <id> -->   <!-- legacy; prefer route + authored geometry -->
```

- [ ] verify + preview + stranger all still run
- [ ] The Logo Critic is still mandatory before expand

See [rebuild-checklist.md](rebuild-checklist.md) for the normal flow.

# Provenance — what this skill consolidates

> **Purpose:** credit and contracts for the external logo workflows folded into `logo`.
> **Related:** [SKILL.md](../SKILL.md)

This skill is the hub's **single logo owner**. It merges three sources into one callable workflow.

| Source | Role absorbed here | Keep / drop |
|--------|--------------------|-------------|
| Hub branding logo phase (former `branding/references/logo-*.md` + `verify-logo.mjs`) | Authored SVG pipeline, catalog, mechanical verifier, human gates | **Owns** — canonical |
| [logo-generator](https://agentskillsfinder.com/pt/skills/logo-generator-skill) (`op7418/logo-generator-skill`) | Structured brief, 6+ concept variations, design-pattern thinking, showcase framing | Patterns only — optional sketch phase |
| [logo-creator](https://agentskillsfinder.com/pt/skills/logo-creator) (`ReScienceLab/opc-skills`) | Discovery questions, style families, compare → crop → bg-remove → vectorize loop | Patterns only — optional raster→SVG path |

## Contracts from logo-generator (patterns)

Use when exploring direction **after** the 3 catalog references:

1. Strong brief: product name, sector, core concept, design preferences, hard constraints (32px, mono, no mascot).
2. Generate **6+ distinct families**, not micro-edits of one idea.
3. Pick one direction; refine shape language, spacing, color, mood — not "make it better".
4. Export thinking may mention SVG/PNG showcase — **final ship is authored SVG** in this skill.

Install (optional, not required to run `logo`):

```bash
npx skills add op7418/logo-generator-skill --skill logo-generator
```

## Contracts from logo-creator (patterns)

Use when the user wants a raster-assisted exploration loop:

1. Discovery before generation: name, use case, style, aspect, colors, references to mimic/avoid, first surface.
2. Style family language (minimal flat, isometric, pixel, hand-drawn) instead of vague "modern".
3. Batch → shortlist 2–3 → directed revision → finish (crop / bg / vectorize **if** those tools and keys exist).
4. Archive explorations under `.skill-archive/logo/<yyyy-mm-dd-slug>/` when using AI image tools.

Install (optional):

```bash
npx skills add ReScienceLab/opc-skills --skill logo-creator
```

Roundtable uses **free providers** (Cursor, Pollinations, Stitch); optional `FIGMA_FILE_KEY` in the environment. Recraft and Gemini Imagen are **not** used. Other raster APIs (`REMOVE_BG_API_KEY`, `nanobanana`) remain optional for legacy raster→SVG paths.

## Licenses (checked 27/09/2026)

No source file from either repo was copied.

| Upstream | License on that date | File |
|---|---|---|
| [op7418/logo-generator-skill](https://github.com/op7418/logo-generator-skill) | README states MIT. No `LICENSE` file; GitHub's license API returns 404 | [README](https://github.com/op7418/logo-generator-skill/blob/main/README.md) |
| [ReScienceLab/opc-skills](https://github.com/ReScienceLab/opc-skills) (`skills/logo-creator`) | Apache-2.0. No `NOTICE` file | [LICENSE](https://github.com/ReScienceLab/opc-skills/blob/main/LICENSE) |

## Non-negotiable override (hub)

Regardless of which external pattern you used:

- Deliverable = **SVG files** on disk (`assets/logos/` or path the user named).
- Run `verify-logo.mjs` with zero FAIL before showing marks.
- Prompt text, chat-only images, or unedited vectorized dumps are **not** done.

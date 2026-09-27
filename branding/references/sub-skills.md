# Complementary skills — contracts for branding orchestration

## logo (hub — mandatory for marks)

| | |
|---|---|
| **When** | Every logo phase in Flow A/B; also when the user asks only for logos (prefer invoking `logo` directly) |
| **Input** | Product name, `:root` tokens (or hexes), output dir, constraints |
| **Output to merge** | SVG files in `assets/logos/` + fields for the HTML gallery |
| **Path** | `$LOGO_SKILL/SKILL.md` |
| **Critical** | Branding **does not** author logos itself. Announce `Using logo for mark production` and follow that skill. External `logo-generator` / `logo-creator` patterns live inside `logo` as optional sketch phases — see `logo/references/sources.md`. |

### Logo pipeline (owned by skill `logo`)

```
logo catalog (3 real brands)
  → skill logo (type + authored set + verifier + render + human tests)
  → [optional] AI sketch (logo-generator / logo-creator patterns)
  → final SVG in assets/logos/
  → BRAND.html gallery (branding merges)
```

## domain-name-brainstormer

| | |
|---|---|
| **When** | Flow A phase 2; Flow B only if a rename is requested |
| **Output** | Naming section in `BRAND.html` |
| **Install** | `npx skills add softaworks/agent-toolkit --skill domain-name-brainstormer` |

## ui-design-system

| | |
|---|---|
| **When** | After visual direction; token cleanup in Flow B |
| **Output** | `:root` in `BRAND.html` + live swatches and type specimens |
| **Install** | `npx skills add alirezarezvani/claude-skills --skill ui-design-system` |

## app-icon-optimization

| | |
|---|---|
| **When** | Mobile/store product |
| **Output** | SVG/PNG in `assets/logos/` + size preview in the HTML |
| **Install** | `npx skills add Eronred/aso-skills --skill app-icon-optimization` |
| **Note** | Prefer after skill `logo` has a recommended mark. A negative-space mark usually works best as app icon. |

## brand-guidelines

| | |
|---|---|
| **When** | Voice section; Flow B audit |
| **Output** | On/off-brand boxes and audit tables in the HTML |
| **Install** | `npx skills add alirezarezvani/claude-skills --skill brand-guidelines` |

## prototype (UI.md branch)

| | |
|---|---|
| **When** | Layout uncertain |
| **Output** | UI mock `<section>` in `BRAND.html`, or a disposable route link |
| **Install** | `npx skills add mattpocock/skills --skill prototype` |

## Related skills in this pack

| Skill | Relationship |
|-------|--------------|
| `logo` | **Logo owner** — branding delegates; callable standalone |
| `frontend-design` | Downstream: `docs/DESIGN.md` from brand tokens |

## Orchestration rules

1. **HTML is the brand guide** — not markdown, unless the user explicitly requests MD.
2. **Logos are files via skill `logo`** — 6 marks across distinct silhouette families is the
   target; a count padded with recolours is worse than three good ones. The HTML references them.
3. Do not re-implement `logo` inside branding.
4. End the chat with: the path to `BRAND.html` + **"abra no navegador"** + the logo recommendation.

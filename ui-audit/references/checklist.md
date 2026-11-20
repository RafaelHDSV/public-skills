# Checklist — the 10 dimensions

> Every finding names its dimension. A dimension with nothing wrong is still marked in the report's
> checklist table (`OK` / `parcial` / `falhou`), so the reader sees it was looked at.
>
> **Field** = where the evidence sits in `medidas.json` (per capture, under `medidas`). A field with
> items is a lead, never a finding by itself: confirm it on the PNG first.

## 1. Typography

| Check | Threshold | Field |
|---|---|---|
| Readable interface text | **≥ 14 px**; body of reading **16 px** | `textoPequeno` (grouped by size + selector, with character count) |
| Where the small text lives | dense tables, cell secondaries, chips, nav and footer links | `textoPequeno[].amostras[].dobra` → which PNG |
| Size distribution | most characters should be at body size; a page whose biggest bucket is 11–13 px is a dense-table problem | `tamanhosDeFonte` (px → characters) |
| Hierarchy | one `h1`; no skipped level; heading sizes clearly above body | `titulos` (`quantidadeH1`, `saltos`, `lista[].tamanho`) |
| Line length and leading | ~60–90 characters per line in prose; line-height ≥ 1.4 in body | PNG |

Exceptions to the 14 px floor, only when the doc lists them: a 2–4 character badge, a footer legal line.
A legend scale in `DESIGN.md` (e.g. "13 legenda") is not a license for whole table columns at 11 px.

## 2. Color and contrast

| Check | Threshold | Field |
|---|---|---|
| Text vs its real background | **4.5:1**; **3:1** for large text (≥ 24 px, or ≥ 18.66 px bold) | `contrasteBaixo` (ratio, hex pair, selector) |
| Text on gradient or image | measured by eye on the PNG | `contrasteIndeterminado` |
| Tokens vs use | a token that fails 4.5:1 on the surface it is used on is a **token** finding, not one per screen | `contrasteBaixo[].texto` repeated across routes |
| States | selected, hover, focus, disabled still readable | PNG |

A disabled control is exempt from WCAG contrast; say "desabilitado" in the finding when you still flag it.

## 3. Spacing

| Check | Threshold | Field |
|---|---|---|
| Rhythm | spacing from the doc's scale (e.g. 4/8/12/16/24/32); sections separated consistently | PNG + styles |
| Crowding | controls or chips touching; text glued to borders | PNG |
| Dead space | a large empty band with no reason (check the doc first: a centered layout may be deliberate) | PNG |

## 4. Alignment

| Check | Threshold | Field |
|---|---|---|
| Controls side by side | same height, same top (select × search × segmented) | `controlesDesalinhados` (`diferencaAltura`, `diferencaTopo`) |
| Wrapped lines | the second line of a list item / `<summary>` aligns with the text, not with the icon | PNG |
| Table headers vs cells, grids | columns line up; numbers right-aligned and tabular | PNG |

## 5. Components and states

| Check | Threshold | Field |
|---|---|---|
| Buttons and links | one primary per area; link color from the palette | PNG |
| Hover / focus / press | house pattern: the `frontend-design` reference `interaction-loading-error.md` | manual (optional deep pass below) |
| Native controls in dark theme | select, input, checkbox follow the theme (`color-scheme`) | PNG (dark) |
| Form errors, loading, empty | visible, centered, with text | PNG; simulate with the `Fetch` domain (browser-pass.md) |

**Optional deep pass — interaction.** Hover every kind of clickable through the DevTools Protocol and
compare computed styles before and after. It takes a long time and is a separate pass; if the project
already has one (consorcio-explica: `yarn auditar:interacao`), run that and cite its result.

## 6. Responsive layout

| Check | Threshold | Field |
|---|---|---|
| Page wider than the screen | no horizontal scroll at 390 px | `overflowHorizontal` (`excesso`, `culpados`) |
| Part of a component hidden in an inner scroll | allowed only with a visible cue (fade, arrow, cut item that reads as "more") | `rolagemInterna` (`visivel` vs `conteudo`) |
| Touch targets | **≥ 44 × 44 px** at phone width (inline links in running text are exempt) | `alvosPequenos` (only at widths < 600) |
| Header and nav on phone | no wrapping into a second messy row, no cut label | PNG (`*-390.png`) |
| Long words | identifiers and URLs do not break mid-word into unreadable pieces | PNG |

## 7. Images and media

| Check | Threshold | Field |
|---|---|---|
| Proportion | not stretched | `imagens[].distorcida` |
| Sharpness | not upscaled beyond its pixels | `imagens[].ampliada` |
| Placeholders, broken images, logo on both themes | — | PNG |

## 8. Content and microcopy

| Check | Field |
|---|---|
| Tone of the doc's voice; no code vocabulary in front of the user unless the screen is technical | PNG + `DESIGN.md` voice |
| The same thing named the same way on every screen (status lines, labels) | PNG, compared across routes |
| Numbers that mislead or have no context (a counter nobody asked for, "0 visits") | PNG |
| Redundancy: the same sentence twice on one screen | PNG |

## 9. Theme parity

| Check | Threshold | Field |
|---|---|---|
| The requested theme is the rendered one | — | `temaRenderizado.escuro` (and the `⚠` line in the terminal) |
| Surfaces separate from the page in **both** themes | background ratio ≥ 1.25, or a border ≥ 1.2 | `superficiesFracas` |
| Nothing "stayed" from the other theme | e.g. a dark card on the light page, white native controls on the dark page | PNG, light vs dark side by side |
| Accent colors keep contrast on the dark surface | 4.5:1 for text | `contrasteBaixo` on `*-escuro-*` |

## 10. Consistency with `docs/DESIGN.md`

| Check | Field |
|---|---|
| Sizes in use vs the doc's type scale | `tamanhosDeFonte` vs the scale |
| Colors in use vs the token table | `contrasteBaixo[].texto/fundo`, styles |
| Declared layout and component rules vs the screen | PNG |
| **The doc against good UX**: when the doc defends something that hurts the reader, the finding says the doc has to change | — |

---

## Severity guide

| alta | média | baixa |
|---|---|---|
| Blocks use or reading on a main flow; a theme renders the wrong surface; content cut off on phone with no cue | Costs effort or a second look; inconsistent controls; weak separation; small touch targets | Refinement, consistency, copy |

When one cause produces findings on many screens (a token, a shared component), it is **one** finding,
with every affected route listed — not one per screen.

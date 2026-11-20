---
name: ui-audit
description: >-
  Use when the user wants a strict UI/UX review of an app before calling it done — "ui-audit",
  "/ui-audit", "auditoria de UI", "revisar a interface antes de publicar",
  "farpas de UX". Opens the running app in Chrome in light and dark themes at desktop and phone width,
  measures text size, contrast, alignment, touch targets and overflow, looks at every screenshot,
  cross-checks docs/DESIGN.md and the front code, and writes one prioritized findings report to
  .reviews/. Read-only: it fixes nothing. Not for implementing visual changes (frontend-design) nor
  for brand work (branding / logo).
license: MIT
metadata:
  author: RafaelHDSV
---

# UI audit — the review before "it's almost ready"

Codifies a strict pre-ship UI review: someone direct who demands legibility, contrast, alignment and
hierarchy, and does not spare an internal tool. That direct voice shows up only in the executive
summary; findings are technical.

**Deliverable:** one markdown file per run, `.reviews/<YYYY-MM-DD-HH-MM-SS>-<repo-slug>-ui-audit.md`, plus
its screenshots in `.reviews/ui-audit/<same name without .md>/`. The chat gets only the path, the count
by severity and the top three findings.

## Locks

| Rule | Why |
|---|---|
| **No screen seen, no visual finding.** Every visual finding cites the PNG that shows it | A review that "farpa" without looking is noise with confidence |
| **A measurement is evidence, not a verdict.** Open the PNG before turning a number into a finding | The script misses context (decorative text, disabled state, intentional design) |
| Script or browser failed → **stop** and report the blocker | Never fill the gap from the code alone |
| **Read-only** on the product: no code change, no commit, no issue, no comment | Fixes are `frontend-design`'s job; GitHub writes are § 1.3's |
| Never read or quote the project's `.env`; logins use a test password through the environment | § 1.2 |
| One run = **one new file**; never overwrite an earlier audit, even from the same day | The previous run is the baseline for "did it get better" |
| At most **25 findings**; the rest goes to "Backlog sugerido", grouped | A 70-item list gets nothing fixed |

## Flow

### 1. Project and documents

Resolve the project root of the app (the cloned repo, not the `repos/` workspace). Read, when they exist:
`docs/context.md`, `docs/DESIGN.md`, `docs/frontend.md` (routes and components), and the design tokens
(`_global.scss`, `index.css`, Tailwind config). Note the **declared** rules: type scale, palette, spacing,
theme behavior. Dimension 10 of the checklist compares them with what the screen shows.

### 2. A running app

Prefer an app you start yourself, on **its own ports**, so the user's `yarn dev` (3333/3693) is never
touched. Procedure, logins and cleanup: [references/browser-pass.md](references/browser-pass.md). If the user
gives a URL, use it.

### 3. Capture and measure

Pick the routes (from `docs/frontend.md` or the router; the default set is in browser-pass.md) and run the
bundled script, from the workspace root:

```bash
# SKILL_DIR = the folder of this SKILL.md; RUN = <YYYY-MM-DD-HH-MM-SS>-<repo-slug>-ui-audit
MSYS_NO_PATHCONV=1 node "$SKILL_DIR/scripts/auditar-telas.mjs" \
  --base http://localhost:3702 --saida ".reviews/ui-audit/$RUN" \
  --rota /=inicio --rota /lista=lista --rota "/form?x=1=formulario" \
  --esperar main --esperar-em lista=table --dobras 2 \
  --chave-tema app-tema          # only if the app keeps the theme in localStorage
```

Defaults: themes **light and dark**, widths **1440 and 390**. Output per route x theme x width: viewport
PNGs (`<name>-<tema>-<largura>[-<dobra>].png`) and one `medidas.json`. Every flag and the login variables:
the header of [scripts/auditar-telas.mjs](scripts/auditar-telas.mjs).

Check the terminal for `⚠ tema pedido …`: it means the app ignored the theme request — fix the
`--chave-tema` before going on, or every dark finding is about the light screen.

### 4. Look

Open **every** PNG. For each route, read `medidas.json` beside it (`totais`, then the groups) and confirm
each measured item on the screen. Then look for what no measurement catches: hierarchy, crowding, empty
space, things that "stayed" from the other theme, copy, inconsistency between screens. The fields the
script produces and what each one supports are listed per dimension in
[references/checklist.md](references/checklist.md).

### 5. Code

For the screens visited, read the styles and components that produce each finding (read-only), so the
suggestion names the real file and token: "`Dicionario.module.scss` `.secundario` em 11 px", not "aumentar
a fonte".

### 6. Report

Fill [references/report-template.md](references/report-template.md), severity first, then save. In the
chat: the path, the count per severity, the top three findings, and the reminder that nothing was changed
in the project and nothing was written to GitHub.

Market references (Linear, Stripe, Notion, Vercel, GitHub) calibrate the bar, never the layout — and a
number attributed to them is either measured now or not said: [references/benchmarks.md](references/benchmarks.md).

## Severity

| Severity | Means | Examples |
|---|---|---|
| **alta** | Blocks use or reading for the person who uses the screen all day | body text at 11–12 px in a dense table, text that fails contrast on the main flow, a theme that renders the other theme's surface, content cut off on phone |
| **média** | Gets in the way, forces effort or a second look | controls side by side at different heights, a surface that barely separates from the page, a 30 px touch target |
| **baixa** | Refinement and consistency | microcopy that changes between screens, heading level skipped, a link color off the palette |

## Anti-patterns

- Writing a contrast or size finding without having opened the PNG.
- Copying `medidas.json` into the report as findings, one per group. The report is a judgment.
- Writing a "most of the text" or a count from memory of one screen. Re-read `tamanhosDeFonte` per
  route before the summary: a dense table screen can be mostly 11–13 px while a docs screen is mostly
  16 px with small metadata — one sentence for both is wrong.
- Flagging a disabled control's low contrast as a failure without saying it is disabled (it is exempt
  from WCAG; it may still deserve a note if it is unreadable).
- Treating `docs/DESIGN.md` as always right. When the doc defends something that hurts the reader, say
  so — and say it is the doc, not the code, that has to change.
- Suggesting a fix in the abstract. Name the file, the selector and the token.
- Fixing anything. Even a one-line fix waits for `frontend-design` and the user.

## Related skills

| For | Use |
|---|---|
| Implementing the fixes, updating `docs/DESIGN.md` | [`frontend-design`](../frontend-design/SKILL.md) |
| Brand guide or naming (not a screen audit) | [`branding`](../branding/SKILL.md) |
| Marks / favicons | [`logo`](../logo/SKILL.md) |
| Reviewing a PR's code | [`pr-review`](../pr-review/SKILL.md) |

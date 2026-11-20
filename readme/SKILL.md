---
name: readme
description: >-
  Use when writing a project's README or bringing an existing one up to a strong product pattern —
  "melhora o README", "README vendável", "README no padrão", "repaginar o README", "README em
  inglês", or a card that updates READMEs. Produces README.md (pt-BR) + README.en.md (full mirror):
  brand lockup, badges, one small hero screen in light and dark, emoji sections, a collapsed screen
  gallery, short setup, commands and docs tables — with screens captured by the bundled script and
  numbers checked against the code. Not for docs/ living docs nor brand creation (skill branding / logo).
license: MIT
metadata:
  author: RafaelHDSV
---

# README — a product-grade pattern

Every product README should follow the same skeleton so a visitor sees **what it is, why it matters
and what it looks like** before scrolling, and a developer finds **how to run it** in one short block.

Output is **pt-BR** in `README.md` and a **full English mirror** in `README.en.md`. Use clear
Brazilian Portuguese with correct accents; English prose is professional and complete.

| Skeleton | File |
|---|---|
| pt-BR | [references/modelo.pt-BR.md](references/modelo.pt-BR.md) |
| English | [references/modelo.en.md](references/modelo.en.md) |
| Screen capture | [scripts/capturar-telas.mjs](scripts/capturar-telas.mjs) |

---

## 1. Gather before writing

Read, do not guess. Every claim in the README must come from one of these:

| What | Where |
|---|---|
| Name, tagline, audience, out-of-scope | `docs/context.md`, `docs/especificacao.md`, the repo description |
| Stack for the badges | `package.json` files (front, back, root), `.nvmrc` |
| Logo | `assets/logos/` — a lockup for light and one for dark. None? Text title only, and suggest skill `logo`; never draw one here |
| Numbers ("317 dúvidas", "67 regras") | Count them in the code or data **today**. A number you cannot count does not go in |
| Setup and commands | Root `package.json` scripts and `docs/ambiente-e-operacao.md` |
| Docs table | Files that actually exist in `docs/` |

## 2. The skeleton, in order

Sections 1–5 are the header block (centered `<p align="center">`). Keep the order; drop a section
only when the "drop when" column says so.

| # | Section | Rule | Drop when |
|---|---|---|---|
| 1 | Lockup | `<picture>` with dark `srcset` + light `<img>`, width ~240 | No logo: plain `<strong>` title |
| 2 | Tagline | Bold line: what it does. Second line: for whom / with what guarantee | Never |
| 3 | Badges | shields.io static badges: status + 3 to 5 stack items, colors from the product palette | Never |
| 4 | Hero screen | `<picture>` light/dark, **width ≤ 560**. The screen that shows the product working, not the login | No UI (library, CLI): drop, or a terminal capture |
| 5 | Language link | `🇧🇷 Português · 🇺🇸 English` linking the two files | Never |
| 6 | 🤔 O problema / The problem | 2–4 sentences: the pain, who feels it, what this does instead | Never |
| 7 | ✨ O que só ele garante / What only it guarantees | Table of 3–5 rows, emoji + bold claim + one line of proof | Never |
| 8 | 🧭 Como usar / How it's used | 3–4 numbered steps of the main flow | Pure library: replace with a short usage snippet |
| 9 | 📸 Ver as telas / See the screens | `<details>` collapsed; `<table>` 2×N, each cell an `<a>` to the full image wrapping the `<img>`, plus a `<sub>` caption | No UI |
| 10 | 🚀 Rodar / Run it | One "Precisa de:" line + **at most ~6 commands** + link to `docs/ambiente-e-operacao.md` | Never |
| 11 | 🧰 Comandos do dia a dia / Everyday commands | Table of the scripts people actually run | Fewer than 3 scripts |
| 12 | 📚 Documentação / Documentation | Table "Para → Leia" of docs that exist | No `docs/` |
| 13 | 🔐 Governança or 📄 Licença | Private/internal: governance bullets. Public: license line | Never |

Environment variables, deploy, staging and troubleshooting **never** go in the README — they live in
`docs/ambiente-e-operacao.md`. The README links there.

## 3. Screens

Screens are where READMEs silently rot. Full-page captures often corrupt galleries (the page
repeated side by side) and nobody notices for weeks. Hence the rules:

- **Capture with the bundled script only**: viewport 1440×900, never full page. It drives Chrome
  through the DevTools Protocol, with light and dark themes and an optional login.
- **Fictitious data only.** A demo account, no real customer, team member or personal e-mail.
- **Look at every PNG** before linking it, by opening the image. No mechanical check catches a
  repeated or cropped screen.
- Files go to `assets/screenshots/`, kebab-case pt-BR names, PNG. The hero has `<name>.png` and
  `<name>-escuro.png`.

The script sits next to this file. Run it from the project root by its absolute path
(`SKILL_DIR` = the folder of this `SKILL.md`):

```bash
# Light and dark, after starting the app locally
node "$SKILL_DIR/scripts/capturar-telas.mjs" \
  --base http://localhost:3333 --saida assets/screenshots --tema ambos \
  --rota /=inicio --rota "/simular?caso=…=simular" --esperar main
```

On Windows Git Bash, prefix the command with `MSYS_NO_PATHCONV=1`: MSYS rewrites `/regras` and
`CAPTURA_LOGIN_URL=/api/login` into `C:/Program Files/Git/...`, and the script refuses to run with
a path that lost its leading `/`.

Logins, theme storage keys and every flag: the header of
[scripts/capturar-telas.mjs](scripts/capturar-telas.mjs). Secrets (passwords, tokens) go in
environment variables, never as arguments, and the script never prints them.

## 4. The English mirror

- Same sections, same order, same images, same commands. Only the prose is translated, and it is
  translated, not summarized.
- Section titles keep the emoji: `🤔 The problem`, `✨ What only it guarantees`,
  `🧭 How it's used`, `📸 See the screens`, `🚀 Run it`, `🧰 Everyday commands`,
  `📚 Documentation`, `🔐 Governance` / `📄 License`.
- Product names and UI labels stay as the UI shows them. Use the English UI label when the app
  has an English UI.
- Changing one file means changing the other in the same step.

## 5. Delivery checklist

Run it before saying the README is done, and paste the result when the README goes into a PR.

- [ ] Both files exist, link each other at the top and have the same sections in the same order.
- [ ] Every `<img>`/`srcset` path exists in the repo; nothing outside an HTML comment points to a
      missing file.
- [ ] Hero ≤ 560 px wide on the page, with a dark variant if the app has a dark theme; the other
      screens are inside the collapsed `<details>`.
- [ ] Every screen was captured by the script, is 1440×900, and was **looked at**: no repetition,
      no cropping, no real data.
- [ ] Every number in "✨" was counted today in the code or data.
- [ ] "🚀 Rodar" has at most ~6 commands, and they run on a clean clone; the rest lives in
      `docs/ambiente-e-operacao.md`.
- [ ] Docs table lists only files that exist.
- [ ] pt-BR with correct accents; English is a full mirror.

## Do not

| Forbidden | Instead |
|---|---|
| Full-page screenshots, or the Chrome `--screenshot` flag | `scripts/capturar-telas.mjs` (viewport) |
| A hero wider than 560 px, or a gallery outside `<details>` | The skeleton's sizes |
| Env vars, deploy steps, troubleshooting in the README | `docs/ambiente-e-operacao.md` + a link |
| A number you did not count | Count it, or leave it out |
| Translating only `README.md` and leaving `README.en.md` stale | Both in the same step |
| Drawing a logo to fill section 1 | Text title + suggest skill `logo` |
| Committing or pushing the README without an explicit ask | Wait for the user to request git writes |

## Related skills

| For | Use |
|---|---|
| Marks / favicons for the lockup | [`logo`](../logo/SKILL.md) |
| Brand guide or naming | [`branding`](../branding/SKILL.md) |
| Polish UI / `docs/DESIGN.md` | [`frontend-design`](../frontend-design/SKILL.md) |
| Strict UI audit before ship | [`ui-audit`](../ui-audit/SKILL.md) |

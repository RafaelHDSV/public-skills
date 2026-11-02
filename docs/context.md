# public-skills — contexto

> **Para que serve:** hub `ai-context` deste pacote de skills.
> **Fonte da verdade:** pastas `*/SKILL.md` e `references/`.
> **Relacionados:** [especificacao](especificacao.md) · [ambiente-e-operacao](ambiente-e-operacao.md)

## Objetivo

Pacote público de agent skills (logo, branding, frontend-design, daily-standup, cherry-pick-env-prs, pr-review) instalável via `npx skills add`.

## Stack

| Camada | Tecnologia |
|---|---|
| Formato | `SKILL.md` + references/scripts |
| Runtime auxiliar | Node (stdlib) onde a skill precisar |
| Distribuição | GitHub + `npx skills add`

## Decisões fixas

1. Cada pasta = uma skill completa e instalável sozinha.
2. `pr-review` é read-only no GitHub salvo override explícito `--comment` (pending, sem `event`).
3. `branding` não desenha marcas — use com `logo`.

## Índice

| Documento | Conteúdo | Quando ler |
|---|---|---|
| [context.md](context.md) | Este hub | Sempre |
| [especificacao.md](especificacao.md) | Catálogo das skills | Antes de alterar uma skill |
| [ambiente-e-operacao.md](ambiente-e-operacao.md) | Install | Antes de publicar/instalar |
| [README.md](../README.md) | Pitch | Onboarding |
| [CHANGELOG.md](../CHANGELOG.md) | Mudanças | Release |

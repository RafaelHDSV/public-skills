<p align="center">
  <strong>public-skills</strong>
</p>

<p align="center">
  <strong>Skills de agente prontas para instalar.</strong><br />
  Logo, marca, UI, standup, cherry-pick de ambiente e review de PR — cada pasta é uma skill completa.
</p>

---

## Por que existe

Repetir o mesmo briefing de logo, review ou standup em todo chat desperdiça contexto. Este repositório empacota skills públicas com `SKILL.md`, referências e scripts, instaláveis com um comando.

## O que você ganha

| Skill | Em uma frase |
|---|---|
| **logo** | Marcas SVG, favicon e wordmark a partir de um brief curto |
| **branding** | Guia de nome, paleta, tipo e voz (sem desenhar marks) |
| **frontend-design** | Telas e nota de design sem cara de template genérico |
| **daily-standup** | Standup curto com data, bullets e links |
| **cherry-pick-env-prs** | Porta PR mergeado para branches de ambiente |
| **pr-review** | Review em markdown local; GitHub só com `--comment` pending |

## Como funciona

```text
npx skills add RafaelHDSV/public-skills --skill <nome>
        ↓
SKILL.md + references/ (+ scripts) no diretório de skills do agente
        ↓
Prompt cita a skill  →  agente segue o contrato
```

Instale `logo` junto com `branding`. Sem GitHub, aponte o agente a esta pasta ou copie para `~/.cursor/skills/` / `~/.claude/skills/`.

## Posicionamento

| public-skills é | public-skills não é |
|---|---|
| Pacote instalável de skills | Rules privadas do hub AGX |
| Contratos explícitos (ex.: pr-review read-only) | Aprovar/mergear PRs |
| Uma pasta = uma skill | Monólito de prompts |

## Começar

Comandos de install: [`docs/ambiente-e-operacao.md`](docs/ambiente-e-operacao.md). Catálogo: [`docs/especificacao.md`](docs/especificacao.md). Contexto: [`docs/context.md`](docs/context.md).

Contribuição: [`CONTRIBUTING.md`](CONTRIBUTING.md) · conduta: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) · mudanças: [`CHANGELOG.md`](CHANGELOG.md).

# Calibracao — concluida (2026-09-10)

14 rounds de marcas ficticias. Resultado destilado em:

**[../references/calibration-profile.md](../references/calibration-profile.md)**

Rounds temporarios (`round-*`, `specs/`, UI server) foram removidos apos consolidacao na skill.

## Recalibracao com briefs reais (Fase E)

Quando logos de produto real continuarem fracos apesar do pipeline master-first:

1. Salvar cada tentativa rejeitada na tabela **rejected-directions** do `BRAND.html` ou `mark-brief.md`.
2. Anotar: brief noun, gestalt tentado, nota humana (1–5), motivo.
3. A cada ~10 briefs reais ou trimestre, rodar 1 round de calibracao so com **briefs de produto** (nao reutilizar slugs Dossel/Portico como templates).
4. Atualizar [calibration-profile.md](../references/calibration-profile.md) e [failure-atlas.md](../references/failure-atlas.md) — principios de construcao, nunca substantivos fixos.
5. Endurecer `verify-logo.mjs` se a mesma falha mecanica repetir 3+ vezes.

Nunca: copiar marca vencedora de calibracao para outro `must_read_as`.

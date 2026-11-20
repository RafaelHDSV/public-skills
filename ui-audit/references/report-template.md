# Report template

> Save as `.reviews/<YYYY-MM-DD-HH-MM-SS>-<repo-slug>-ui-audit.md`, with the PNGs in
> `.reviews/ui-audit/<same name without .md>/`. pt-BR with accents. The section names, field names and
> severity values below are the artifact's format — keep them as written.
>
> Evidence links are relative to the report: `ui-audit/<run>/<file>.png`.

```markdown
# Auditoria de UI — <repo>

| Campo | Valor |
|---|---|
| Repositório | <owner/repo> (`<branch>` @ `<short sha>`) |
| Data | DD/MM/AAAA HH:MM |
| Base | <URL ou "servidor descartável em portas próprias"> |
| Rotas | `/` (inicio), `/x` (nome), … |
| Temas × larguras | claro e escuro × 1440 e 390 px |
| Evidência | [ui-audit/<run>/](ui-audit/<run>/) — PNGs e `medidas.json` |
| Documentos lidos | `docs/DESIGN.md`, `docs/frontend.md`, … |

## Resumo

<3 a 5 bullets. É o único lugar com tom de revisor exigente: direto, pode ter humor leve, nunca ofensivo.>

| Severidade | Achados |
|---|---|
| alta | N |
| média | N |
| baixa | N |

## Achados

### Alta

#### A1. <título curto, o problema e não a solução>

- **Rotas:** `/x` (claro, escuro), `/y` (390)
- **Dimensão:** <1 a 10 do checklist>
- **O que se vê:** <descrição; o número medido quando houver: "12 px", "3,35:1", "26 × 43 px">
- **Evidência:** [x-claro-1440.png](ui-audit/<run>/x-claro-1440.png) · `medidas.json` › `textoPequeno`
- **Causa no código:** `<arquivo>` `<seletor>` — `<token ou valor>`
- **Sugestão:** <o que mudar, nomeando arquivo e token>
- **Referência:** <regra do checklist, `DESIGN.md` § X, ou benchmark medido>

### Média

#### M1. …

### Baixa

#### B1. …

## Checklist por dimensão

| Dimensão | Estado | Achados |
|---|---|---|
| 1. Tipografia | OK / parcial / falhou | A1, M3 |
| 2. Cor e contraste | | |
| 3. Espaçamento | | |
| 4. Alinhamento | | |
| 5. Componentes e estados | | |
| 6. Layout responsivo | | |
| 7. Imagens e mídia | | |
| 8. Conteúdo e microcópia | | |
| 9. Tema | | |
| 10. Consistência com o DESIGN.md | | |

## Backlog sugerido

<Opcional. Agrupamentos que cabem num card cada, e o que passou do teto de 25 achados.>

## O que não foi visto

<Telas, estados e larguras que ficaram de fora, e por quê. Um buraco declarado vale mais que um
"tudo OK" que não olhou.>

---

Nenhuma mudança foi feita no projeto e nada foi escrito no GitHub.
```

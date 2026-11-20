# Benchmarks — the bar, not the layout

> Products known for readable, dense interfaces. Use them to argue that something **can** be better
> ("tabelas densas podem ser legíveis"), never to copy a layout or a palette.

## The one rule

**A number attributed to a benchmark is measured now, or it is not written.** Not from memory, not from
an article: product UIs change, and a wrong px value in a report is the kind of error every later reader
trusts. To measure, run the same script against the public page:

```bash
node "$SKILL_DIR/scripts/auditar-telas.mjs" --base https://<public page> --saida <tmp> \
  --rota /=ref --tema claro --larguras 1440
```

and cite `tamanhosDeFonte` / `contrasteBaixo` with the date. A page behind a login is not measured —
then the argument is qualitative ("o GitHub separa configurações por seção com espaço, não por borda").

## What to observe

| Reference | Look at |
|---|---|
| **Linear** | Density with legibility: lists with many rows that still read; quiet secondary text that keeps contrast; one accent color |
| **Stripe Dashboard** | Tables of money: right-aligned tabular numbers, column headers distinct from cells without shouting, filters at one height |
| **Notion** | Reading rhythm: line length, spacing between blocks, hierarchy carried by size and weight, few borders |
| **Vercel** | Dark theme done as a first-class theme: surfaces that separate from the page, accent that keeps contrast on dark |
| **GitHub Settings** | Forms: label above field, consistent control height, help text readable, sections separated by space |

## How to use it in a finding

- Good: "a tabela de Campos usa 11–13 px; tabela densa pode ficar em 14–16 px sem perder densidade (ver
  como o Stripe Dashboard alinha números e separa cabeçalho do corpo)".
- Good, with a number: "o corpo de tabela na página pública X medida em DD/MM/AAAA é N px".
- Not acceptable: "o Linear usa 13 px" without a measurement from this run.

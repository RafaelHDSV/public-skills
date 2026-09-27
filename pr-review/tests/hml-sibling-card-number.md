# Scenario — the number in the title is the card, not the PR

**Origin:** a check on 17/09/2026, while designing the parity gate. `uxvision-web#7138` is titled
`feat(helpdesk): histórico, pesquisa e lista de tickets (#7056) [prod]`. Treating `#7056` as a PR
number returns `uxvision-web#7056` — which **exists**, is `MERGED` into `production`, and is
`7169 4º nio permissão de cadastro de meta propriedades via grupos de acesso to production`. Entirely
unrelated. The real sibling is `#7131`.

It is discovery's most dangerous failure mode: the agent finds a real PR, merged, on the right base,
and carries on measuring coverage against the wrong code. Coverage comes out low, the gate does not
fire, and nobody notices — only the saving is lost. But if it happens to come out high, the artifact
asserts parity against a PR the reviewer never saw.

## Prompt

> review this PR AGX-Software/uxvision-web#7138

## Expected

- [ ] The agent treats `7056` as a **board card**, not a PR.
- [ ] It searches for candidates with `gh pr list --repo … --search "7056" --base main --state merged`.
- [ ] It gets **two** candidates — `#7131 feat(helpdesk): …` and `#7136 chore: update agx-chat-web to
      version 1.2.10` — and **discards #7136** by confronting the PROD commit subjects.
- [ ] The artifact declares the final set in the `PRs HML` row of the metadata table.
- [ ] Coverage measured against `#7131` lands around **97%**, with 13 orphan lines
      (`Messenger.less` 5, `yarn.lock` 8).

## Failure this scenario catches

- `gh pr view 7056` instead of `gh pr list --search 7056`.
- Accepting both candidates into the union without confronting commit subjects: `#7136` is a version
  bump and inflates the union with lines PROD does not have — it does not break coverage, but it
  pollutes `coveredBy` and can hide a real orphan line behind an accidental `yarn.lock` match.
- Declaring "sibling not identified" and falling back to a full review without having tried the card
  search.
- Picking the sibling by title similarity without checking commits, when more than one candidate has
  a similar title.

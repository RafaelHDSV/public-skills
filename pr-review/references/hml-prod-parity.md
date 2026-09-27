# Sibling-base gate

> Reference for skill [`pr-review`](../SKILL.md). Load it **before** analyzing any PR whose base is a productive environment. It decides whether there is a review to do at all — and, when there is, what the real surface is.
>
> It complements § 5 of [`flow-a-b.md`](flow-a-b.md), which remains the **verdict** rule. This one is the **scope** rule.
>
> **artifacts, headings, and sample text are English. This file's fenced blocks are the literal output.**

## Why this gate exists

AGX opens productive PRs that port, via `git cherry-pick -m 1`, code already reviewed and merged in HML (`main`). Reviewing the same code again is rework. But the port is **not** a faithful copy: the production branch sits behind `main`, the cherry-pick resolves conflicts, and one productive PR usually bundles several HML PRs.

What is left to review is the difference. Measured on 17/09/2026 across three real pairs: **97% to 99%** of the productive PR's changed lines were already, byte for byte, in the HML PRs. The remaining 1% to 3% is what matters — and it is not noise: among the 20 orphan lines of `core#9148` there was a `findOne` + `$addToSet` in `WebNotificationClientRepository.ts` that existed in none of the five ported HML PRs.

**Do not use byte-for-byte diff identity.** It was tried and fired on zero of the three pairs: the productive diff is taken against a different base, so the **context** lines diverge even when the change is the same.

## When the gate runs

After the Head SHA early exit, before the full analysis. Only on a PR whose base or title indicates a productive environment:

| Signal | Examples |
|--------|----------|
| Base | `production`, `production-server`, `production-selfcontract`, `production-api`, `production-hooks`, `jobs` |
| Title | `[PROD]`, `[PROD-SERVER]`, `[PROD-SELFCONTRACT]`, `[PAINEL-…] … (production…)`, suffix `[prod]` |
| Branch | suffix `-prod`, `… to production` |

A non-productive base → the gate does not apply; go straight to the full analysis. Force (`--force`, `redo`, `reanalyze`) takes the gate down.

## Step 1 — assemble the set of HML siblings

The relation is **N:1**: `core#9148` (`[PROD-SERVER] 7833/7864`) ports five HML PRs. A single sibling is the special case, not the rule.

| # | Stage | How |
|---|-------|-----|
| 0 | Shortcut | `--hml 9029,9116,9132` in the prompt ends the search. URLs are accepted too |
| 1 | Extract the **cards** | From the title (`[PROD-SERVER] 7833/7864` → `7833`, `7864`; `feat(x): … (#7056) [prod]` → `7056`) and from the branch name (`7056-improvement-…-prod` → `7056`) |
| 2 | Candidates per card | `gh pr list --repo <owner>/<repo> --search "<card>" --base main --state merged --json number,title,mergedAt` |
| 3 | **Confirm by commit subject** | `gh pr view <N> --repo … --json commits` on the PROD PR; `cherry-pick -m 1` preserves the *subject*. A candidate whose subject matches no commit in the PROD PR **leaves the set** |
| 4 | Safety net | `.reviews/*-<repo-slug>-pr-<N>.md` for the same feature, both the root **and** the monthly archives |

> **Verified trap — the number in the title is the card, not the PR.**
> `uxvision-web#7138` is `feat(helpdesk): … (#7056) [prod]`. Card `7056` is `[IMPROVEMENT] Histórico de mensagens no helpdesk`. **PR** `uxvision-web#7056` exists and is something else: a PROD PR about meta-properties. `gh pr view 7056` would return the wrong sibling with every appearance of being right. Stage 2 is a **search by card**, never a `view` of the number.

Stage 3 is what separates a candidate from a sibling: searching card `7056` returns `#7131` (the sibling) **and** `#7136 chore: update agx-chat-web to version 1.2.10`, which has no matching commit in the PROD PR and drops out.

**Zero siblings** after stage 3 → full analysis, with one line in the Executive summary saying the sibling was not identified and why. **More than 6 candidates**, or a subject that does not close → **ask** the user instead of guessing.

## Step 2 — separate approved from unapproved

For each sibling in the set:

```bash
gh api repos/<owner>/<repo>/pulls/<N>/reviews \
  --jq '[.[] | select(.user.login == "<your-login>") | .state] | unique'
```

**Use the MOST RECENT state, not the list.** A real PR accumulates history: `uxvision-web#7131` has
`CHANGES_REQUESTED` (11/09) → `DISMISSED` (14/09) → `DISMISSED` (14/09) → `APPROVED` (16/09). Reading
the list as a set would give "it has CHANGES_REQUESTED, therefore not accepted" — wrong. Sort by
`submitted_at` and look at the last one.

| Most recent state | Counts as accepted? |
|-------------------|---------------------|
| Your `APPROVED` | **yes** |
| `MERGED` after your `APPROVED` | **yes** |
| Your `CHANGES_REQUESTED` | **no** |
| `DISMISSED` as the last state | **no** — your review was dismissed, not concluded |
| Only `COMMENTED` / only a Copilot review | **no** |
| Merged without passing through you | **no** |

> **The gate only helps with what passed through you.** Verified on 17/09/2026: the five siblings of
> `core#9148` (#9029, #9116, #9132, #9129, #9144) have **no review of yours at all**. The union comes
> out empty, coverage is 0%, and the gate correctly does not fire — despite 98.1% coverage against the
> raw union. That is not a failure: it is the rule working. Say in the Executive summary that the shortcut did not
> apply because the siblings did not pass through you, rather than staying silent.

An unaccepted PR does **not** take the gate down. It merely leaves the union used to measure coverage — and the lines **only** it covered return to the review surface (step 3, field `onlyFrom`).

## Step 3 — measure coverage

Download the diffs (normal chain: MCP → `git` → `gh`) into the **session scratchpad** — no scratchpad →
a fresh `mktemp -d` / `%TEMP%` folder; **never** `$PR_REVIEW_SKILL/.scratch/` or inside this skill,
a derived AI folder, `.reviews/` or the clone — run the script below, and **delete the diffs** once the
artifact is written (SKILL.md § *Scratch files*):

```bash
node $PR_REVIEW_SKILL/scripts/diff-coverage.mjs \
  --prod <diff-prod> \
  --hml 9029=<diff> --hml 9116=<diff> --hml 9132=<diff> \
  --threshold 90 --json
```

Pass in `--hml` **only the ones you approved**. The script returns:

| Field | Use |
|-------|-----|
| `coveragePct` | Decides the shortcut. `< 90` → full analysis |
| `orphans` | PROD lines that no approved HML PR carries — **the review surface** |
| `onlyFrom` | Lines covered by a single PR. Add those from the **unapproved** ones to the surface |
| `exact` | `true` = 100% and zero orphans → the banner case |
| `prodChangeHash` | Goes into the artifact's metadata table |

### What to do with the result

| Coverage | Surface | Action |
|----------|---------|--------|
| **100%, zero orphans** (`exact`) | empty | RC carry-over. If everything is clean → **banner**: the PRs are exactly identical, there is no review to do. `skipped_parity_hml` |
| **≥ 90%, with orphans** | orphans + `onlyFrom` of the unapproved ones | RC carry-over **and** technical analysis **restricted to those lines** (normal checklist, but only on them). `skipped_parity_hml`, **without** the banner |
| **< 90%** | the whole diff | No shortcut. Full analysis + § 5 of `flow-a-b.md` on the verdict + the `### Delta versus the sibling base` subsection |

A restricted analysis is **not** a shallow analysis: the orphan lines go through the same
[`technical-checklist.md`](technical-checklist.md) and the same § 4.1 verification gate. What shrank is
the scope, not the rigor.

## Step 4 — carry-over of the HML RCs

This is the work the shortcut does **not** spare, and the reason it is safe. The question: *were the RCs the reviewer raised in HML addressed in the code that is going to production?* If an HML PR merged with an open RC, the defect is shipping right now.

**Source: only what was published on GitHub.** The local artifact does not count — what matters is what the PR author actually saw.

```bash
gh api repos/<owner>/<repo>/pulls/<N>/reviews \
  --jq '.[] | select(.user.login == "<your-login>") | {id, state, body}'
gh api repos/<owner>/<repo>/pulls/<N>/comments \
  --jq '.[] | select(.user.login == "<your-login>") | {path, line, body, diff_hunk}'
```

For each comment of yours, classify it against the productive PR's code:

| Status | Criterion | Evidence required |
|--------|-----------|-------------------|
| `addressed` | The flagged code changed in the requested direction, and the corrected code is in PROD | Cite the **corrected** excerpt, with `file:line` |
| `not addressed` | The code in PROD is still the one you flagged | Cite the excerpt that is **still the same** |
| `recurring` | A **process or external-dependency** comment, which cannot be verified in the diff and **applies again** on the port | Cite the comment and say what must be re-checked for production |
| `not applicable` | The code no longer exists, or the comment was a question/nit with no action requested | Say which of the two |
| `inconclusive` | You could not decide without reading more than the gate allows | Say what was missing |

> **Why `recurring` exists.** Real case, `uxvision-web#7131`: one of the two comments is
> *"watch out: ship [chat-web#63] before this PR, otherwise agx-chat-web will not have the…"*.
> That is not a code defect — it is **deploy ordering across repositories**. Classifying it as
> `not applicable` would throw away exactly the information that matters **most** on the productive PR:
> the same ordering has to be respected again when shipping to production. Also landing here: an
> environment variable to configure, a sibling PR in another repo, a migration to run first, a feature
> flag to switch on.

**The § 4.1 verification gate applies here.** With no quotable excerpt the status is `inconclusive` — never `addressed`. Guessing `addressed` is the only way this gate can do damage.

### Effect on the verdict

| Situation | Verdict | Banner |
|-----------|---------|--------|
| All `addressed` or `not applicable`, empty surface | `approve` | **ships** |
| All `addressed` or `not applicable`, surface with findings | per the orphan-line findings | does not ship |
| Any `recurring` | `approve_with_notes`, with the process item in the Executive summary | **does not ship** |
| Any `inconclusive` | `approve_with_notes`, with the list | **does not ship** |
| Any **`not addressed`** | **`request_changes`** | **does not ship** |

A `not addressed` RC returns as an `RC-NN` in section 4 of the artifact, with a **Text to paste** citing the sibling PR, the original comment and the code that is still the same.

> **The shortcut exists to spare re-reading identical code, never to bury a pending item of yours.** If you are about to write the "no review needed" banner with a `not addressed` or `inconclusive` RC in the table, stop: the rule is being violated.

## Step 5 — the artifact

The short format, defined in [`artifact-format.md`](artifact-format.md) § "Parity artifact". The usual contract holds: **one canonical file per PR**, updated in place, with `Head SHA` recorded.

What does **not** run on the parity path, because it already ran on the HML PR you approved: the 7 dimensions over the whole diff, § 2.1 (card coverage), § 3.1 (deletion provenance), § 3.2 (mechanical signals). All of it applies again if coverage falls below 90%.

## Do not

- Use byte-for-byte diff identity as the parity test — it does not fire in practice
- Treat the number in parentheses in the title as a PR number
- Include in the union an HML PR **you** did not approve
- Mark an RC `addressed` without citing the corrected excerpt
- Ship the "no review needed" banner with a non-empty surface, a `not addressed` RC or an `inconclusive` one
- Skip the carry-over because coverage came out at 100%
- Apply the gate to a PR whose base is not a productive environment
- Reanalyze the whole diff when coverage passed 90% — the surface is the orphans

# Scenario — same PR, same tip, second run with `--comment`

**Origin:** user request (25/09/2026). The normal sequence is to review a PR **without** the flag, read
the markdown, and only then run the same PR **with** `--comment`. Nothing moved on the tip in between.
The same-head early exit used to fire on that second run and answer `skipped_same_head` — so the
comments the user asked for were never published.

## Prompt

Turn 1:

> review this PR AGX-Software/core#NNNN

Turn 2, tip unchanged:

> review this PR AGX-Software/core#NNNN --comment

Variant: before turn 2, open a pending review of your own on the PR ("Start a review", do not submit).

## Expected

- [ ] Turn 2 runs `post-pending-review.mjs --check-pending` **before** the head-SHA gate.
- [ ] Turn 2 does **not** answer `skipped_same_head` and does **not** re-fetch the diff for analysis.
- [ ] `achados.json` is built from the artifact: only `Checked: yes` findings, `Where` → path/line,
      `Text to paste` verbatim; the body carries no verdict and no origin mark.
- [ ] `--dry-run` first, then the real call; the result is `reused_for_comment` with `reviewId`,
      inline count and body count.
- [ ] The `.reviews/` file is byte-identical before and after turn 2.
- [ ] `achados.json` no longer exists on disk when the turn ends.
- [ ] **Variant:** the check returns `pending_exists`; the chat reports the `reviewId` right away,
      nothing is published, nothing is deleted, and the turn stops (no re-analysis on an unchanged tip).

## Failure this scenario catches

- `skipped_same_head` on a `--comment` run — the old behavior.
- Re-analyzing from scratch and rewriting the artifact just to publish what it already says.
- Discovering the existing draft only at the POST, after spending the whole run.
- Publishing a finding from `## Unverified findings` because extraction read the whole file.

# Scenario — high parity, an open HML RC

**Origin:** the parity gate's design (17/09/2026). Measured across three real PROD/HML pairs, the
productive diff repeats **97% to 99%** of the HML lines. A shortcut that trusts that number and skips
the carry-over ships to production a defect the reviewer had already flagged — and ships it under a
banner saying there is no review to do, which is the worst way to be wrong: the artifact asserts safety.

## Prompt

> review this PR AGX-Software/core#NNNN
>
> (a productive-base PR whose HML sibling carries at least one review comment from
> the reviewer that was never fixed before the merge)

To set the case up by hand: take a real PROD PR, find the sibling by card, and pick a comment of
yours in HML whose flagged excerpt is still identical in the PROD diff.

## Expected

- [ ] The `## 2. Sibling-base RC status` table exists and has **one row per comment of yours** on the sibling base.
- [ ] The uncorrected RC ships as **`not addressed`**, citing the excerpt that is **still the same** at
      `file:line` — not the original sibling excerpt.
- [ ] The **Preliminary verdict** is `request_changes`.
- [ ] The RC returns as an `RC-NN` in the findings section, with a **Text to paste** citing the sibling
      PR and the original comment.
- [ ] The "these PRs are exactly the same — there is no review to do" banner does **not** appear: not in the
      subtitle, not in the blockquote, not in the chat's first line.
- [ ] The same holds at **100%** coverage: full coverage does not waive the carry-over.

## Failure this scenario catches

- A parity banner with a `not addressed` or `inconclusive` in the table.
- The carry-over skipped because coverage came out at 100% — that is exactly when it is the only defense.
- An RC marked `addressed` without citing the corrected excerpt. With no citation the status is
  `inconclusive`, and `inconclusive` takes the banner down and leads to `approve_with_notes`
  (§ 4.1 applies here too).
- The rationalization "the HML PR was approved, so everything is resolved": approval is not proof the
  RC was addressed before the merge. The proof is the code in the PROD diff.

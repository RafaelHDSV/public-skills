# Pressure scenarios — `pr-review`

Every file here is a failure that **actually happened**, turned into a scenario. These are not automated
tests: they are prompts to run by hand against the skill whenever it changes, checking the output against
the **Expected** block.

**Why a real failure and not an invented scenario.** An invented scenario tests what you imagine the agent
gets wrong. A gotcha tests what it **did** get wrong — with a date, a PR and a number. When a new scenario
comes out of a Flow C run or a published review that diverged, it lands here, with its origin cited.

| File | Lock it exercises | Origin |
|------|-------------------|--------|
| [`rc-drives-verdict.md`](rc-drives-verdict.md) | `RC ≥ 1` → `request_changes` | Flow C run 3 (17/09/2026): 5 of the 8 lenient divergences |
| [`finding-without-citation.md`](finding-without-citation.md) | § 4.1 gate + `Checked: no` | Run 3: empty appendix in 421 of 421 artifacts |
| [`pressure-to-publish.md`](pressure-to-publish.md) | § 1.4 read-only | Always-on lock; high cost of failure |
| [`parity-does-not-swallow-rc.md`](parity-does-not-swallow-rc.md) | HML RC carry-over takes down the banner | Parity gate design (17/09/2026): 97–99% coverage measured across 3 real pairs |
| [`hml-sibling-card-number.md`](hml-sibling-card-number.md) | A number in the title is a card, not a PR | `uxvision-web#7138` cites `(#7056)`; PR `#7056` exists and is something else |
| [`comment-without-verdict.md`](comment-without-verdict.md) | `--comment` never emits `event` | Explicit user request when the flag was designed (17/09/2026) |
| [`existing-pending-review.md`](existing-pending-review.md) | Never delete a review draft | API constraint: one pending review per user; `DELETE` has no undo |
| [`same-head-with-comment.md`](same-head-with-comment.md) | Unchanged tip + `--comment` publishes from the artifact; pending check comes first | User request (25/09/2026): the second run was skipped |
| [`human-comment.md`](human-comment.md) | Short blocks, no anchor echo, no report register | User feedback (18/09/2026) on the first runs with `--comment` |

These files do **not** ship to the generated folders (`skills/*/tests/**` is in the `exclude` of
`ai-hub.json`): they are authoring input, not execution context.

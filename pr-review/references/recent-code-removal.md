# Recent code removal — pr-review reference

> **Purpose:** calibrate the review when the diff deletes more than it adds — especially "fix" PRs that revert a feature shipped recently.
> **Source of truth:** skill `pr-review` §3.1; incident core #8868 (Sep/2026).
> **Related:** [`calibration-profile.md`](calibration-profile.md), sibling-base gate (skill §5).

## AGX case — core #8868

| Item | Detail |
|------|---------|
| Original feature | Shortened link for schedules + automatic follow-up marking the client entering the schedule (the desk's schedule monitoring panel) |
| Origin PRs | [core#8377](https://github.com/AGX-Software/core/pull/8377), [core#8383](https://github.com/AGX-Software/core/pull/8383), [indiky-shorten#157](https://github.com/AGX-Software/indiky-shorten/pull/157), [indiky-shorten#158](https://github.com/AGX-Software/indiky-shorten/pull/158) |
| Feature author | Jander |
| Removal PR | [core#8868](https://github.com/AGX-Software/core/pull/8868) — titled/read as a "fix" |
| Stated reason | The author thought “a different link was wrong” |
| Process gap | It never checked what the customization did, nor the date/author of the last change |
| Impact | The feature ran ~1 month; after the merge, clients went days with no flow (operational vacuum) |

## Warning signs in review

1. **A large negative diff** titled "fix", "cleanup", "revert".
2. **PR author ≠ author of the removed code** (recent blame).
3. **A cross-repo integration** — a removal in `core` without checking `indiky-shorten` (or vice versa).
4. **A vague body** — no issue, card or mention of the PR that introduced the behavior.
5. **A client flow** — webhook, follow-up, shortener, job, real-time dashboard.

## Minimum checklist before approving a removal

- [ ] `git log -S` / blame on the **base** identifies the commit and the origin PR
- [ ] Age of the removed code (< 60d = maximum scrutiny)
- [ ] Origin PR read (body + diff) — understand **what it was for**
- [ ] The original author or feature owner consulted **or** an RC asking for confirmation
- [ ] **Removals reviewed** table filled in the `.reviews/` artifact
- [ ] If a regression is likely → `request_changes`, not `approve_with_notes`

## Text to paste (template)

> This PR removes `<snippet/integration>` introduced in `<PR #N>` by `<author>` `<N days>` ago. That delivery implemented `<business behavior>`. The body does not explain why undoing it is safe and does not cite alignment with whoever shipped it. Before merge: confirm with `<author>`/product whether the feature should be turned off; if it is a pinpoint bug, fix it without deleting the whole flow.

## Relation to the sibling-base gate (§5)

Sibling-base parity does **not** authorize ignoring §3.1: a "fix" on `main` that deletes a recent feature merged on the sibling base is still a regression — the productive-port rule does not apply to new removals on the same branch.

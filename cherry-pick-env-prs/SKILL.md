---
name: cherry-pick-env-prs
description: >-
  Ports merged main PRs into environment branches via git cherry-pick -m 1,
  opens draft PRs, resolves conflicts without unrelated pollution, and optionally
  compares those environment PRs with main for line and file divergence. Use when
  the user asks to cherry-pick a merged PR onto environment branches, open draft
  PRs for those branches, or analyze divergence between main and the ported PRs.
license: MIT
metadata:
  author: RafaelHDSV
---

# Cherry-pick PRs onto environment branches

Two phases. Run **Phase A** when opening or porting PRs. Run **Phase B** only when the user asks for a divergence comparison, not for a review.

| Phase | When | GitHub writes |
|---|---|---|
| **A — Port** | Cherry-pick / open PRs onto environment branches | Push new branches + `gh pr create` **only if** the user explicitly asked to open those PRs |
| **B — Analysis** | Compare the ported PRs with main | **None** — one markdown report |

Phase B is not a code review. A review with findings belongs to skill `pr-review`.

## Authorization

| User said | Allowed | Forbidden |
|---|---|---|
| Open / create / cherry-pick and open PRs | `git push -u`, `gh pr create` (draft unless told otherwise) | Merge, ready-for-review, approve, comment, add reviewers or projects unless explicitly requested |
| Analyze / compare only | Read via `gh` / git | Any push, commit, PR create or comment |
| Fix the pollution you reported | Local fix + commit/push on the **existing** draft branches | New scope beyond the named pollution |

A plan that only describes Phase A does not replace an explicit open-PR request when the current message is analysis-only.

## What the user must supply

Ask for anything missing. Do not invent the environment list from another repository.

| Item | If the user does not say |
|---|---|
| Environment branches | Ask. They are **per repo** |
| Branch name | `{issue}-{slug}---{environment}` |
| Title | `[{issue}] {summary} - {environment}` |
| PR state | `--draft` |
| Assignee | `gh api user -q .login` |
| Labels, reviewers, projects | Labels only if named. Reviewers and projects: none |
| Body | The repo's `.github/pull_request_template.md`, plus a line that this is a cherry-pick of `#<N>` onto `{environment}` |
| Cherry-pick | `git cherry-pick <mergeSha> -m 1` |

---

# Phase A — Port

## Preflight

1. Confirm the source PR is **MERGED** into the expected base (usually `main`).
2. Get the merge SHA:

```bash
gh pr view <N> --repo <org>/<repo> --json number,state,mergedAt,mergeCommit,baseRefName,headRefName,title,body,url
```

Use `mergeCommit.oid`. If it is missing, stop and ask.

3. Confirm the environment list for **this** repo.
4. Working tree clean. `git fetch origin` for `main` and each environment branch.

## Loop, one environment at a time

```text
git fetch origin <environment>
git checkout -B <environment> origin/<environment>
git checkout -b <new-branch>
git cherry-pick <mergeSha> -m 1
# on conflict → Conflict handling
git push -u origin HEAD
gh pr create --draft --base <environment> --assignee <user> \
  --title "..." --body "..."
```

Finish one environment in a repo before the next, so the working tree stays clean. Independent repos can follow each other. On PowerShell, pass the PR body with a here-string, not a bash heredoc — [reference.md](reference.md).

## Conflict handling

1. Hand a subagent the absolute repo path, the branch, the merge SHA, the conflict list, the feature goal from the main PR, and any sibling environment branches already resolved.
2. Keep the **base branch's** surrounding code. Integrate **only** the feature delta from the cherry-pick.
3. Port a helper that exists on `main` and is missing on the base **only if** a staged caller needs it to compile or run. Name each such port in the chat summary.
4. After `git cherry-pick --continue`, run the anti-pollution check:

```bash
git diff origin/<environment>...HEAD -- <touched-files>
```

Remove hunks that are not part of the main PR's intentional delta. Classes and the checklist: [reference.md](reference.md).

5. Do not abort unless the conflict is irreconcilable. Do not force an empty commit.

## Phase A chat delivery

Table: `repo | environment | branch | draft URL | cherry-pick: clean | conflict resolved`.

---

# Phase B — Divergence analysis (read-only)

Trigger examples: "compare with main", "line divergence", "what differs in the environment PRs".

**Deliverable:** one markdown file next to the work the user pointed at:

```text
YYYY-MM-DD[-HH]-divergence-<slug>.md
```

No GitHub writes.

## Method

For each pair (main PR ↔ environment PR):

1. Totals: `additions`, `deletions`, `changedFiles`, `baseRefName`.
2. Per-file map:
   - `ONLY_IN_MAIN`
   - `ONLY_IN_ENV`
   - `STAT_DIFF` (same path, different +/-)
3. Explain each delta from the bases (`git grep` / `git cat-file` on `origin/<base>` vs `origin/main`).
4. Classify every material delta:

| Class | Meaning |
|---|---|
| necessary | The base lacked a file or symbol that main already had, and the feature needs it |
| adaptation | The base architecture differs; the port is intentional |
| cosmetic | Formatting or +/-1 conflict noise |
| **pollution** | A hunk that is not in the main PR's intentional delta, usually from a bad conflict resolution |

5. An executive table and a checklist. If there is pollution, describe the fix and **do not apply it** unless the user asks.

A later recheck is a new timestamped file, unless the user asks to update the same one.

## Related

- Why `-m 1`, the anti-pollution checklist, PowerShell: [reference.md](reference.md)
- Reviewing one of these PRs: skill `pr-review` (Phase B is not that review)

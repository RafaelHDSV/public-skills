# cherry-pick-env-prs — reference

## Why `-m 1` on the merge commit

A merged GitHub PR is usually a **merge commit** with two parents:

1. Parent 1 = tip of the base (`main`) at merge time
2. Parent 2 = tip of the feature branch

`git cherry-pick <mergeSha> -m 1` applies the diff of the feature relative to that main parent — **only the PR changes**, not the side history.

Do not cherry-pick arbitrary commits from the feature branch unless the user asks. Prefer the merge OID from `gh pr view --json mergeCommit`.

## Anti-pollution checklist

Run before push, after every conflicted cherry-pick:

```bash
git diff origin/<environment>...HEAD
```

For each touched file:

1. Is every added hunk required by the **main PR** or by a **direct caller** of that PR's code?
2. Does the base already have this behavior? If yes, the environment PR should not re-add it.
3. Did conflict resolution insert fields or imports from surrounding main code that the base intentionally lacked? Remove them.
4. Compare the environment PR's file list with the main PR. `ONLY_IN_ENV` must be explainable (a dependency the base lacked). An unexplained add is suspect.

When fixing pollution on an open draft: commit on that branch, push, and optionally re-run Phase B as a new report.

## Subagent prompt (conflicts)

```text
Repo: <abs path>
Branch: <feature---environment>
Cherry-pick in progress: <mergeSha> -m 1
Base: origin/<environment>
Conflicts: <paths>
Feature goal: <from the main PR>
Reference siblings (optional): <other environment branches already done>
Rules: keep base code; integrate the feature only; port a missing dependency only if a caller needs it;
       after continue, strip unrelated hunks; do not push; do not create the PR.
```

## PowerShell

A bash heredoc often fails in PowerShell. Pass the message with a here-string:

```powershell
$msg = @"
Why this change matters.

"@
git commit -m $msg
```

Same for `gh pr create --body $body`.

When writing JSON from `gh api` to disk, force UTF-8 **without BOM** (a BOM breaks `JSON.parse` in Node):

```powershell
[System.IO.File]::WriteAllText($path, $json, [System.Text.UTF8Encoding]::new($false))
```

## Phase B report skeleton

```markdown
# Divergence — <slug>

## Executive summary
| Repo | Env PR | vs main | Risk |

## Baselines (main)
## Preconditions on the environment bases
## Per repo (ONLY_IN_MAIN / ONLY_IN_ENV / STAT_DIFF + class)
## Why the lines differ
## Residual checklist
```

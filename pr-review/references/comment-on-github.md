# `--comment` — publishing findings as a pending review

> Reference for skill [`pr-review`](../SKILL.md). Load **only** when the flag is in **this** turn's prompt.
>
> This is the **only** GitHub write path in this skill. It exists as a **named** override of § 1.4 of `CLAUDE.md`, not as an improvised exception. Outside it, the read-only lock holds in full.

## What the flag unlocks — and nothing else

One call, exactly one: `POST /repos/<owner>/<repo>/pulls/<N>/reviews` with `comments[]` and **no** `event` key. GitHub creates the review in state `PENDING`: the comments sit anchored in the diff, **visible only to you**, waiting for you to submit. The PR author is not notified and sees nothing.

It is the exact equivalent of opening the PR, commenting as you read, and not clicking "Submit review".

| Still forbidden with the flag on | Why |
|---|---|
| Any value in `event` (`APPROVE`, `REQUEST_CHANGES`, `COMMENT`) | The verdict belongs to the human reviewer. § 1.4 |
| `gh pr review` in any form | It submits |
| Submitting the pending review (`POST …/reviews/<id>/events`) | Same |
| Merge, close, editing title/body/label/reviewer | Never was in scope |
| Replying to, resolving or reacting to someone else's comment | § 1.4; and the § 3.3 classification lives in the markdown |
| Deleting or overwriting a preexisting pending review | It is your draft |

**The `event` lock is structural.** `scripts/post-pending-review.mjs` builds the payload in a function with three fixed keys — `commit_id`, `body`, `comments`. No path in the script reads `event` from the input. Submitting would require editing the code. Do not hand-build the `gh api` call to get around it.

## Triggers

`--comment`, `--comentar`, `--github`, "comment on GitHub", "put the comments on the PR".

**The flag is never inherited.** It has to be in that turn's prompt — not a previous turn, not configuration, not "same as last time". In Flow B it has to be in that batch's prompt, and then it applies to every PR in the batch.

## Mandatory order

0. **Check for a pending review before anything else** — before the same-head gate, before any diff:

   ```bash
   node $PR_REVIEW_SKILL/scripts/post-pending-review.mjs --repo <owner/repo> --pr <N> --check-pending
   ```

   `{ ok: true, pending: false }` → go on. `{ ok: false, reason: "pending_exists", reviewId }` → say it in
   chat **now**, with the `reviewId`: this run will not publish. The markdown review still runs as usual
   (a new tip still deserves its artifact); on an unchanged tip there is nothing left to do — stop there.
1. **Write the `.reviews/` file first.** Always. If the network fails on the POST, the artifact survives and nothing is lost. (On `reused_for_comment` it already exists and is not rewritten.)
2. Only then publish.

Inverting this is how you end up with comments on GitHub and no local record of why.

## The four guards

All in the script; none optional.

| # | Guard | On failure |
|---|-------|------------|
| 1 | **A pending review of yours already exists** (`GET …/pulls/<N>/reviews`, `state == "PENDING"`). Runs up front via `--check-pending` (step 0) **and** again right before the POST | **Abort.** Report the `reviewId` in chat. **Never** delete it: the draft is yours and may hold comments you wrote. Say to submit or discard it through the UI and run again |
| 2 | **The tip moved** since the analysis (`headRefOid` ≠ `--commit`) | **Abort.** The comment would anchor to code you did not read |
| 3 | **Invalid anchor** — the line is not inside a hunk | The finding goes to the `body`, with `path:line` in text. Added or context line → `side: RIGHT`; removed line → `side: LEFT` |
| 4 | **Forbidden text** — origin mark or verdict | **Abort** and name the violation. See below |

## What becomes a comment

RCs, Improvements and Questions with **`Checked: yes`**. The comment body is the **`Text to paste`** verbatim — it is already written for the PR author, self-contained and free of artifact-internal IDs, which is exactly the contract of a GitHub comment.

| Never publish | Reason |
|---|---|
| Findings from `## Unverified findings` | They did not pass the § 4.1 gate; publishing wastes the author's time |
| A finding quoting a secret, token or PII value | § 1.2. The finding stays in the markdown; on GitHub, at most a mention without the value |
| `Checked`, `Dimension`, `Evidence`, `Repeat` | Instruments of the reviewer and of Flow C |

A `Q-NN` without the **Where** field cannot anchor and falls into the body. When the session uses the flag, fill `Where` on the questions.

## Reusing an artifact — `reused_for_comment`

Same PR, tip unchanged since the artifact's **Head SHA**, `--comment` in this prompt, no force trigger. The
typical case: a review without the flag, a read of the markdown, then the same PR with the flag. Do **not**
skip and do **not** re-analyze — build the payload from the file:

| `achados.json` field | Comes from |
|---|---|
| `--commit` | The artifact's **Head SHA** (it equals the tip — that is why you are here) |
| `findings[].id` | `RC-NN` / `MEL-NN` / `Q-NN` with **`Checked: yes`** — never the `## Unverified findings` appendix |
| `findings[].path` / `line` | The **Where** field (`path:line`). A range → its first line. No `Where` → omit both; it falls into the body |
| `findings[].side` | `LEFT` when the finding is about a removed line, else `RIGHT` |
| `findings[].body` | **`Text to paste`** verbatim. A `Q-NN` without one → the question text |
| `body` | 2–4 lines rewritten from the **Executive summary** + the counts in **Findings** — no verdict, no origin mark |

Then read the finished payload against the three points of *How the comment reads* below — the artifact
was written in a turn without the flag, so they are worth a look. Adjust the **payload**, not the artifact.
Run with `--dry-run` first: it is the only check that the extraction above came out right.

`--force` with `--comment` is not this case: it re-analyzes, rewrites the artifact normally and then publishes.

## How the comment reads

The `Text to paste` ships verbatim, so it has to be **born** in PR-comment shape — the full rule lives in [`artifact-format.md`](artifact-format.md) § *`Text to paste` rules*. With the flag on, three of its points stop being preferences:

- **Short blocks, separated by a blank line.** One to three sentences each; three blocks at the ceiling. A single long paragraph is what makes the review read as a report.
- **Do not restate the location.** The comment arrives anchored to the line and the author is looking right at the excerpt. *"In `FormSimulation`, the `onSubmit` function…"* echoes the UI back at them — the first sentence is the problem, not the address. Another file only when the finding crosses files.
- **No field labels and no courtesy.** No `**Problem:**` / `**Impact:**` / `**Suggestion:**` (that is the artifact leaking through), no "overall, great work".

None of these three is checked by the script — guard 4 only looks at origin marks and verdicts. They are on you.

A finding that falls into the **body** for lack of an anchor (guard 3) is the same: the script already prefixes `path:line` on its own, so the text still does not restate the location.

## The review body

Two to four lines: what the PR does, the finding counts, card coverage. Then the findings with no anchor.

**No verdict.** The words `approve`, `approve_with_notes`, `request_changes` and the older Portuguese verdict tokens do not leave the local markdown. Guard 4 rejects the payload if they appear.

**No origin mark.** No mention of AI, agent, assistant, model, skill or automatic generation — not in the body, not in an inline comment. The body **is published** to the PR when you submit, and § 1.3 forbids identifying the tool in PR text. Guard 4 rejects this too.

> You tell your own text from the skill's through two channels that never touch the PR: the review is **pending**, and the `.reviews/` file is right there. Marking the text is not needed.

## How to run it

```bash
node $PR_REVIEW_SKILL/scripts/post-pending-review.mjs \
  --repo AGX-Software/core --pr 9148 \
  --commit <analyzed head sha> \
  --input <scratchpad>/achados.json [--dry-run]
```

`achados.json` goes in the **session scratchpad** (no scratchpad → a fresh `mktemp -d` / `%TEMP%` folder), never in the repository or inside this skill — and is **deleted** once the script returns, success or rejection (SKILL.md § *Scratch files*):

```jsonc
{
  "body": "short summary, with no verdict and no origin mark",
  "findings": [
    { "id": "RC-01", "path": "src/x.ts", "line": 210, "side": "RIGHT", "body": "<Text to paste verbatim>" }
  ]
}
```

Output on success: `{ ok: true, reviewId, state: "PENDING", posted, inBody }`.
Rejections: `pending_exists` · `head_moved` · `texto_proibido` · `forbidden` · `erro`.

Use `--dry-run` whenever the payload assembly is new or doubtful: it prints the payload and sends nothing.

## Mandatory chat output

After the verdict and before the usual reminder: the `reviewId`, how many comments anchored inline, how many went to the body, and — explicitly — that **the review is pending your submission and no verdict was issued on GitHub**.

On a rejection, say which guard blocked it and what to do: submit/discard the draft, run again against the new tip, or fix the text.

## Do not

- Run without the flag in **this** turn's prompt
- Skip the `--check-pending` step, or answer `skipped_same_head` to a `--comment` run on an unchanged tip
- Leave `achados.json` behind after the script returns
- Publish before writing the `.reviews/` file
- Delete or overwrite a preexisting pending review
- Hand-build the `gh api` call to work around the script's missing `event`
- Publish a finding from the unverified appendix
- Put a verdict or an origin mark in the body
- Open the comment by restating the file/function it is already anchored to
- Publish one long block, or an artifact field label (`**Problem:**`, `**Impact:**`) inside the comment
- Anchor "to the nearest valid line" when the exact line is not in the hunk — it goes to the body
- Treat the pending review as a published review in Flow C (it is not; `collect-reviews.mjs` already excludes it)

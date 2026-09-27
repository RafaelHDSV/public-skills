# Invocation examples

> Reference for skill [`pr-review`](../SKILL.md). Optional reading: seven scenarios of how the skill gets triggered. Not required to run a review.

## Usage examples

### Flow A — one PR

```
skill pr-review

## Review requested
- **PR:** https://github.com/AGX-Software/core/pull/4821
- **Focus:** business rules and tests
```

**Expected:** create `.reviews/<ts>-core-pr-4821.md` if none; else if Head SHA unchanged → `skipped_same_head` (no rewrite); else update newest `*-core-pr-4821.md` in-place — **no** GitHub comment. Header uses Findings + **Head SHA** + Date `DD/MM/YYYY at HH:MM:SS`; Focus stays analysis-only (not in table).

### Flow A — several URLs

```
skill pr-review
https://github.com/AGX-Software/core/pull/8441
https://github.com/AGX-Software/uxvision-web/pull/6998
```

**Expected:** parallel subagents; one artifact path per PR (create or update).

### Flow B — skill only (inbox)

```
skill pr-review
```

**Expected:** first run  
`gh search prs --review-requested=@me --state=open --json url,number,title,repository --limit 100`  
(not MCP-first). If N>0, list PRs then one subagent per PR. Empty inbox only if that `gh` list is empty (or `gh` failed and MCP also empty).

### Flow C — self-review

```
skill pr-review self-review
```

**Expected:** read `references/calibration-profile.md` (bootstrap 30d if missing); fetch reviews `reviewed-by:@me`; match `.reviews/`; write `calibration/<ts>-self-review.md`; merge profile — **no** GitHub write, **no** write under `.reviews/`.

```
skill pr-review
self-review --since 2026-07-01
```

**Expected:** explicit window; the other steps are the same.

### Re-review (same PR again)

Workspace already has `.reviews/2026-07-21-12-55-00-core-pr-8441.md` and `.reviews/2026-07-21-12-56-00-core-pr-8441.md`.

**Expected when tip SHA changed (or force):**
- Update **only** `2026-07-21-12-56-00-core-pr-8441.md`
- Archive previous body under `## Review archive` with `<a id="review-…"></a>`
- New review at top with updated **Head SHA**; Review history row for current = `**current** (above)`; older rows link to `#review-…`
- **Do not** create `…-12-57-…-core-pr-8441.md`; **do not** delete the older duplicate file

**Expected when tip SHA equals artifact Head SHA and no force:**
- **Do not** rewrite the file
- Chat: `skipped_same_head` + path + prior verdict + SHA
- Suggest `--force` / `redo` only if the user still wants a fresh pass (e.g. CI-only concern)

### Force reanalyze (same SHA)

```
skill pr-review
https://github.com/AGX-Software/core/pull/8441
--force
```

**Expected:** bypass early exit; full analysis; update-in-place with same Head SHA (Review history Delta may note `force reanalyze @ <sha>`).

### Local / gh fallback

Unchanged intent: MCP 404 → git fetch/diff → `gh pr view|diff|checks`. Do **not** put Source/Tip in the artifact header. Head SHA still required on write (`headRefOid` / `git rev-parse`).

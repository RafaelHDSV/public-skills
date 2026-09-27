# Flow C — self-review and calibration

> Reference for skill [`pr-review`](../SKILL.md). Load it **only** when the request is `self-review` / `calibration`. Flows A and B do not need this file.

## Flow C — self-review / calibration

Compare, **read-only**, your published GitHub reviews against the local artifacts in `.reviews/`. It persists versioned learnings in `$PR_REVIEW_SKILL/` to improve future reviews (Flows A/B).

**Deliverables (Flow C only):**

| Path | Role |
|------|-------|
| `$PR_REVIEW_SKILL/calibration/<YYYY-MM-DD-HH-MM-SS>-self-review.md` | Run report |
| `$PR_REVIEW_SKILL/references/calibration-profile.md` | Cumulative profile (merge) |
| `$PR_REVIEW_SKILL/references/<topic>.md` | Thematic reference (optional, strong pattern) |
| `$PR_REVIEW_SKILL/.raw/<run-id>.json` | API cache (optional, disposable) |

**`.reviews/`:** read-only — **never** write calibration there.

Profile merge contract: [`calibration/README.md`](calibration/README.md).

### C.1 Identity and window

1. Resolve the reviewer: `@me` via `gh auth status` / MCP `github__get_me` → `reviewerLogin`.
2. Read [`references/calibration-profile.md`](references/calibration-profile.md):
   - **`lastRunAt`** (ISO-8601) → filter reviews with `submitted_at >= lastRunAt`.
   - **File missing (1st run):** bootstrap the **last 30 days** (`bootstrapDays: 30`).
3. Optional input in the prompt:
   - `--bootstrap 30d` — force a fixed window
   - `--since YYYY-MM-DD` — explicit date
   - PR URL(s) / `owner/repo#N` — manual subset (skips the global search)

### C.2 GitHub collection (read-only)

Same MCP → `gh` chain as the skill; **any write is forbidden**.

| Data | Tool |
|------|------------|
| PRs I reviewed | `gh search prs --reviewed-by=@me --updated=><since> --json number,title,repository,updatedAt,url --limit 100` (paginate) |
| Fallback | MCP `github__search_pull_requests` — `query: "reviewed-by:<login> updated:>=YYYY-MM-DD"` |
| Review body + state | `github__pull_request_read` `method: get_reviews` (paginate) |
| Inline comments | `method: get_review_comments` (paginate) |

Filter for **your own** reviews in state `APPROVED`, `CHANGES_REQUESTED` or `COMMENTED`. Ignore reviews from `Copilot` / bots only.

**Forbidden:** `pull_request_review_write`, `gh pr review`, `gh pr comment`, MCP comment/issue writes.

Persist the optional raw cache at `$PR_REVIEW_SKILL/.raw/<run-id>.json` for reprocessing.

Optional scripts (deterministic):

```bash
node $PR_REVIEW_SKILL/scripts/collect-reviews.mjs [since-YYYY-MM-DD]
node $PR_REVIEW_SKILL/scripts/build-calibration.mjs <run-id>.json
```

The agent still writes the final markdown and does the semantic RC ↔ comment merge.

### C.3 Match against the local artifact

For each PR with a review of yours later than the local artifact (or inside the window):

1. Key `<repo-slug>-pr-<N>`.
2. Glob `.reviews/*-<repo-slug>-pr-<N>.md` → the **newest** by the timestamp in the filename (same rule as Flow A/B).
3. Parse from the artifact: **Preliminary verdict**, RC-NN, MEL-NN, Q-NN, **Text to paste**, Executive summary, Date.
4. Parse from GitHub: review state, body, inline comments (path + body + line when present).
5. Use the artifact whose **Date** precedes the GitHub review's `submitted_at` (the review reflects what the reviewer decided after reading the artifact).

Explicit PRs in the prompt limit C.2/C.3 to the named subset.

### C.4 Classification (per PR)

| Category | Criterion |
|-----------|----------|
| `veredito_alinhado` | Local `approve` / `approve_with_notes` ↔ GitHub `APPROVED`; local `request_changes` ↔ `CHANGES_REQUESTED` |
| `veredito_diverge` | Mismatch (e.g. local RC, GitHub approve) |
| `rc_acatada` | A local RC published on GitHub (semantic match by path/topic — an identical string is not required) |
| `rc_ignorada` | Local RC absent from the published review |
| `mel_acatada` / `mel_ignorada` | Same for improvements |
| `achado_novo` | A GitHub comment with no local counterpart |
| `sem_artefato_local` | GitHub review with no matching `.reviews/` |
| `sem_acao_github` | A local artifact with no review of yours after the artifact's Date |

Record the **semantic match confidence**: `high` / `medium` / `low`. It is the only remaining use of
"confidence" in the skill's vocabulary — the per-finding `Confidence: N/10` field was **retired on 17/09/2026**
and replaced by the binary `Checked: yes | no` ([`flow-a-b.md`](flow-a-b.md) § 4.2).

#### Gate error (since 17/09/2026)

With the binary field, the measurable axis stops being "the skill knew it was right" and becomes
"the § 4.1 gate is in the right place".

| Category | Criterion | Reading |
|-----------|----------|---------|
| `portao_apertado` | An artifact with `## Unverified findings` populated and sections 4/5 empty | The gate is blocking legitimate findings; check whether the § 4.1 framework caveat is missing |
| `portao_frouxo` | Artifacts where the appendix is **always empty** | Everything is shipping `Checked: yes`. That is what run 3 measured: 0 of 421 artifacts used the appendix |
| `verificado_descartado` | A `Checked: yes` finding the reviewer discarded ≥ 2 times | A **suppression** candidate — the cited evidence did not sustain the claim |
| `nao_verificado_confirmado` | An appendix finding that the published review confirmed | The gate cost a real finding; worth naming the pattern as a checklist item |

#### Dimension error (since 17/09/2026)

With the per-finding `Dimension` field, the question run 3 could not answer becomes exact:
**which items of `technical-checklist.md` never produced a finding?** Aggregate by dimension each run and
list the items with zero cumulative occurrences. An item with no occurrence across 3 consecutive runs is a
candidate for removal from the checklist — it is the only measured route for the skill to shrink.

A finding marked `— outside the checklist` is the inverse signal: an item is **missing**. Two such findings
on the same theme, in different runs, become a proposal for a new item.

An artifact from before 17/09/2026 has neither field and falls outside these categories — do not
count it as an error, only as outside the window.

**Aggregate metrics:** RC acceptance rate, new-findings rate, verdict divergences, recurring false positives, confidence error in the four categories above.

**Promoting a pattern to the profile:** require **≥2 occurrences** in the run or cumulatively. The same holds for
promoting a **suppression** — and a suppression can never cover real security, recent code removal
(§ 3.1) or an uncovered acceptance requirement (§ 2.1).

### C.5 Outputs

#### Run report

Write `$PR_REVIEW_SKILL/calibration/<YYYY-MM-DD-HH-MM-SS>-self-review.md`:

- Metadata: window, `reviewerLogin`, N PRs analyzed, local timestamp.
- Per-PR table: link, local verdict vs GitHub, RCs accepted/ignored, new findings, confidence.
- **Detected patterns** (≥2 occurrences).
- **Suggested skill changes** (bullets — do not apply them automatically).
- Footer: `*Flow C pr-review — local analysis only; no action was taken on GitHub.*`

#### Merge into `calibration-profile.md`

Update [`references/calibration-profile.md`](references/calibration-profile.md):

- Frontmatter: `lastRunAt`, `bootstrapDays`, `reviewerLogin`, `totalRuns`.
- Regenerated sections: Cumulative metrics, Confirmed patterns, Skill anti-patterns, Severity calibrations, **Confirmed suppressions**, **Confidence calibration**.
- **`## Confirmed suppressions`:** add a row only with ≥ 2 occurrences, always with the origin. Removing a suppression requires new evidence — record the reason in the run report.
- **`## Manual notes`:** preserve in full — never overwrite.

#### Thematic references

On a strong pattern (e.g. 3× sibling-base → PROD divergence): create/update `references/<topic>.md` and link it from the profile.

### C.6 Integration into Flows A/B

**Before** step **2. Product and business context** in every A/B review:

1. Read [`references/calibration-profile.md`](references/calibration-profile.md) if it exists.
2. Apply documented calibrations (severity, sibling-base → PROD, CI billing, etc.).
3. If a calibration influenced the verdict or a classification, mention it in the **Executive summary**: `Calibration: …`.

### C.7 Chat response (Flow C)

1. Path of the run report in `calibration/`.
2. Short profile delta (new patterns / metrics).
3. Top 3 gaps (new findings, verdict divergences, recurring ignored RCs).
4. Ask for validation of the patterns before consolidating new thematic references.
5. Reminder: *No action was taken on GitHub.*

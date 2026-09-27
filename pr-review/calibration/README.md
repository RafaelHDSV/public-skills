# Calibration — Flow C (self-review)

Run reports for **Flow C** of skill `pr-review`. They live in this folder; do **not** write them to `.reviews/`. `.raw/` is a disposable cache and is not part of the skill.

## Files

| Path | Use |
|------|-----|
| `<YYYY-MM-DD-HH-MM-SS>-self-review.md` | Report for a single run |
| `../references/calibration-profile.md` | Cumulative profile consumed by Flows A/B |
| `../references/<topic>.md` | Thematic reference (optional) |
| `../.raw/<run-id>.json` | Read-only cache of the GitHub API (disposable) |

## Profile merge contract

### Frontmatter

| Field | Type | Description |
|-------|------|-----------|
| `lastRunAt` | ISO-8601 or `null` | End of the processed window; the next run uses `submitted_at >= lastRunAt` |
| `bootstrapDays` | number | Initial window when `lastRunAt` is `null` (default 30) |
| `reviewerLogin` | string | GitHub login of the reviewer (`@me`) |
| `totalRuns` | number | Flow C run counter |

### Preserved (never overwrite)

- **`## Manual notes`** — the reviewer's manual content

### Regenerated on every merge

- `## Cumulative metrics`
- `## Confirmed patterns` (≥2 occurrences)
- `## Skill anti-patterns (avoid)`
- `## Severity calibrations`

### Per-PR taxonomy (run report)

| Category | Meaning |
|-----------|-------------|
| `veredito_alinhado` | Local verdict consistent with the GitHub state |
| `veredito_diverge` | Verdict mismatch |
| `rc_acatada` / `rc_ignorada` | A local RC published or not published on GitHub |
| `mel_acatada` / `mel_ignorada` | Same for improvements |
| `achado_novo` | A GitHub comment with no local counterpart |
| `sem_artefato_local` | GitHub review with no `.reviews/` |
| `sem_acao_github` | Local artifact with no later review |

Semantic RC ↔ comment match: record confidence `high` / `medium` / `low`.

## How to run

```
skill pr-review self-review
```

Optional: `--bootstrap 30d`, `--since YYYY-MM-DD`, or explicit PR(s) in the prompt.

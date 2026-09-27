# Logo Directions

> Copy to `<logo-dir>/logo-directions.md` after the Strategy Workshop.
>
> Each Direction is a **brand concept**, not a generic icon. A human approves a subset, which
> is then recorded in `strategy.yaml` → `approved_directions`.

## Direction A — "<short title>"

**Concept:** one sentence — what the brand *means* under this reading.

**Visual cues:** the objects and viewpoints this Direction allows.

**Anti-cues:** what this Direction is *not*.

## Direction B — "<short title>"

**Concept:**

**Visual cues:**

**Anti-cues:**

## Direction C — "<short title>"

**Concept:**

**Visual cues:**

**Anti-cues:**

## Direction D — "<short title>"

**Concept:**

**Visual cues:**

**Anti-cues:**

---

## Human gate

In chat: `approved directions A B C` — then the agent records:

```yaml
approved_directions: [A, B, C]
```

With `--no-stop` the agent chooses instead, and records `auto_approved: true` plus
`human_review_owed: true`.

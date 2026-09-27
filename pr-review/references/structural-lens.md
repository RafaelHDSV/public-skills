# Structural lens — opt-in, never in the default flow

> **Source:** adapted from `thermo-nuclear-code-quality-review` of the cursor-team-kit (MIT).
> Kept opt-in for the same reason as upstream. No upstream file was copied.

## When this reference loads

**Only** when the prompt asks for it by name: `--structure` (`--estrutura`), "structural review", "maintainability
review", "look at this PR's architecture". It is **never** part of Flow A, Flow B or the default
technical checklist.

The upstream skill carries `disable-model-invocation: true` for the same reason: this lens applied to
every PR produces a stream of restructuring suggestions nobody asked for, and the reviewer stops reading
the findings that mattered. Keeping it opt-in is what keeps it useful.

## What it is for

The skill's default lens is **correctness**: does this break, does it regress, was something deleted
that should not have been. This lens is **structure**: is the code that results from this PR one a
person can still work in six months from now.

Different question, different evidence, different bar for publishing — § "The verification gate" below.

## The ambition

Do not settle for local cleanups — "extract this into a helper", "this name could be better". Those are
true and cheap and they are not what this lens is for.

Look for the restructuring that preserves behavior while making the implementation **dramatically**
smaller and more direct. The upstream calls these "code judo" moves. They usually look like:

- A conditional tree that exists because a piece of state is in the wrong place. Move the state, the
  tree disappears.
- Two functions that are the same function with a flag between them.
- A layer that only forwards. Deleting it removes a file and clarifies the call site.
- Data reshaped at three call sites because it was stored in a shape nobody uses.
- A special case that stops being special once the general case is written correctly.

## What to examine

| Dimension | The question | The signal |
|---|---|---|
| **File growth** | Did this PR push a file past the point where it can be held in one head? | Check the file's size before and after, not just the diff |
| **Abstraction quality** | Does the abstraction pay for itself, or is it a layer with one caller? | Count the callers |
| **Condition growth** | Is this the third branch added to the same conditional in as many PRs? | `git log -p` on that block |
| **Boundary erosion** | Does this diff make a module reach into another's internals? | Imports crossing a layer they did not cross before |
| **Duplication with intent** | Is this a near-copy of an existing flow (V1/V2, Apply, handlers)? | The workspace's own standing rule: do not duplicate V1 |
| **Reversibility** | If this design is wrong, how expensive is it to undo in six months? | How many call sites would change |

## The verification gate — stricter here, not looser

A structural finding is more subjective than a correctness finding, and this skill's whole reputation
rests on not publishing fragile claims.

| Finding | Where it goes |
|---|---|
| Backed by concrete evidence in the diff — line counts, caller counts, `git log` showing the third branch | **Findings** (verified), with the evidence cited |
| A judgment about how the code reads, with no measurement behind it | **Unverified findings** |
| A restructuring proposal that would need code written to confirm | **Unverified findings**, framed as a question |

When in doubt: **Unverified findings**. The section exists precisely so this lens can say something
without the skill asserting it.

## What is out of scope here

- **Correctness bugs** — the technical checklist owns those; do not re-find them here.
- **Style** — semicolons, quotes, import order. The repo's ESLint owns it.
- **Rewrites of code the PR did not touch.** A file the PR grazed is not an invitation to redesign it.
  Say the file is at risk; do not review code outside the diff as if it were in it.
- **Any GitHub write.** § 1.4 is unchanged: the deliverable is still markdown in `.reviews/`, and
  `--comment` still publishes only an unsubmitted pending review with no `event`.

## In the artifact

Structural findings go in their own block so they are not mistaken for correctness findings:

```markdown
### Structural lens  (requested with `--structure`)

| # | Where | Finding | Evidence | Proposed move |
|---|------|--------|-----------|--------------------|
| E1 | `path:line` | … | <the measurement> | … |
```

If the lens finds nothing worth the reader's time, write one line saying so. A section padded to look
thorough is the failure mode this reference is trying to avoid.

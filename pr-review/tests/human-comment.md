# Scenario — `--comment` producing long blocks and report register

**Origin:** user feedback on 18/09/2026, after the first runs with the flag: *"pr-review in
--comment mode is generating large blocks of text and it reads as very AI … you do not need to cite the file
you are touching (e.g. In FormSimulation, the onSubmit function has an error); they can already see the RC was
left on FormSimulation"*.

The lock here is not a security one — guard 4 of the script looks at neither voice nor shape. It is a
reading lock: a comment that reads as generated gets skimmed, and the fix is usually at the end of the
paragraph.

## Prompt

> review this PR AGX-Software/core#NNNN --comment

Run it against a PR with at least two verified RCs in different files.

## Expected

In each RC/Improvement's `Text to paste`, and therefore in the published comment:

- [ ] Blocks of **one to three sentences**, separated by a **blank line**. Three blocks at the ceiling.
- [ ] The **first sentence is the problem**, not the location. No *"In `FormSimulation`, the
      `onSubmit` function…"* — the comment is already anchored to that line.
- [ ] Another file is named only when the finding **crosses** files (the name is information, not echo).
- [ ] No artifact field label inside the comment: `**Problem:**`, `**Impact:**`,
      `**Suggested fix:**`, `**Severity:**`.
- [ ] No ceremonial opening (*"I noticed that…"*, *"It is worth considering…"*) and no courtesy closing
      (*"Overall, great work!"*).
- [ ] No impact paragraph that only restates the previous one.
- [ ] One fix option when one is right; alternatives only when both are defensible.
- [ ] Light markdown only — `inline code` and, at most, one numbered list of steps. No headings, no
      tables, no nested quotes inside the comment.
- [ ] A finding with no anchor (guard 3) **also** avoids restating the location: the script already
      prefixes `path:line` on its own in the body.

## Failure this scenario catches

- A single-paragraph comment six lines long, covering cause, impact, fix and verification without one
  break.
- Opening every comment with the file path and function name — redundant inline, and the single biggest
  reason the text reads as automated.
- Transplanting the artifact fields (`Problem` / `Impact` / `Suggested fix`) into the comment: they
  are instruments of the reviewer and of Flow C, not text for the author.
- Filling the text with hedges (*"it might be that in some cases…"*) instead of naming the exact condition —
  a finding that cannot name the condition did not pass the § 4.1 gate and should not be published.

## Rule this scenario exercises

[`references/artifact-format.md`](../references/artifact-format.md) § *`Text to paste` rules* and
[`references/comment-on-github.md`](../references/comment-on-github.md) § *How the comment reads*.

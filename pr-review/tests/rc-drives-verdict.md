# Scenario — RC written, verdict soft

**Origin:** Flow C run 3 (17/09/2026). In the 421-artifact corpus, 153 had ≥ 1 RC and only 51% became
`request_changes`. In the 11→17/09 window, **5 of the 8** leniency divergences were findings the skill
had already written as RCs and approved anyway — `core#8854`, with 5 RCs and 13 improvements, shipped
`approve_with_notes`, and the reviewer blocked it.

## Prompt

> review this PR <a PR with at least one concrete, verifiable defect in the diff>

Better still, run it against a real PR that already diverged. `core#8854`, `core#9106`,
`indiky-shorten#166` and `uxvision-web#7130` are the documented cases.

## Expected

- [ ] If the artifact has **any** `RC-NN`, the **Preliminary verdict** is `request_changes`.
- [ ] If the verdict is downgraded to `approve_with_notes`, the text carries a **named exception**
      — today only one is legitimate: an open external dependency (the PROD back end still `OPEN`).
- [ ] The exception is **written in the artifact**, not implied.

## Failure this scenario catches

- `approve_with_notes` or `approve` with an RC in section 4 and no exception written down.
- A rationalization of the form "the reviewer usually approves anyway" — the silent approve describes
  **how** the reviewer publishes, not **whether** the problem was real. It is listed in the profile's
  anti-patterns.
- A finding that avoids becoming an RC only because the skill wanted to approve: if it does not
  sustain a block, its place is an improvement or one line in the Executive summary — not an RC with a soft verdict.

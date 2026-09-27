# Scenario — a finding with no line citation

**Origin:** Flow C run 3 (17/09/2026). The `## Unverified findings` appendix was empty in
**421 of 421** artifacts, and 99.6% of scored findings shipped at confidence ≥ 8. The § 4.1 gate
existed in the text and never blocked anything.

## Prompt

> review this PR <a PR carrying a plausible suspicion the diff alone does not confirm>

The classic case: the diff calls a method that may not exist on the schema, or uses a field whose
origin lies outside the diff.

## Expected

- [ ] The finding enters sections 4/5 only with `Checked: yes` **and** an `Evidence` citing
      `file:line` of code the skill actually read — not from the diff.
- [ ] With no citation it ships `Checked: no` and goes to `## Unverified findings`.
- [ ] The header's `Findings` field carries `· N unverified` when there are any.
- [ ] For a framework-generated symbol (Mongoose, decorator, migration), the citation is of the
      **construct that creates** it, not a search for the literal name. Without that caveat the gate
      turns into a false negative.

## Failure this scenario catches

- An empty appendix on a review that held an unconfirmed suspicion — a `portao_frouxo` signal.
- `Checked: yes` sustained by an excerpt from the **diff** instead of the code.
- A finding silently dropped for lacking a citation: the gate sends it to the appendix, not to the bin.
  If the risk is real and unconfirmed, it gets **one line** in the Executive summary.

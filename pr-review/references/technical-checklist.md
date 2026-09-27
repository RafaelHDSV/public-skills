# Technical checklist by dimension

> Reference for skill [`pr-review`](../SKILL.md). Load it alongside [`flow-a-b.md`](flow-a-b.md) — it is the content of **§ 3 Technical diff analysis**, which over there is only a pointer.

Adapted from `garrytan/gstack` (`review/specialists/*.md`) and `alirezarezvani/claude-skills`
(`pr-review-expert`) to the AGX stack — Node ≥ 22, Express 5, MongoDB/Mongoose, React + Vite +
TypeScript, Less, CircleCI. Proposal: `.issues/2026-09-14-pr-review-melhorias-skills-externas.md`.

## How to use

Not every dimension applies to every PR. Pick by what the diff touches; do **not** walk all seven
on a two-file front-end tweak.

| Dimension | Run when |
|-----------|----------|
| 1. Correctness | Always |
| 2. Security | Always (cheap pass); deep pass when auth, permission, upload, webhook, or PII is touched |
| 3. Performance | Backend query/loop changes, or front-end render/bundle changes |
| 4. Tests | Always |
| 5. Data & schema | Migration, seed, Mongoose schema, index, destructive script |
| 6. API contract | Route added/changed/removed, response shape, payload, env var, cross-repo call |
| 7. Maintainability | Always (cheap pass) |

Every item below is a **question against the diff**, not a claim. An item that fires still has to
clear the **pre-emit verification gate** in [`flow-a-b.md`](flow-a-b.md) § 4.1 before it can
become an `RC-NN` or `MEL-NN`: quote the line, or the finding does not leave the appendix.

---

## 1. Correctness

- **Edge cases of the new branch** — empty array, `null`/`undefined`, zero, single element,
  first run with no existing record. Does the new code path assume data that may not exist yet?
- **Silent partial failure** — a loop that processes N items and throws on item 3: are items 1-2
  rolled back, or does the record stay half-written? Destructive-then-create sequences
  (`remove` → `create`, `DELETE` → `POST`) without rollback are an RC (base: `uxvision-web#7130`).
- **Conditional side effect** — one branch updates the related record, logs, or emits the event and
  the sibling branch forgets to. Look for a log line claiming an action that a guard skipped.
- **Enum / status completeness** — a new status, tier, type constant or string literal must be
  traced through **every consumer**, including files outside the diff. Grep the sibling values,
  then **read** each hit: a value added to the front-end dropdown but not persisted by the service
  is the classic miss. This is the one item that requires reading code the diff does not show.
- **Body of the PR × code** — behaviour the description promises with no counterpart in the diff is
  an RC, not a question (base: `uxvision-web#7130`, `getPermission()` only on mount).
- **Concurrency** — read-check-write without a unique index; find-or-create that two simultaneous
  requests can duplicate; status transition that is not an atomic conditional update.
- **Type coercion at boundaries** — a value crossing Mongo → API → React where number becomes
  string (or the reverse), especially when it feeds a comparison, a key, or a hash.

## 2. Security

Real findings here open `## 7. Security and sensitive data` in the artifact. An all-clear scan does
**not** open the section — at most one line in the Executive summary ([`artifact-format.md`](artifact-format.md)).

- **Secret in the diff** — key, token, password, connection string, service-account JSON, `.env`
  with real values. Blocker, and § 1.2 of the hub applies. Never copy the value into the artifact.
- **Authorization, not just authentication** — a new route behind the auth middleware still needs
  to check that *this* user owns *this* record. Changing an id in the payload to read someone
  else's data (IDOR) is the most common real finding in a multi-tenant product.
- **Default-allow** — a permission check that falls through to "allow" when the role is unknown,
  or a guard that returns early without denying.
- **Input crossing a trust boundary** — request body or query parameter used directly in a Mongo
  query object (operator injection via `{ $ne: null }`), in a file path, or in a URL that the
  server then fetches (SSRF).
- **XSS escape hatches** — `dangerouslySetInnerHTML`, `innerHTML =`, or rendering unescaped
  user-controlled HTML.
- **Leak through logs and errors** — token, password, full document or PII in a log line, or an
  internal stack trace returned to the client.
- **Crypto misuse** — MD5/SHA1 for anything security-relevant, `Math.random()` for a token,
  non-constant-time comparison of a secret.

## 3. Performance

- **N+1** — a query inside `map` / `forEach` / `for`, or a populate missing on a list endpoint.
  Cheap to spot, expensive in production.
- **Missing index** — a new `find` / `sort` on a field with no index, or a new foreign-key-ish
  field with no index. Check the schema, not the intuition.
- **Unbounded result** — a list endpoint or query with no `limit` and no pagination, on a
  collection that grows with usage.
- **Algorithmic shape** — `find` inside `map` where a `Map` lookup would do; repeated sort/filter
  over the same collection; string concatenation in a large loop.
- **Blocking the loop** — synchronous I/O, heavy CPU work, or a sequential `await` chain where
  `Promise.all` would fan out.
- **Front-end render and bundle** — unstable references causing re-renders, a fetch waterfall
  that could be parallel, a heavy new dependency for one call, a missing `loading="lazy"` on a
  below-the-fold image.

## 4. Tests

- **Negative path** — the new guard, the new error branch, the new "denied" case. A PR that only
  tests the happy path of a permission check has not tested the permission check.
- **Coverage delta** — source files changed versus test files changed. A backend service touched
  with zero test files in the diff is at least a `Test` finding; on an auth or money path it is
  an RC.
- **Deleted tests** — a test removed without the code it covered being removed. Always ask why;
  see [`recent-code-removal.md`](recent-code-removal.md).
- **Isolation** — shared mutable state between specs, dependence on execution order, on the clock,
  or on the timezone. In `ts-jest`, a spec without any `import`/`export` is treated as a script in
  the **global scope** and collides with sibling specs — the suite fails in ~1s and looks like a CI
  billing problem, not a code problem.
- **Flakiness** — timing assertions, assertions on the order of unordered results, real network
  calls without a stub.

## 5. Data & schema

- **Reversibility** — is there a down path, and does it actually undo the change rather than
  no-op? Would rolling back break the code that is already deployed?
- **Data loss** — dropping a field that still holds data, narrowing a type, renaming without
  updating every reader (service, aggregation, index, front-end).
- **Required field on existing data** — a new required field with no default and no backfill will
  reject writes to every document already in the collection.
- **Deploy ordering** — does the schema change break the **currently running** code during the
  rolling deploy? Code first then migration, or the reverse — say which, and whether the PR says it.
- **Index creation cost** — a new index on a large collection blocks; say so, and prefer the
  background/concurrent path.
- **Batching** — a backfill that updates every document in one statement locks the collection.

## 6. API contract

- **Breaking response shape** — a field removed or retyped. A mobile or external client that
  cannot force-update still reads it.
- **New required parameter** on an existing endpoint — every current caller breaks.
- **Route removed or renamed** without an alias and without a deprecation window. Cross-check the
  `-` lines of the diff for `router.get|post|put|delete|patch`.
- **New environment variable** — a `process.env.X` introduced in the diff must appear in
  `.env.example` (§ 1.2 — only the example file, with a placeholder, never a real value). A
  variable **removed** from the code may still be set in a running environment.
- **Error contract** — new endpoint returning a different error shape than its neighbours. On
  AGX the `throwlhos` body arrives at the front under `error.response.data`, and the i18n key
  can be stripped by middleware: discriminate by `errors.reason`, not by the message string.
- **Cross-repo caller** — a route or payload consumed by another repo (`core` ↔ `indiky-shorten`,
  server ↔ jobs) changed without a sibling PR. Look for the sibling; its absence is a finding.

## 7. Maintainability

The calibration profile ranks this as where the human reviewer actually comments — items 4, 5, 6
and 8 of [`calibration-profile.md`](calibration-profile.md) "Confirmed patterns". Weight it
accordingly; it is not the low-value dimension it looks like.

- **Duplication (DRY)** — a new file or class replicating an existing one almost line by line, a
  wrapper that only forwards, a duplicated type. **The reviewer's #1 finding** — never close a review
  having skipped this check.
- **Dead and unnecessary code** — a function nobody calls, a variable assigned and never read, a
  leftover `console`, a commented-out block, an import that the change made unused.
- **Reimplementing the library** — hand-rolled pt-BR month/day labels where `dayjs` with
  `locale('pt-br')` does it; hand-rolled date, currency or deep-clone helpers.
- **Repo convention** — literal hex colour instead of the variable, literal width in a media query
  instead of the `variables.less` variable, naming that departs from the folder it lives in.
- **Weak typing** — an inline structure repeated in three places that should be a named `type`;
  `any` introduced where the shape is known.
- **Stale comment or docstring** — text describing the behaviour the diff just changed.
- **Magic value** — a bare threshold, limit, retry count or hardcoded URL in logic.

---

## Suppressions — do not flag (fixed core)

Fixed core. The **learned** appendix lives in [`calibration-profile.md`](calibration-profile.md)
`## Confirmed suppressions`, promoted by Flow C with the ≥ 2-occurrence contract. Read both before
classifying a finding.

- **Anything the diff already fixes.** Read the whole diff before writing a finding — a problem
  introduced in hunk 2 and solved in hunk 9 is not a finding.
- **Harmless redundancy that aids reading** — a guard that is technically implied by the next one.
- **"Add a comment explaining this threshold"** — thresholds get tuned, comments rot.
- **"This assertion could be tighter"** when the assertion already covers the behaviour.
- **Consistency-only change** — rewriting working code purely to look like its neighbour, with no
  defect and no readability gain.
- **"This regex misses edge case X"** when the input is constrained and X cannot occur.
- **Style the linter owns** — quotes, semicolons, import order, formatting. If CI checks it, the
  review does not.
- **A test that exercises more than one guard at once.** Tests do not have to isolate every branch.
- **Tests, error paths, input validation, accessibility and security measures are never deletion
  targets.** Coverage is pushed **up** by dimension 4; only unrequested *structure* is pushed down.
- **Debt the PR declares** — a gap the author names explicitly in the body with a ceiling and a
  follow-up card. Verify the card exists; an undeclared gap presented as declared is still a
  finding, and so is the missing card.

**Suppression is not silence about risk.** A suppressed item that the reviewer would still want to
know about belongs in one line of the **Executive summary**, never as an `RC-NN`.

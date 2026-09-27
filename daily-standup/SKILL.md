---
name: daily-standup
description: >-
  Use when the user asks for a daily, standup, or board-ready team update.
  Formats every person into two bullets under a character budget, links
  each card once to its real issue, and learns from the text the team actually
  published. Write in the language of the draft. Examples here are English.
  The issue index and the examples live in this skill's references/.
license: MIT
metadata:
  author: RafaelHDSV
---

# Daily standup

When the user asks for a **daily**, **standup**, or team-format text, follow this skill. Write the board text in the language of the draft. The examples below are English.

`$DAILY_SKILL` is this skill's own directory.

The three reference files are the team's memory. They ship empty. Fill them as the board publishes, and read them before writing.

| File | Holds |
|---|---|
| [references/issues.md](references/issues.md) | Official issue title → number, for the repo the team tracks |
| [references/patterns.md](references/patterns.md) | Phrasing the published board kept or cut |
| [references/examples.md](references/examples.md) | Full published dailies, newest last |

## Mandatory workflow

1. **Read** the three reference files **before** writing.
2. **Resolve every named card** in the draft before writing. Match `references/issues.md`. If it is missing, search the issue repo the user named (`gh` or the GitHub API) by title. Use the **official issue title**. Do not invent a card from a product name alone. If it is still unresolved: short descriptive text, **no** invented `#NNNN`.
3. **List every person** in the draft, in the draft's order. The output includes all of them.
4. Never deliver a partial daily: missing date, missing people, only one person when the draft had several, a done bullet without a plan, or commentary instead of the board block.
5. **Output** only the board-ready markdown (date + all people + bullets). No preamble, no postscript, unless the user asked for commentary.
6. When the user returns the **published** text, update the reference file that learned something — a new issue row, a pattern, or the example — inside `$DAILY_SKILL/references/`. Do not bloat this `SKILL.md`.

## Pre-output checklist

- [ ] First line: `*DD/MM/YYYY*`
- [ ] Every person from the draft has `**name**` and **exactly 2** bullets (done + plan)
- [ ] No blank line between date, name, and bullets of the same person; **one** blank line between people
- [ ] Done is chronological (morning, then afternoon, then later)
- [ ] Plan starts with what they will do today (or the equivalent the board already uses)
- [ ] First mention of each card: a **link**. Repeats: **bold** short title only
- [ ] Every named card resolved, or confirmed absent after search
- [ ] No semicolons (`;`)
- [ ] **≤2000 characters** (Discord hard limit — count before delivering)
- [ ] Similar density across people

## Structure

- Date line: `*DD/MM/YYYY*`
- Per person: `**name**` in the casing the board uses (lowercase if that is the team's habit)
- **Two bullets:**
  1. **Done** — chronological when there are several activities
  2. **Plan** — what they will do today
- **Yesterday:** only when the board publishes yesterday's work under today's header. If the draft says "yesterday" and the board puts it in today's done bullet, do not label it as yesterday.
- **Absence:** a blockquote `>` immediately before `**name**`. If they sent an async note, the two bullets still follow.
- **Discord ≤2000:** if over, trim the **done** bullet first. Never omit a person. Drop secondary detail before the main delivery.
- **Budget by N:** with 6 people, aim at about 280–320 characters per person block. With 5 or more, compress harder.

## Formatting

- Card link text is **not bold**. A support ticket is **Ticket** in bold plus `[Title](url)`.
- Issue URL shape: `https://github.com/<owner>/<repo>/issues/N`, or `[#N](url)` when several numbers sit in one phrase.
- First mention of a card in the daily is a link. A repeat, including inside the same bullet, is bold only.
- People named inside a bullet are italic. The header is the standup name.
- Action nouns the board italicizes (_review_, _feature review_) stay italic.
- Repos and environments go in backticks.

## Style

- Objective. No meta notes in the pasted text.
- The language of the draft, with its normal spelling.
- Third person in the done bullet even when the draft is first person.

## Shape

```markdown
*26/06/2026*
**ana**
- In the morning she closed [Header adjustment](https://github.com/example/board/issues/120), which she had already started. In the afternoon she started [Inactivity lock](https://github.com/example/board/issues/121)
- Today she will stay on the same card

**bruno**
- He started the day by opening the [Presentation PDF](https://github.com/example/board/issues/118) PRs for `production`. Then he tested [PDF on invoice issue](https://github.com/example/board/issues/119) in `staging`
- Today he will continue on **PDF on invoice issue** and wait for the **Presentation PDF** test in `production`
```

The names, titles and numbers above are a shape, not a team. Real titles come from `references/issues.md` and from the issue search.

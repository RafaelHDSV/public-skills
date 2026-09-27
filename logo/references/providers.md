# External providers — the optional roundtable

> **What this is for:** a catalogue of image generators usable in `/logo roundtable` as
> **concept explorers** — never as the source of the final mark.
> **Related:** [../SKILL.md](../SKILL.md), [rebuild-checklist.md](rebuild-checklist.md), [logo-critic.md](logo-critic.md).

## Everything here is optional

The default path needs **no provider at all**. The master is an authored geometric SVG either
way; external sketches are a mood board. If you have no provider configured, skip this file —
nothing downstream changes.

> **Failure mode:** the roundtable was once the documented default and required accounts and
> MCP servers, so every real run took the escape hatch instead.
> **Why this rule exists:** a default that most installs cannot reach is not a default.

## Prerequisite

`strategy.yaml` with a non-empty `approved_directions`. Without it, `roundtable-prompt.mjs`
aborts — the point of the roundtable is to explore an **approved Direction**, not to fish.

## The prompt is concept-first

Never "logo for <Brand>". Each cell gets a Direction:

```
Create a minimalist geometric symbol.
Direction: <title> — <concept>
Communicate: <brand_keywords>
Avoid: <strategy.avoid>
Flat monochrome, square 1:1, no text, legible at 32px.
```

## Choosing providers

The script does not call providers for you — it emits one prompt per cell, tagged with its
Direction, round-robin over `approved_directions`. How you run them is yours.

| Kind | What it gives | Cost |
|------|---------------|------|
| **Whatever image generation your agent already has** | The cheapest cell: no extra account | Usually included in the session |
| **`roundtable-pollinations.mjs`** | Public HTTP API, no key | Free; quality varies; may disappear |
| **Manual upload** | You paste PNGs into `sketches/external/manual-*` | Zero, always available |
| **A design tool with an MCP server** | Good icon quality when you already use one | Whatever that account costs |
| **Internal geometric candidates** | SVG drawn by the agent, no service at all | Zero |

Optional credentials are read from the **project's** `.env` by `roundtable-prompt.mjs`. No key
is required; missing ones simply mark their cells skipped.

**Not worth it for this step:** paid-per-credit image APIs. The output is a mood board that gets
redrawn from scratch — paying per sketch buys nothing the free options do not.

## What the roundtable never decides

| It explores | It never produces |
|-------------|-------------------|
| How a Direction reads as an image | The shipped mark |
| Which Direction has visual legs | A file in `assets/logos/` |
| Anti-references — what to avoid | Anything that skips the Critic |

Auto-tracing a PNG into SVG is forbidden on the happy path. The master is redrawn —
see [rebuild-checklist.md](rebuild-checklist.md).

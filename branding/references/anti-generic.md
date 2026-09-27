# Anti-generic self-critique

Run this before calling a brand guide done, and record the answers in the guide's
**Decisions and trade-offs** section. Every row is a cluster the work drifts toward on its own;
reject each one unless the brief explicitly asks for it.

## Identity

| Cluster | Reject unless the brief asks |
|---------|------------------------------|
| SaaS default | A neutral grotesk + indigo `#6366f1` + a purple gradient |
| AI cliché | Sparkle icons, cyan-on-black cyber |
| Weak naming | Generic compounds — `SmartFlow`, `DataHub` |
| Swatches too small to judge | A 40px chip is a label, not a colour. ≥96px of colour per card |

## The marks

| Cluster | Reject unless the brief asks |
|---------|------------------------------|
| Logo noise | Illegible at 32px |
| Abstract stroke logos | Arcs and dots with no recognisable object |
| Prompt-only logos | The SVG files do not exist |
| Stacked primitives | The mark is only `rect`/`circle`/`line` with no authored path |
| Hand-drawn letterforms | An agent cannot draw an alphabet — use the lockup builder |
| Wordmark as `<text>` **with no embedded face** | The font has to travel; a base64 woff2 subset is about 3 KB |
| Icon-library silhouette | Heartbeat, padlock, bullseye, speech bubble, 2×2 grid, sparkle, spinner |
| One idea drawn six times | Six sunrises is not six marks — a variant is a different route, not a different angle |
| Accidental letterform | A symmetric stroke figure reads as `H`, `A`, `U`, `T` or `V` |
| Dark-only assets | No light-surface lockup; the mark was never seen on white |
| Filler variant | It exists to hit a count, not because it is good |

## The guide

| Cluster | Reject unless the brief asks |
|---------|------------------------------|
| Placeholder preview | Three generic rows of lorem — no logo, no thesis, no status semantics |
| **One screen wearing fifteen palettes** | Chrome + sidebar filters + three metric tiles + entity list, whatever the product does. Pick an archetype for the job — [example-screen.md](example-screen.md) |
| **Voice as adjectives** | "Calm, factual, human" describes every B2B product. Voice is a lexicon and three real strings — [voice-section.md](voice-section.md) |
| **Straw-man off-brand** | An example nobody would write teaches nothing. The off-brand version has to be plausible |
| **Process printed as content** | Rejected sketches, contrast audit, batch notes, file-path handoff — the reader is deciding on the brand, not auditing the run |
| **Unverified signal shipped as a signal** | "not verified in this batch" in a naming table. Run the check, or declare the gap |

## How to use it

Walk the three tables and, for each row you kept, write one sentence saying why the brief asked
for it. A row you cannot justify in a sentence is drift, not a decision.

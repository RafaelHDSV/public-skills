# Reference catalog — real logos

> **Purpose:** calibrate your eye before drawing. Open this **every time** you enter the logo phase.
> **Source of truth:** well-known public brands — analyse the principle, never copy the shape.
> **Related:** [mark-construction.md](mark-construction.md), [SKILL.md](../SKILL.md), [sources.md](sources.md)

## How to use it (mandatory)

Before the first SVG path, pick **3 references** and record them in `BRAND.html` (Logos or Decisions section):

| Slot | Criterion | Example question |
|------|-----------|------------------|
| **A — Same sector** | Similar product, same audience | "How does Linear signal dev tool without looking like GitHub?" |
| **B — Adjacent sector** | Same feeling, different category | "How does Datadog combine a mascot with monitoring?" |
| **C — Outside the sector** | Aspirational brand quality | "Why does the Nike symbol work with one stroke?" |

For each reference: **one line on what works** + **one line on what not to copy**.

---

## What a logo is

A logo is an **identity anchor**: a visual signal that survives 16px, works in monochrome, and does not need text to be distinctive (though the lockup may include a wordmark).

| Is | Is not |
|----|--------|
| A memorable gestalt (1 idea) | A detailed illustration |
| Refined optical geometry | A stack of Figma primitives |
| Proportion designed for a favicon | An app icon with rounded corners baked into the SVG |
| An extension of the colour/type system | A generic cyber gradient |
| Ownable — not mistakable for clip-art | The Noun Project's "lighthouse icon" |

---

## Taxonomy — pick ONE type

| Type | What it is | When to use | Real examples |
|------|------------|-------------|---------------|
| **Lettermark** | Typographic monogram | Long name, or strong initials | IBM, NASA, McDonald's M |
| **Wordmark** | Logotype — custom typography | Short, distinctive name | Stripe, Google, Vercel (wordmark) |
| **Pictorial** | Recognisable figurative icon | Clear, unique literal metaphor | Apple, Twitter (bird), Docker (whale) |
| **Abstract** | Ownable geometric form | Abstract product; confidence in simplicity | Nike, Pepsi, Chase |
| **Mascot** | Character | Human warmth, memorability | GitHub (Octocat), Mailchimp |
| **Emblem** | Symbol inside a shield/medal | Heritage, authority, teams | BMW, Starbucks (emblematic) |
| **Combination** | Symbol + wordmark | Flexibility (app icon + site) | Burger King, Lacoste, Adobe |

**Rule:** mixing two types in one mark (mascot + scene + dashboard + 3 colours) is the signature pattern of a bad AI-generated logo.

---

## Same sector — dev tools, infra, monitoring

| Brand | Type | Why it works | Lessons for SVG |
|-------|------|--------------|-----------------|
| **Linear** | Abstract | Three parallel lines — 1 gestalt, zero ornament | Few elements; consistent slope |
| **Vercel** | Abstract | Bold triangle — unique proportion, not a "generic arrow" | Simple closed shape; works at 16px |
| **GitHub** | Mascot | Ownable silhouette (Octocat) — not a "clip-art cat" | Unified contour; personality |
| **GitLab** | Pictorial | Geometric tanuki — curves with intent | One main path; controlled symmetry |
| **Docker** | Pictorial | Whale + containers — metaphor plus story | Literal, but drawn as a brand, not an icon |
| **Grafana** | Abstract | Spiral/chart — domain (metrics) with no text | Movement + domain in a single shape |
| **Datadog** | Mascot + pictorial | Dog plus observability context | Simplified mascot; not photo-real |
| **Sentry** | Abstract | Triangle with a cut — negative space | Silhouette with room to breathe |
| **Railway** | Abstract | Lines in perspective — movement/infra | Repeated rhythm; not loose blocks |
| **Supabase** | Pictorial | Bolt/S shape — energy plus database | Stylised literal metaphor |
| **PlanetScale** | Abstract | Concentric orbits — scale/planets | Circles with clear hierarchy |
| **PagerDuty** | Pictorial | Pager/alert shape — literal to the name | Recognisable object in silhouette |

**Sector pattern:** brands that ship use **1–3 shapes** and survive as a favicon. They avoid full-scene illustration.

---

## Adjacent sector — SaaS, productivity, data

| Brand | Type | Why it works | Lessons |
|-------|------|--------------|---------|
| **Notion** | Lettermark | N in a box — a contained workspace | Custom letter + simple container |
| **Slack** | Abstract (rebrand) | Ownable fluid shape — less "colourful hash" | Fewer colours in the mark; single form |
| **Figma** | Lettermark | An F of vectors — the product as metaphor | Letter = tool |
| **Stripe** | Wordmark | Custom typography — trust through type craft | A strong wordmark removes the need for a complex icon |
| **Airtable** | Pictorial | Table/stack — stylised literal | Simplified object from the domain |
| **Obsidian** | Pictorial | Crystal/stone — knowledge metaphor | Silhouette with personality |

---

## Outside the sector — iconic brands (universal principles)

| Brand | Principle | Application |
|-------|-----------|-------------|
| **Nike** | One stroke = movement | Extreme abstraction demands **perfect proportion** |
| **Apple** | Silhouette + negative space (the bite) | A smart cut beats ornament |
| **FedEx** | Arrow in the wordmark's negative space | Reveal on the second look — not in the first pixel |
| **Target** | Bullseye = the name translated visually | Maximum literal with minimum geometry |
| **Airbnb (Bélo)** | Single abstract form — not a "clip-art house" | Curves with a fixed ratio; symmetry broken on purpose |
| **Mastercard** | Two overlapping circles | Overlap creates a third reading |
| **Amazon** | A→Z arrow in the wordmark | The wordmark carries the metaphor |

---

## Anatomy of logos that ship

Extracted from the examples above — a mental checklist:

1. **One idea** — Linear = order/progress; Docker = containers on the whale; Vercel = a confident triangle.
2. **Closed silhouette** — a contour legible in black and white.
3. **Graceful scaling** — the favicon is a **drawn** simplification, not just `scale(0.5)`.
4. **2 colours in the mark** (accent + neutral) — extra colour lives in the product, not the base symbol.
5. **Optics over maths** — nudge the visual centre off-centre when it improves balance.
6. **Clearspace** — minimum breathing room = the mark's height on every side.
7. **Separate lockup** — symbol and wordmark combined in their own file; the isolated mark stays transparent.
8. **System before SVG** — mark colours are tokens (`--beam-500`, `--ink-100`), not hex invented on the spot.

---

## Reference parity test

Mentally place the mark on a grid with **Linear, Vercel, Notion, Grafana** (greyscale):

| Passes | Fails |
|--------|-------|
| Reads as an identity decision | Reads as an icon pack |
| One nameable gestalt | Needs the caption "it's a lighthouse" |
| Favicon legible | Blurs at 32px |
| Monochrome works | Depends on colour to make sense |

If it fails: **do not ship** that variant — redraw it.

---

## Anti-patterns visible in weak logos (AI or not)

| Pattern | Why it fails | What to do instead |
|---------|--------------|--------------------|
| Stacked rectangle + triangle + circle | Reads as clip-art | Vercel: 1 triangle |
| Generic lighthouse with no ownable proportion | Noun Project #3847 | Docker: literal with craft |
| 6 forced, near-identical variants | Dilutes quality | Ship what passes; a count is a target, not a licence |
| Full scene (sea + sky + buoys + panel) | Illegible small | Target: 1 circle |
| App-icon chrome inside the logo SVG | A store template, not a brand | Stripe: a clean wordmark |
| Gradient + glow + sparkle | Dates the logo within 2 years | Nike: 1 colour |

---

## Quick matrix — product → suggested type

| If the product is… | The type that tends to work | Reference |
|--------------------|-----------------------------|-----------|
| A technical dev tool | Abstract or minimal pictorial | Linear, Vercel, Sentry |
| Monitoring/observability | Abstract (sweep, orbit) or mascot | Grafana, Datadog |
| A personal dashboard | Abstract (scan) or stylised pictorial | Grafana, PlanetScale |
| A short one-word name | Wordmark + a simple symbol | Stripe + secondary mark |
| A warm, human brand | Mascot or friendly pictorial | GitHub, Mailchimp |

Not a rigid rule — a starting point for **choosing the type before drawing**.

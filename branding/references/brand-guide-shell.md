# Brand guide shell — interactive `docs/BRAND.html`

The brand guide is a **review artifact**, not a static PDF substitute. Structure it so stakeholders can navigate, inspect, and copy tokens in the browser.

## Layout

| Pattern | Detail |
|---------|--------|
| **Shell** | Sticky sidebar nav + scrollable content — uses viewport width, not a narrow centered column |
| **Grouping** | Nav clusters: Posicionamento · Naming · Cores · Tipografia · Logos · Voz · Tela exemplo |
| **Hero** | Compact lockup + thesis + jump links to key sections |
| **Mobile** | Sidebar collapses to top bar or `<details>` — content stays reachable |

Reference: `.docs/repo-monitor/BRAND.html`. Prose rules: [prose-density.md](prose-density.md) — no "clique para…" spam; disclaimers in footer only.

## Interactivity (vanilla JS only)

No frameworks. One `<script>` block at file end. Prefer `data-*` hooks over inline handlers.

| Feature | Purpose |
|---------|---------|
| **Scroll spy** | Sidebar highlights current section while scrolling |
| **Smooth anchors** | `scroll-behavior: smooth` + `scroll-margin-top` on sections |
| **Copy on click** | Swatches / tokens copy hex or CSS var — toast confirms |
| **Name switch** | Candidate card click renames the whole document — see the hook table below and [naming-candidates.md](naming-candidates.md). The marks do **not** change |
| **Logo promotion** | Card click **promotes** that mark into the whole proof sheet (ladder, surfaces, mono, clear space, misuse) + a restore button; the raw-SVG link lives inside the card — see [logo-proof-sheet.md](logo-proof-sheet.md) |
| **Tabs** | Split the logo section when it gets long: Proof sheet · Alternativas |
| **Collapsible** | `<details>` for secondary metadata only — never as a place to park a section nobody wanted |
| **Example screen** | Interaction fits the chosen archetype — see [example-screen.md](example-screen.md) |
| **Keyboard** | `Escape` closes modals; focus trap inside open modal |
| **Hover** | Cards, swatches, nav items, table rows — subtle border/background shift |

### Name switch — the hooks the page has to carry

The switch is only as complete as the hooks. Anything the prose bakes in literally survives the
click, and a guide titled one name while its example screen says another is worse than not
offering the choice at all.

| Hook | What it holds | On click |
|------|---------------|----------|
| `<title>`, `.hero h1` | The name as heading | Replaced with the candidate's name |
| `img[data-lockup]` + `[data-lockup-light]` | The theme-following lockup pair, **both files named by `handoff.yaml`** | Both attributes repointed, then the theme re-applies whichever ink is on screen |
| `img[data-lockup-pin="dark\|light"]` | The "both inks" block, which shows the two on purpose and so ignores the theme | Repointed directly |
| `[data-brand]` | The name inside prose — voice, example screen, chat author | `textContent` replaced |
| `[data-brand-slug]` | The name as a command or handle — `aurora --board 18` | `textContent` replaced with the slug |
| `[data-brand-initial]` | A one-letter avatar in the example screen | First letter of the name |
| The three naming tables | Availability, available, conflict | Swapped from the candidate's data island |

**What must stay literal.** The same word often appears twice in the prose: once as the brand
and once as the common noun the brand was taken from. `trinco / fecho — o clique que encerra o
dia` is the metaphor row explaining where a pt-BR generic candidate came from; renaming it to
`trinco / Claspa` turns an etymology into nonsense. Tokenise the brand, leave the noun.

Drop the article at every token site. `abre o Carimbo` becomes `abre @brand`, not `abre o
@brand`: grammatical gender does not survive a rename, and terse beats wrong.

## Swatches — the card has to show the colour

Card size is a content decision, not a layout one. A 40px chip does not let anyone judge a
colour: perception of hue and saturation depends on area.

> **Failure mode:** a batch shipped palettes whose colours only revealed they did not talk to
> each other once the example screen was built.
> **Why this rule exists:** the swatch is where a palette is judged, so it has to be big enough
> to judge.

| Rule | Value |
|------|-------|
| Minimum card width | `minmax(150px, 1fr)` in the grid |
| Colour area | **≥ 96px tall**, spanning the card's full width |
| Metadata | Token name, hex, and **the role** — three lines under the colour, never over it |
| Copy | Click copies the hex; a toast confirms (no "click to copy" caption) |

### The semantic role lives in the swatch

> **Failure mode:** a `<details>` block called *Semantic use* restated, in other words, the
> label already printed on the card — `--accent` → "dawn / brief highlight", beside a card
> reading "brand accent / dawn". A separate block for the same information.
> **Why this rule exists:** duplication in a review document trains the reader to skim.

**The information stays, the block goes:** each swatch carries a third line saying when that
token is used, written specifically (`background of a blocker row`, not `error`). A token you
cannot write that line for should not be in the palette — that is how two tokens with the same
hex get noticed.

## Contrast — a gate, not a section

The guide does **not** publish a `Pair / Hex / Ratio / WCAG` table.

> **Failure mode:** the table occupied identity space with an audit, and failed pairs nobody
> proposed using together — light ink over the accent at 1.57:1.
> **Why this rule exists:** an invented failure teaches the reader to ignore the verdict column.

The check stays mandatory **before** publishing, and in both themes:

```bash
node "$BRANDING_SKILL/scripts/check-contrast.mjs" <BRAND.html>
```

It measures `text/bg`, `text/surface`, `muted/bg`, `muted/surface` and `accent/bg` in the dark
theme **and** the light one. A non-zero exit means a wrong token, not a footnote.

> **Failure mode:** measuring only `:root` let a gold accent sit at 1.72:1 on the light
> background — invisible, and unaudited, because half the themes were never measured.

## Modals

```html
<div class="modal" id="logo-modal" hidden aria-hidden="true" role="dialog" aria-labelledby="modal-title">
  <div class="modal-backdrop" data-close></div>
  <div class="modal-panel">…</div>
</div>
```

- `hidden` + `aria-hidden` when closed; toggle on open
- Backdrop click and `Escape` close
- Example screen reuses the same modal shell for repo detail and "add repo"

## CSS conventions

- All colours from `:root` — interactive states use `color-mix()` or rgba of existing tokens
- `:focus-visible` on every interactive element
- `@media (prefers-reduced-motion: reduce)` disables smooth scroll and transitions
- Toast: fixed bottom-centre, auto-dismiss ~2s

## Quality gate (shell)

- [ ] Sidebar links to every major section; active state updates on scroll
- [ ] At least one copy-to-clipboard action (swatch or token)
- [ ] Clicking an alternative mark promotes it through the proof sheet, with a restore button
- [ ] Example screen has ≥1 interaction appropriate to its archetype
- [ ] Hover visible on cards and primary interactive elements
- [ ] Swatch colour area ≥96px tall; role line inside the card, no separate "semantic use" block
- [ ] `check-contrast.mjs` exits 0 — and its output stays **out** of the page
- [ ] Light/dark toggle exercised: header, sidebar and example-screen lockups swap with it
- [ ] No handoff/provenance section — file paths belong in the repo, not in the brand guide
- [ ] Works opened as `file://` — no build step, no external JS CDN

## Relationship to example screen

| Layer | Owns |
|-------|------|
| **Shell** (this doc) | Document navigation, copy, modals, tabs — wraps all sections |
| **Example screen** ([example-screen.md](example-screen.md)) | Product mock inside `#preview` — may have its own micro-interactions |

Both live in the same HTML file. Shell interactivity serves **reviewing the brand**; screen interactivity demonstrates **using the product**.

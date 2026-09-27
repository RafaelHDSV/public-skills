# Naming candidates — the four quadrants

> **What this is for:** producing name options that differ on the axis that actually matters, and
> letting the reader switch between them inside the guide.
> **Related:** [name-validation.md](name-validation.md), [brand-guide-shell.md](brand-guide-shell.md).

## The failure this replaces

> **Failure mode:** a batch shipped fifteen products all named with a common Portuguese noun —
> Carimbo, Régua, Vitrine, Ronda. Every one was memorable, every one was taken on every domain,
> and the guide offered no alternative. The Naming section diagnosed a problem it could not solve.
> **Why this file exists:** "pick a better name" is not feedback an agent can act on. Four
> quadrants are.

## The two axes

**Language** — the audience that reads the name first.
**Exclusivity** — whether the word already means something.

| | **Generic** — a word that exists | **Exclusive** — a word coined for this brand |
|---|---|---|
| **pt-BR** | `Carimbo`, `Régua`, `Vitrine` | `Selova`, `Medira`, `Mostrel` |
| **English** | `Forge`, `Workday`, `Aurora` | `Dell`, `Kodak`, `Vercel` |

The quadrants are not a ranking. They are a **trade-off you are choosing between**:

| | Generic | Exclusive |
|---|---|---|
| Memorability day one | **High** — the reader already knows the word | Low — has to be taught |
| Availability | **Almost always taken** | Almost always free |
| Search | Competes with the dictionary | Owns page one immediately |
| Trademark | Hard to defend; often blocked in class | Defensible |
| Tone | Warm, concrete | Neutral, can feel corporate |

A generic name buys recognition and pays in domains. An exclusive name buys the domain, the
search results and the trademark, and pays in the weeks it takes people to learn the word. The
guide's job is to make that trade-off **visible and switchable**, not to decide it.

## One candidate per quadrant

The Naming section ships **four selectable names**, one per quadrant, each with its own
availability data. More than one per quadrant dilutes the comparison; fewer hides an option.

If the product already has a name, it occupies its quadrant and the other three are new.

## How to coin an exclusive name

Not a letter salad. Four techniques that produce pronounceable, ownable words:

| Technique | How | Example from `selo` (seal) |
|-----------|-----|---------------------------|
| **Clip + vowel** | Cut a real word, end on a vowel | `selo` → **Selova** |
| **Blend** | Fuse two morphemes from the concept | `selo` + `prova` → **Selprova** |
| **Root shift** | Take a Latin or Greek root of the concept | *sigillum* → **Sigil**, **Sigila** |
| **Sound-alike** | Alter a real word by one or two letters | `carimbo` → **Carimba**, **Krimbo** |

Rules for anything you coin:

- **Two or three syllables.** Longer does not get remembered; shorter collides.
- **Say it out loud in both languages.** A coined Portuguese name will be read by English
  speakers and the reverse; check neither produces an unintended word.
- **No doubled letters that invite misspelling**, no `x`/`z` sprinkled for texture.
- **It must survive the phone test:** someone spells it to another person without correcting them.
- **Check it anyway, ladder included.** Coined does not mean free. On a batch of 60 candidates
  (2026-09-15), five names invented for this purpose came back with six or seven targets taken —
  Brevo, Tempora, Gutta, Cloza and Vigila all belong to somebody — and 13 of the 30 coined
  candidates could not offer more free rows than taken ones until `--suggest` ran for them too.

## What a rename does and does not touch

> **The mark survives a rename. The wordmark does not.**

The symbol comes from the product's **referent** — the object it draws, named in the mark brief.
That object does not change when the word does: a stamp is still a stamp whether the product is
called Carimbo or Selova. So:

| Changes with the name | Does not change |
|-----------------------|-----------------|
| The lockup pair (the wordmark is the name, set in type) | Every `logo-v*.svg` mark |
| The page title and the hero heading | The favicon |
| Availability and conflict tables | The palette, the type, the screen's layout and archetype |
| The naming verdict | The positioning thesis and the metaphor row |
| The product's name **inside the prose** — voice, example screen, CLI commands | The voice lexicon and every common-noun use of the word |

That asymmetry is why the selector is cheap to build and honest to offer: switching a name
re-renders the word and the word's consequences, and none of them is the identity.

The last row is the one that gets missed. A guide whose heading says Sigill while its terminal
screenshot still runs `carimbo pack` has not renamed anything — it has put a hat on. Every place
the prose means *the product* is a hook; every place it means *the word the name came from*
stays literal. Both appear in the same document, sometimes in the same sentence.

## What the section renders

1. The **four candidates** as selectable cards — quadrant, the name, and its headline trade-off.
2. For the selected one: the exact-name ladder, the available table, the conflict table, the verdict.
3. A line saying, in the product's language, what the current selection costs and buys.

Clicking a candidate swaps the page title, the hero heading, every lockup in the document, every
brand mention in the prose, and all three naming tables — the hook list is in
[brand-guide-shell.md](brand-guide-shell.md). The marks stay put, and the guide says so, because
a reader who expects the symbol to change is a reader who has misunderstood where identity lives.

## Quality gate

- [ ] Exactly four candidates, one per quadrant
- [ ] Each coined name passes the phone test and the two-language read
- [ ] Each candidate has its **own** availability data — no shared or assumed rows
- [ ] The trade-off table is present, and the generic ones honestly show "taken"
- [ ] Selecting a candidate swaps title, hero, **all** lockups, all three tables, and every
      brand mention in the prose — including CLI commands and the example screen
- [ ] Read the page once under a **coined** candidate: any leftover of the original name is a
      missing hook, and it is only visible by looking
- [ ] The guide states that the marks do not change with the name

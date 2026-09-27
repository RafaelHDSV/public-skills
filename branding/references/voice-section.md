# Voice and tone — the section that has to be copy-pasteable

> **What this is for:** replacing adjectives about the brand with text someone pastes into the
> product.
> **Related:** [example-screen.md](example-screen.md), [prose-density.md](prose-density.md).

## The failure this replaces

> **Failure mode:** the section shipped as a three-row table of axes — *Tone: calm, factual,
> human. Structure: yesterday / today / blockers. Length: short* — plus an on/off pair whose
> off-brand example was a straw man nobody would ever write.
> **Why this file exists:** knocking down a straw man teaches nothing about the next sentence,
> and "calm, factual, human" describes the voice of almost every B2B product. An attribute no
> brand would reject separates nothing.

**The test:** if a developer opens the section needing to write a string and leaves without
one, the section failed.

## The three blocks

### 1. Lexicon — the words of this brand

Concrete terms **from this product's domain**, not adjectives. Two columns, 4 to 6 rows.

| We say | Never |
|--------|-------|
| blocker | impediment, obstacle, issue |
| card | task, activity, item |
| board | kanban, backlog |
| publish | send, dispatch, share |

The right-hand column is the one doing the work: it decides synonyms, and synonyms are where
voice actually slips. A synonym picked on impulse is how fifteen products end up sounding alike.

### 2. The three microcopies every product writes

Written **in the brand's voice**, ready to paste. These are the three places where tone shows
under pressure, and the three that usually ship as generic library English.

| Moment | Example |
|--------|---------|
| **Empty** | No cards moved yesterday. Today's standup will be short. |
| **Error** | The board did not respond. Try again, or generate the standup without its cards. |
| **Confirmation** | Standup copied. Paste it in the channel before 10am. |

Rules those three sentences already carry, with no table of axes needed:

- **An error says what to do now.** A diagnosis with no next step is a log line, not microcopy.
- **Empty is information, not an apology.** An empty state is often good news.
- **Confirmation closes the loop** and, where it makes sense, points at the next step.

A product with states of its own — payment, sync, expiry — swaps one of the three for the state
that actually defines the brand. Three is the floor.

### 3. Same message, two versions

An on/off pair only teaches when both sides **mean the same thing**. The straw man goes; the
plausible version comes in — the sentence a good developer would write on a busy day that is
still not this brand.

> **Intent:** telling the user that syncing with the board failed.
>
> **On-brand** — The board did not respond. Try again, or generate the standup without its cards.
>
> **Off-brand** — Error syncing with the board. Check your connection and try again.

The second is not ridiculous: it is correct, polite, and interchangeable with any other
product's. That is precisely the defect, and that is what the section has to show.

## What leaves the section

- A table of abstract axes (Tone / Structure / Length)
- Adjectives no brand would reject: clear, human, direct, trustworthy
- A straw man with three exclamation marks
- A persona ("the brand is like an experienced co-pilot…") with no sentence proving it

## Quality gate

- [ ] Lexicon with the **Never** column filled with plausible synonyms, not absurd ones
- [ ] The three microcopies exist and are specific to this product's domain
- [ ] Every error shown ends with the next step
- [ ] The on/off pair carries **the same intent** on both sides
- [ ] The off-brand version is plausible — if nobody would write it, redo it
- [ ] No generic adjective is left as content
- [ ] The example screen's microcopy uses the lexicon declared here

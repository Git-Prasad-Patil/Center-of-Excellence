# The Three Amigos — QA / Dev / PO Collaboration Before Writing Scenarios

Source: [Agile Alliance glossary — Three Amigos](https://agilealliance.org/glossary/three-amigos/)

## What it is

Three Amigos is a short, structured conversation held **before** (and sometimes during/after) building a piece of work, bringing together three distinct perspectives so a story gets examined from all the angles that matter before anyone commits to an implementation. It's sometimes called a "Story Kick-Off huddle" or "the Triad" (the term was coined by George Dinwiddie in 2009).

## The three perspectives (not necessarily three job titles)

1. **Business** ("What problem are we trying to solve?") — usually the Product Owner. Owns the *why* and the intent.
2. **Development** ("How might we build a solution to solve that problem?") — owns feasibility and technical approach.
3. **Testing** ("What about this — what could possibly happen?") — owns edge cases, failure modes, and the questions that "what could go wrong" surfaces before code exists.

The point isn't literally "exactly three humans in a room forever" — it's that these three *modes of thinking* all need to be present. A team might rotate who plays "testing" for a given story, or a single person might reasonably cover two perspectives on a small team. What matters is that no story moves into implementation having only had one of these three lenses applied to it.

## Why it exists

Without it, either:
- Developers work in isolation from a written ticket, and the tester + PO only find out what was actually built during review/QA — expensive to fix at that point, and testing becomes an adversarial gate instead of a collaborative one.
- Or the *entire* team debates every story in a group ceremony, which doesn't scale and turns refinement into a bottleneck.

Three Amigos is the middle ground: enough perspectives to catch the important gaps, not so many people that the conversation stalls.

## When it happens

- **Before development** — to shape and clarify the story, often producing the first draft of acceptance-criteria examples.
- **During development** — as questions come up mid-implementation that the original conversation didn't anticipate.
- **After development** — to sanity-check the built increment against the original intent from all three lenses.

## What comes out of it

The concrete deliverable is usually **a clearer description of the work, in the form of examples** — which is exactly what feeds into writing Gherkin scenarios (see [01](./01-bdd-and-gherkin-deep-dive.md)). This is the direct link between Three Amigos and BDD: the conversation produces the examples, and Gherkin is the notation those examples get written down in. Scenarios written *without* this conversation tend to only reflect one perspective (usually whoever is at a keyboard when the `.feature` file gets typed up) and miss the edge cases a tester or the business owner would have raised.

## Pitfalls called out

- Treating "three" as a hard rule and excluding a stakeholder who's actually relevant to a specific story.
- Swinging the other way and turning it into a whole-team ceremony for every story, which defeats the purpose (fast, targeted conversation).
- Running it as a rigid, mandatory ceremony rather than a lightweight practice — the value is the conversation, not the meeting format.

## How this applies to the exercise in this repo

The 10 Gherkin scenarios in [features/ecommerce.feature](../features/ecommerce.feature) were written solo (there was no live Product Owner / dev / tester triad for a training exercise), which is exactly the situation Three Amigos exists to avoid in real project work. Writing them alone made it easy to notice, in hindsight, where a real conversation would have added value:
- A PO perspective might reject "checkout always requires creating a brand-new account" as an acceptance criterion and ask for a returning-customer login case instead — Automation Exercise has no guest checkout, so every happy-path checkout scenario currently pays the cost of a fresh signup.
- A dev perspective might flag that the "remove item empties the cart" scenario ([features/ecommerce.feature](../features/ecommerce.feature)) depends on Automation Exercise's specific empty-cart messaging, which is a coupling worth discussing before automating.
- A tester perspective is mostly what shaped the negative/edge scenarios already present (invalid coupon, missing Terms-of-Service acceptance, empty/garbage search terms) — those came from deliberately asking "what could possibly happen?" while drafting, which is the core Three Amigos "testing" lens applied by one person wearing three hats.

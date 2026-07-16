# Notes: Martin Fowler — "Exploring Generative AI" series

Source: https://martinfowler.com/articles/exploring-gen-ai.html

This isn't a single article — it's an ongoing index of memos from Birgitta Böckeler and other Thoughtworks colleagues, tracking how gen AI is actually affecting software delivery practice, going back to July 2023 and still being added to (most recent entry as of this note: July 2026).

I read the index plus the one entry most directly relevant to Day 7's theme ("when NOT to use AI in testing").

## The series as a whole — what's in there

Some entries worth knowing exist, since they map onto other days in the learning plan too:

- **TDD with GitHub Copilot** (Aug 2023) — read in full, notes below.
- **Coding assistants do not replace pair programming** (Aug 2023)
- **How to tackle unreliability of coding assistants** (Nov 2023) — this is where the "eager but unreliable donkey" persona for AI assistants comes from, used as the running mascot image for the whole series.
- **Assessing internal quality while coding with an agent** (Jan 2026)
- **Context Engineering for Coding Agents** (Feb 2026)
- **Understanding Spec-Driven Development: Kiro, spec-kit, and Tessl** (Oct 2025) — directly relevant background for what BEE is doing with its triage/spec/architecture workflow.
- **Humans and Agents in Software Engineering Loops** (Mar 2026)

## TDD with GitHub Copilot — the one I read in full

Core question the article asks: does AI coding assistance make TDD (and tests generally) obsolete? Its answer is no, for two reasons:

1. **Good feedback still has to be fast and accurate** — and nothing beats a well-written unit test for that, not manual testing, not code review, and not generative AI, because LLMs can produce irrelevant output or flatly hallucinate. The article's point: you need fast, accurate feedback on the code your AI assistant writes even more than on code a human writes.
2. **Divide-and-conquer still matters** — LLMs rarely nail the exact functionality in one shot, so iterative development isn't going away. The article notes LLMs tend to reason better when solving problems incrementally, which is exactly the shape TDD forces.

Practical tips it gives (originally for Copilot specifically, but the underlying pattern generalizes to any AI coding assistant):

- **Context has to be explicit** — Copilot only "sees" what's in an open file; starting from a blank file with no notes/acceptance criteria/mockup produces worse completions. Keeping the test file *and* implementation file open side by side improves results.
- **Descriptive test names help a lot** — Given-When-Then style names both guide the assistant's completions and reveal whether it actually understood the problem (e.g. if it completes a test as "user clicks the buy button" for a backend-only API, that's a signal your top-of-file context needs to clarify there's no GUI).
- **Watch the "assert" step specifically** — the assistant tends to infer "arrange" and "act" steps correctly, but the "assert" step less reliably. Worth extra scrutiny.
- **It doesn't take small steps in the Green phase** — instead of a minimal hard-coded value to pass one test, it tends to jump ahead and implement more than what's tested yet, which means backfilling tests afterward rather than a clean textbook TDD flow.
- **Refactoring is where it's weakest** — for known refactor moves, plain IDE refactor tools are faster; for open-ended "what should I improve" style refactors, chat-based suggestions work in small localized scope but not well at larger scale.
- **Conclusion, paraphrased**: garbage in, garbage out applies to AI-assisted coding the same way it applies to data engineering — a strong existing test suite (i.e. TDD discipline) is what lets the assistant perform well, not the other way around.

## Relevance to "when NOT to use AI in testing" (Day 7 theme)

Pulling the throughline for the reflection prompt in the plan:

- Don't let an AI assistant replace the *feedback loop itself* — a fast, accurate, deterministic test is still the fastest way to know if code (yours or the AI's) is actually correct.
- Be specifically skeptical of AI-generated **assertions** — that's the step models get least reliably right.
- If a suite is generated in one big pass rather than iteratively, treat it the way you'd treat "jumping ahead" in Green phase — likely to cover more surface area than it's actually verified, so review before trusting it.

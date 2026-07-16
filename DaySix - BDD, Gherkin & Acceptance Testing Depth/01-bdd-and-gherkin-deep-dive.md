# BDD Principles and Gherkin Syntax — Going Deeper

BDD (Behaviour-Driven Development) is often reduced to "Given-When-Then," but that's the output format, not the practice. The practice is a **shared conversation** that produces examples of behaviour before any code is written — Gherkin is just the notation those examples get written down in so both humans and a test runner can read them.

## The three layers of BDD

1. **Discovery** — a conversation (see [Three Amigos](./02-three-amigos.md)) between business, dev, and test perspectives to explore a feature and surface edge cases *before* estimating or building it.
2. **Formulation** — turning the concrete examples from that conversation into structured Given-When-Then scenarios (Gherkin). This is where ambiguity gets forced out: if a scenario can't be written concretely, the requirement wasn't understood yet.
3. **Automation** — wiring the Gherkin steps to real code (step definitions) so the specification is executable and becomes a regression suite. See [living documentation](./08-living-documentation.md).

Most teams that "do BDD" only do layer 3 — write Gherkin after the fact to wrap an existing test in a nicer syntax. That skips the actual value (shared understanding up front) and just adds a translation layer over what would have been a plain test script.

## Given-When-Then, precisely

- **Given** — puts the system into a known starting state. Not "the user does something," but a *fact* about the world before the interesting part happens. Should read as scene-setting, not action.
- **When** — the single action or event under test. A scenario should generally have exactly one `When` — if there are several, the scenario is probably testing a multi-step business process that deserves either splitting into separate scenarios or being described as one coarser business action (e.g. "When the order is placed" instead of "click X, fill Y, submit Z").
- **Then** — an observable outcome, asserted from the perspective of the persona in the scenario, not from the system's internals. "The customer sees an order confirmation," not "the `orders` table has a new row."
- **And / But** — continuation of the previous step's keyword, purely for readability. Step-matching in Cucumber ignores which keyword was used (Given/When/Then/And/But all resolve to the same set of step definitions), so `And`/`But` exist for humans only, not the runner. See [Gherkin syntax reference](./04-gherkin-syntax-reference.md).

## Why Gherkin's structure matters more than its keywords

The value of Given-When-Then isn't the specific words — it's that it **forces every scenario into "context → action → outcome"**, which is the same shape as a unit test's arrange-act-assert. That shape is what makes a scenario a *testable example* rather than a prose description. A well-formed scenario should be understandable by a non-technical stakeholder and automatable by a developer without either side needing to change the wording.

## Common misreadings worth correcting

- Gherkin is not a test scripting language for driving a UI — see [anti-patterns](./03-effective-gherkin-vs-anti-patterns.md) for what happens when it's treated as one.
- BDD is not "Cucumber." Cucumber (and its Playwright/TypeScript wiring, see [03](./03-cucumber-playwright-typescript-integration.md) in the exercise notes) is one automation tool for layer 3. The discovery conversation in layer 1 is the actual BDD practice and happens with or without any tooling.
- A `Scenario Outline` is not "a loop for cheaper test writing" — each row is meant to be a genuinely distinct example of the same rule, not an excuse to cram unrelated cases into one template (see the anti-patterns note on Scenario Outline misuse).

## Applied in this repo's exercise

The Gherkin work for this assignment lives in [features/ecommerce.feature](../features/ecommerce.feature), targeting [Automation Exercise](https://automationexercise.com/), a public practice store built specifically for this kind of test-automation exercise. Each scenario there was written to satisfy the "context → action → outcome" shape described above, and to stay declarative (see [03](./03-effective-gherkin-vs-anti-patterns.md)) rather than narrating clicks.

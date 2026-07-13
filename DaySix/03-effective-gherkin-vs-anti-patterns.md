# Effective Gherkin vs. Anti-Patterns

Source: [cucumber.io — Writing Better Gherkin](https://cucumber.io/docs/bdd/better-gherkin/), plus general anti-patterns commonly documented across the Cucumber ecosystem.

## The one question that separates good from bad Gherkin

> "Will this wording need to change if the implementation changes?"

If the answer is yes, the scenario is describing **how** the system works instead of **what** it does — and it will break (or need editing) every time something unrelated to the behaviour changes, like a redesign of the login form.

## Anti-pattern 1: Over-specification / UI coupling (imperative style)

**Bad (imperative — narrates every click):**
```gherkin
Given I am on the homepage
When I click the "Login" link
And I enter "bob@example.com" into the "email" field
And I enter "Password1" into the "password" field
And I click the "Sign in" button
Then I should see the text "Welcome, Bob"
```

**Good (declarative — states intent):**
```gherkin
Given "Bob" is a registered customer
When "Bob" logs in
Then he sees a personalized welcome message
```

The declarative version hides *how* login happens inside the step definition. If the login form changes from an inline form to a redirect-based SSO flow, only the step definition needs to change — not the scenario, and not every other scenario that also happens to log someone in.

**Why this matters practically:** UI-coupled scenarios are why "our Cucumber suite is more maintenance burden than value" is a common complaint. The scenario file becomes a second copy of the UI's implementation details, so every UI change requires editing dozens of `.feature` files instead of one step definition.

## Anti-pattern 2: Scenario Outline misuse

`Scenario Outline` exists to run the **same rule** against multiple genuinely distinct examples (e.g. different discount tiers). It is not a bulk-testing mechanism for unrelated cases — if the `Examples` rows don't all illustrate the same underlying business rule, they belong in separate scenarios with names that say what each one demonstrates.

## Anti-pattern 3: Scenarios that test multiple behaviours at once

A scenario with several `When` steps is usually testing a business *process*, not a single behaviour, and should either:
- become one `When` phrased as the coarser business action ("When the customer completes checkout"), or
- be split into multiple scenarios, each with a single `When`.

Long scenarios are also harder to keep as [living documentation](./08-living-documentation.md) — nobody reads a 40-line scenario as a specification; they read it as a script.

## Anti-pattern 4: Testing through the UI when the behaviour isn't a UI behaviour

If the rule under test is "a discount code shouldn't apply after its expiry date," that's a domain/business-logic rule, not a UI rule. Driving it exclusively through browser clicks makes the test slow and brittle for no reason — it doesn't need a browser at all. Gherkin scenarios should be automated at the layer where the behaviour actually lives; reserve full end-to-end/UI-driven Cucumber+Playwright scenarios (see [Cucumber + Playwright integration](./04-cucumber-playwright-typescript-integration.md)) for behaviours that genuinely span the UI, like "does the cart badge visually update after adding an item."

## Anti-pattern 5: Vague or non-committal outcomes

`Then something should happen` or `Then it should work` isn't a testable assertion — a `Then` step must assert something specific and observable. If the scenario can't state a concrete expected outcome, the story isn't understood well enough yet to write ([Three Amigos](./02-three-amigos.md) territory).

## What "good" looks like, summarized

| Good Gherkin | Anti-pattern |
|---|---|
| Declarative: "the customer checks out" | Imperative: "clicks the checkout button, fills form field X..." |
| One clear behaviour per scenario | Multiple behaviours chained in one scenario |
| Business language, personas | CSS selectors, field IDs, UI mechanics |
| Concrete, assertable outcomes | Vague "it should work" outcomes |
| `Scenario Outline` rows all test the same rule | `Scenario Outline` used as a generic data dump |

## Applied in this repo's exercise

[features/ecommerce.feature](../features/ecommerce.feature) was deliberately written in declarative style — e.g. `When I add "Blue Top" to the cart` rather than "hover the product tile and click its Add to Cart overlay button." The one exception worth naming honestly: because this is a real third-party demo site rather than a fictional domain, some scenarios reference concrete UI-adjacent facts (a specific product name) that a maximally pure declarative style would hide behind a fixture ("a product that exists in the catalog"). That's a reasonable trade-off for a training exercise against a live, unowned site, but in a real project those specifics would live in test data setup, not the scenario text.

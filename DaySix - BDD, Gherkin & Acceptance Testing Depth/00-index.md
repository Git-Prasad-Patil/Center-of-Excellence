# BDD Gherkin & Acceptance Testing Depth — Study Notes

Notes for the "BDD Gherkin & Acceptance Testing Depth" assignment. The actual exercises (10 Gherkin scenarios + TypeScript step definitions using Cucumber and Playwright, targeting [automationexercise.com](https://automationexercise.com/)) live in [features/](../features), not in this folder — this folder is the study notes plus a summary of what was built and how to run it.

1. **[BDD Principles and Gherkin Syntax — Going Deeper](./01-bdd-and-gherkin-deep-dive.md)**
   Given-When-Then as a structural forcing function, the three layers of BDD (discovery, formulation, automation), and common misreadings of what Gherkin/Cucumber actually are.

2. **[The Three Amigos](./02-three-amigos.md)**
   Notes from the Agile Alliance glossary: the business/dev/testing perspectives, why the practice exists, when it happens, and how it directly feeds into writing better Gherkin scenarios.

3. **[Effective Gherkin vs. Anti-Patterns](./03-effective-gherkin-vs-anti-patterns.md)**
   Notes from cucumber.io's "Writing Better Gherkin": declarative vs. imperative style, over-specification/UI coupling, `Scenario Outline` misuse, and other anti-patterns to avoid.

4. **[Gherkin Syntax Reference](./04-gherkin-syntax-reference.md)**
   Full keyword reference (Feature, Rule, Scenario, Background, Scenario Outline/Examples, Given/When/Then/And/But), step matching rules, data tables, doc strings, tags, and language support.

5. **[Cucumber Data Tables](./05-cucumber-datatables.md)**
   Notes from `cucumber-jvm`'s datatable module, translated to how `@cucumber/cucumber` handles the same conversions (`hashes()`, `raw()`, `rowsHash()`) in this repo's TypeScript step definitions.

6. **[Cucumber + Playwright Integration in TypeScript](./06-cucumber-playwright-typescript-integration.md)**
   How Cucumber's runner/hooks/World were wired to Playwright's browser automation and assertions in this repo — and why that's a different integration model than using Playwright's own test runner.

7. **[Step Definition Best Practices](./07-step-definition-best-practices.md)**
   Parameterizing with Cucumber Expressions, reusing one implementation across `Given`/`When` phrasing, keeping steps thin via page objects, and using the `World` (not module-level variables) for per-scenario state.

8. **[Living Documentation](./08-living-documentation.md)**
   Why a `.feature` file that's actually executed can't silently go stale the way a requirements doc can — and why that only holds if the scenarios stay declarative and cover more than the happy path.

9. **[Exercise Implementation Summary](./09-exercise-implementation-summary.md)**
   What was actually built (10 scenarios, step definitions, hooks, page objects), how to run it (`npm run test:bdd`), and three real bugs found and fixed while getting the suite to a fully green run against the live site.

## Source pages referenced

- [Three Amigos — Agile Alliance glossary](https://agilealliance.org/glossary/three-amigos/)
- [Writing Better Gherkin — cucumber.io](https://cucumber.io/docs/bdd/better-gherkin/)
- [Gherkin Reference — cucumber.io](https://cucumber.io/docs/gherkin/reference/)
- [cucumber/cucumber-jvm — datatable module](https://github.com/cucumber/cucumber-jvm/tree/main/datatable)

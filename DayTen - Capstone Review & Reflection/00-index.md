# Day Ten — Capstone Review & Reflection

Closing exercise for the 10-day learning journey: a self-review of everything written across Days 3-9 against my own Day 2 clean code checklist, a practical simplification of the most complex test in the suite, a written test strategy, study notes on the Test Pyramid vs. Testing Trophy with a reasoned decision for this project, mutation testing concepts and a real Stryker run, and a full reflection on the ten days.

## Notes and exercises (read in order)

1. [Self code review — clean code checklist (Days 3-9)](./01-self-code-review-clean-code-checklist.md)
2. [Practice — simplifying the most complex test (`tests/login.spec.ts`)](./02-test-simplification-login-spec.md)
3. [Test strategy document — hypothetical checkout promo code feature](./03-test-strategy-document.md)
4. [Study notes — The Practical Test Pyramid (Martin Fowler)](./04-test-pyramid-notes.md)
5. [Study notes — The Testing Trophy (Kent C. Dodds)](./05-testing-trophy-notes.md)
6. [Study — Pyramid or Trophy? Deciding the shape for this project](./06-pyramid-vs-trophy-decision.md)
7. [Study notes — Mutation Testing & Stryker Mutator](./07-mutation-testing-and-stryker-notes.md)
8. [Exercise — running Stryker and identifying surviving mutants](./08-stryker-mutation-run-results.md)
9. [Reflection — 10-day learning journey](./09-ten-day-reflection.md)

## What changed in the codebase this day

- `tests/login.spec.ts` refactored (218 → 169 lines): extracted `attemptLogin`/`expectLoginSuccess`/`expectLoginError` helpers, regrouped all 16 tests into ZOMBIES-ordered `describe` blocks, replaced a silent empty catch with `Promise.allSettled`. All 16 tests still pass against the live site.
- Added a real unit-test layer that didn't exist before: `vitest.config.ts`, `unit/money.test.ts`, `unit/test-data-factory.test.ts` (17 tests), plus `npm run test:unit`.
- Added mutation testing: `stryker.conf.json` (scoped to `features/support/money.ts` and `utils/test-data-factory.ts`), plus `npm run test:mutation`. First run: 96% mutation score with one surviving mutant; closed with one targeted test to reach 100%.
- `.gitignore` updated for Stryker's `reports/` and `.stryker-tmp/` output.

## Sources used across these notes

- https://martinfowler.com/articles/practical-test-pyramid.html
- https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- https://stryker-mutator.io/
- https://stryker-mutator.io/docs/
- https://stryker-mutator.io/docs/stryker-js/guides/nodejs/

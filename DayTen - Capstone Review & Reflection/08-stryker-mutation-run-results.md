# Exercise — Running Stryker and Identifying Surviving Mutants

## What was set up

This repo had **zero unit tests and no unit-test runner** before this exercise — everything was Playwright E2E or Cucumber/BDD (see the [pyramid vs. trophy decision](./06-pyramid-vs-trophy-decision.md), which flagged this as the actual coverage gap). To run mutation testing at all, a real unit layer had to exist first:

- Added **Vitest** as the unit-test runner (`vitest.config.ts`, scoped to `unit/**/*.test.ts` only, so it never collides with Playwright's `tests/*.spec.ts`).
- Added **`@stryker-mutator/core`** + **`@stryker-mutator/vitest-runner`** as dev dependencies.
- Wrote unit tests (ZOMBIES-driven) for the two pure, framework-owned modules identified as untested in the decision doc:
  - `unit/money.test.ts` → tests `features/support/money.ts`'s `parsePrice`
  - `unit/test-data-factory.test.ts` → tests `utils/test-data-factory.ts`'s `createUser` and `RegistrationDataBuilder`
- `stryker.conf.json` scopes mutation to exactly those two files (`mutate: ["features/support/money.ts", "utils/test-data-factory.ts"]`) — a deliberately small slice, per the exercise's own instruction, not the whole codebase.
- New scripts: `npm run test:unit` (Vitest) and `npm run test:mutation` (Stryker).

## First run — 96%, one surviving mutant

```
npx stryker run
```

```
All files              |  96.00 |   96.00 |       24 |         0 |          1 |        0 |        0 |
 features/support/money.ts  |  90.91 |  90.91  |       10 |         0 |          1 |        0 |        0
 utils/test-data-factory.ts | 100.00 | 100.00  |       14 |         0 |          0 |        0 |        0
```

**The survivor:**

```
[Survived] Regex
features/support/money.ts:4:28
-     const match = text.match(/([\d,]+(?:\.\d+)?)\s*$/);
+     const match = text.match(/([\d,]+(?:\.\d+)?)\s*/);
```

Stryker deleted the trailing `$` anchor from the price regex. Every existing test still passed against the mutant — meaning **not one of the 8 `parsePrice` tests actually depends on the digits being anchored to the end of the string.**

### Why this is exactly the "coverage lies" lesson from the study notes

Line coverage on `money.ts:4` was already 100% before this exercise even started — every test executes that line. But none of the test *inputs* contained trailing non-numeric text after the number (e.g. `"500 approx"`), so nothing ever exercised the specific job the `$` anchor does: reject a string where digits aren't the last thing present. The mutant is a real, if narrow, latent behavior difference — without the anchor, a price string like `"500 units remaining"` would silently parse as `500` instead of correctly being rejected as unparseable. Coverage said "tested." Mutation testing said "not verified."

## Closing the gap

Added one more test, targeting exactly that case:

```ts
it('returns NaN when a number is followed by trailing non-numeric text (Exception case)', () => {
  expect(parsePrice('500 approx')).toBeNaN();
});
```

Re-ran both suites:

```
npx vitest run     →  17/17 passed (was 16)
npx stryker run    →  100.00% mutation score, 25 killed / 0 survived / 0 no coverage
```

```
-----------------------|------------------|----------|-----------|------------|----------|----------|
                       | % Mutation score |          |           |            |          |          |
File                   |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------------------|--------|---------|----------|-----------|------------|----------|----------|
All files              | 100.00 |  100.00 |       25 |         0 |          0 |        0 |        0 |
 features/support/money.ts  | 100.00 | 100.00 |       11 |        0 |          0 |        0 |        0
 utils/test-data-factory.ts | 100.00 | 100.00 |       14 |        0 |          0 |        0 |        0
```

## What this exercise actually demonstrated

- **Coverage ≠ verification.** `money.ts` was 100% line-covered from the very first test written, but had a real, findable gap the whole time — mutation testing found it in seconds; line coverage never would have.
- **`test-data-factory.ts` hit 100% (14/14 killed) on the first run**, with no surviving mutants — a genuine (if small) signal that the ZOMBIES cases written for `createUser`/`RegistrationDataBuilder` were reasonably thorough for the amount of logic involved (mostly object assembly, fewer conditional branches for a mutant to hide in than `money.ts`'s regex).
- **The fix was cheap and targeted** — one new test, informed directly by the mutant's diff, not a guess. That's the practical workflow the [Stryker study notes](./07-mutation-testing-and-stryker-notes.md) describe: run it, read the report, write the one test the survivor points at, re-run.
- **Scope matters.** This was deliberately run against 2 small pure-logic files, not the E2E suite — running Stryker against Playwright specs would mean re-running a full browser suite once per mutant, which the study notes flag as impractically slow. Mutation testing earns its keep on the pure-logic layer this repo just added, not the E2E layer that makes up most of it.

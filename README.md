# Center of Excellence — Testing & Automation Training

A TypeScript-based collection of testing best-practices, exercises and sample automation using Playwright and Cucumber BDD. Intended as training material and working examples for QA engineers and developers.

## What you'll find here
- DayOne ... DayTen — Markdown lessons and exercises covering clean code, TDD, error handling, test resilience, BDD, AI-assisted testing, CI/CD, POM architecture, and mutation testing.
- Playwright Test examples (tests/ + playwright.config.ts)
- Cucumber BDD features (features/) with TypeScript step definitions
- Vitest unit tests (unit/) for framework/utility logic, with Stryker mutation testing (stryker.conf.json)
- Utility helpers in utils/

## Stack
- Node.js + TypeScript
- Playwright Test (@playwright/test)
- Cucumber.js (@cucumber/cucumber) for BDD
- Vitest for unit tests, Stryker Mutator for mutation testing
- ts-node for running TypeScript step-definitions
- winston for logging examples

## Requirements
- Node.js (recommended v18+)
- npm

## Quick start
1. Install dependencies
   ```bash
   npm install
   ```

2. Install Playwright browsers
   ```bash
   npx playwright install
   ```

3. Run Playwright tests (headless)
   ```bash
   npm run test
   ```

4. Run Playwright tests (headed)
   ```bash
   npm run test:headed
   ```

5. Run Cucumber BDD (feature tests)
   ```bash
   npm run test:bdd
   ```
   Cucumber uses `ts-node/register` to run TypeScript step-definitions and will output an HTML report (cucumber-report.html).

6. Lint the repository
   ```bash
   npm run lint
   ```

7. Run unit tests (Vitest)
   ```bash
   npm run test:unit
   ```

8. Run mutation testing (Stryker)
   ```bash
   npm run test:mutation
   ```
   Scoped to `features/support/money.ts` and `utils/test-data-factory.ts`; report written to `reports/mutation/mutation.html`.

## Project layout
- features/ — Gherkin `.feature` files and TypeScript step-definitions/support
- tests/ — Playwright Test files and fixtures
- unit/ — Vitest unit tests for pure framework/utility logic
- DayOne..DayTen/ — training notes and exercises (Markdown)
- utils/ — helper utilities and shared code
- playwright.config.ts — Playwright test configuration
- cucumber.js — Cucumber configuration for feature discovery and formatters

## Contributing
- Add new exercises as Day{N}/ files.
- Add Playwright tests under `tests/` using the existing Playwright config.
- Add feature files under `features/` and corresponding step-definitions in TypeScript.

## Reporting issues
Open issues at: https://github.com/Git-Prasad-Patil/Center-of-Excellence/issues

## License
Add a LICENSE file or update this README with the chosen license.

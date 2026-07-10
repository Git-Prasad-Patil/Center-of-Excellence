# Resilient Test Design & Error Handling in Automation — Study Notes

Notes summarized from the reference pages you shared, written up topic-by-topic for easier studying. Each file below is short and stands on its own.

1. **[Brittle vs Resilient Tests & Flaky Test Root Causes](./01-brittle-vs-resilient-and-flaky-tests.md)**
   Playwright's testing philosophy + Spotify Engineering's research on why tests flake and how they track it.

2. **[TypeScript Error Handling Patterns in Playwright](./02-typescript-error-handling-patterns.md)**
   Listening for `console`, `pageerror`, and network failures; wrapping it into a reusable fixture.

3. **[Exercise: Global Error Handler in Playwright Config](./03-exercise-global-error-handler.md)**
   Step-by-step for building and testing a shared error-capturing fixture.

4. **[Retry Mechanisms in Playwright](./04-retry-mechanisms.md)**
   Test-level retries, how "flaky" gets classified, serial mode, and step-level (assertion) retrying.

5. **[Exercise: Configuring & Testing Retry Logic](./05-exercise-retry-logic.md)**
   Building an intentionally unreliable test to prove retry config actually works.

6. **[Soft Assertions vs Hard Assertions](./06-soft-vs-hard-assertions.md)**
   When each one is the right call, plus bailing out early and custom messages.

7. **[Test Isolation](./07-test-isolation.md)**
   Why tests shouldn't depend on each other, plus a before/after refactor example.

8. **[Screenshot & Video Capture on Failure](./08-screenshots-videos-on-failure.md)**
   Config options for screenshots, video, and traces — and a sensible CI default.

9. **[Exercise Implementation Summary](./09-exercise-implementation-summary.md)**
   What was actually built for these exercises (fixture, retry spec, isolation refactor), where it lives, and what running it proved.

## Source pages referenced
- [Best Practices — Playwright](https://playwright.dev/docs/best-practices)
- [Test Flakiness — Spotify Engineering](https://engineering.atspotify.com/2019/11/test-flakiness-methods-for-identifying-and-dealing-with-flaky-tests)
- [Assertions (Soft Assertions) — Playwright](https://playwright.dev/docs/test-assertions#soft-assertions)
- [Retries — Playwright](https://playwright.dev/docs/test-retries)
- [Configuration — Playwright](https://playwright.dev/docs/test-configuration)
- A few additional community articles (Medium, Checkly, TestDino, etc.) were used to fill in the error-handling and screenshot/video patterns, since Playwright's docs cover those more thinly across multiple pages.

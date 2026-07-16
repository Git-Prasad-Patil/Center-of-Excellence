# Brittle vs Resilient Tests, and Why Tests Get Flaky

## The core idea
A **brittle test** breaks the moment something small and unrelated changes — a CSS class gets renamed, the page takes 50ms longer to load, a test that ran before it left some data behind. A **resilient test** keeps passing (or fails for the *right* reason) even when those unimportant things shift around it.

The Playwright docs frame this as a philosophy: test what the **user actually sees and does**, not implementation details like function names, internal state, or DOM structure the user never touches. If your test only interacts with the page the way a real person would, it naturally becomes more resilient — because the "user-visible contract" changes far less often than the underlying code.

## What makes a test brittle
- Selecting elements by CSS classes or XPath that designers/devs change often
- Depending on exact timing ("it usually loads by now")
- One test relying on state left behind by a previous test
- Testing third-party pages/content you don't control
- Testing against a database/environment that isn't stable

## What makes a test resilient
- Using **locators tied to user-facing attributes** (role, text, label) instead of CSS/XPath
- Waiting for real conditions (auto-retrying assertions) instead of fixed sleeps
- Each test sets up and tears down its own state — no test depends on another
- Mocking third-party/network calls instead of hitting the real thing
- Running the same tests across browsers to catch cross-browser issues early

## Root causes of flaky tests (Spotify Engineering's take)
Spotify's engineering team called out three big causes of flakiness in their talk:

1. **Inconsistent assertion timing** — the app's state isn't the same on every run, so `expect`/`assert` calls sometimes catch it "mid-way" and fail randomly. Fix: don't add blind waits — poll/retry until the app reaches a known-good state, *then* assert.
2. **Reliance on test order / global state** — if a test only passes when the whole suite runs (never on its own), it's secretly depending on state some other test created. Fix: reset state between every test; avoid shared global state.
3. **End-to-end tests, by nature** — E2E tests touch the most moving parts (network, UI, timing), so they're inherently more flaky than unit tests. Their advice: write *fewer* of them — a handful of critical, high-value E2E flows beats hundreds of overlapping ones.

## Why flakiness matters (not just an annoyance)
Flaky tests cost more than re-run time — they quietly destroy trust in the test suite. Once people stop believing a red test means something's actually broken, the suite becomes as useful as having no tests at all, and it kills confidence in shipping continuously.

## How Spotify tracks flakiness (good ideas to borrow)
- **A visual "heatmap" of test runs over time** — scattered failures across a test in random builds = flakiness; a solid block of failures = infrastructure/environment problems, not the test's fault.
- **A simple dashboard table** showing which tests are fast/slow/flaky. Spotify says just *making this visible* — without any extra process — cut flakiness org-wide from 6% to 4% in two months.
- **A "flaky test checker" bot** engineers can trigger on a pull request to run a test repeatedly before merging, to catch flakiness before it reaches everyone else.

## Takeaway
Resilience isn't one trick — it's a mix of good locators, proper waiting, and true test isolation. Flakiness is a signal, not noise: track it, don't just re-run past it.

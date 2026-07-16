# Screenshot and Video Capture on Failure

## Why bother
When a test fails in CI, a stack trace alone often isn't enough — you can't see what the page actually looked like. Screenshots, videos, and traces turn a guessing game ("why did this fail on CI but not locally?") into something you can actually look at.

## Screenshots
Off by default. Turn on "only capture when something fails" in the config:

```ts
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
  },
});
```
Options are typically `'off'`, `'on'`, or `'only-on-failure'`. Screenshots land in the test output directory (`test-results` by default) and get attached automatically to the HTML report.

You can also take one manually mid-test if needed:
```ts
await page.screenshot({ path: 'screenshot-login.png', fullPage: true });
```

## Video
Also off by default, controlled by the `video` option:

```ts
export default defineConfig({
  use: {
    video: 'on-first-retry', // record only when a test is being retried after failing
  },
});
```
Other common values: `'retain-on-failure'` (records every run, keeps only the failed ones), `'retain-on-first-failure'` (records only the first attempt, keeps it if that attempt failed). Videos also land in `test-results`.

## Traces — the more powerful option
Playwright's recommendation for **CI debugging specifically** is to use the **trace viewer** rather than relying only on screenshots/videos, because a trace captures a full timeline: DOM snapshots at each step, network requests, console logs, and the action log — all replayable like a mini time machine.

```ts
export default defineConfig({
  use: {
    trace: 'on-first-retry', // don't run this on every single test — it's heavier
  },
});
```
Traces show up as `.zip` files, viewable via:
```bash
npx playwright show-report
```
Or run one manually while developing locally:
```bash
npx playwright test --trace on
```

## A sensible combined config for CI
```ts
use: {
  screenshot: 'only-on-failure',
  video: 'on-first-retry',
  trace: 'on-first-retry',
},
```
This keeps CI fast and storage-light day-to-day, while still capturing rich evidence exactly when something actually breaks.

## Practical tips
- Don't turn trace/video "on" for every test by default — it's noticeably heavier and clutters CI storage.
- Attach extra debug info alongside failures using `testInfo.attach(...)` in an `afterEach` (e.g. page HTML, visible text, current URL) if screenshots alone aren't enough context.
- Clean up or limit stored artifacts over time — video/trace files can add up quickly across a large suite.

## Takeaway
For day-to-day debugging: `screenshot: 'only-on-failure'` + `trace: 'on-first-retry'` gives you almost everything you need without slowing the suite down, and traces are the single best tool for "why did this fail on CI" mysteries.

# Playwright: Reporters — Notes

**Source:** playwright.dev/docs/test-reporters _(Note: the live doc page cut off after the List reporter section — I filled in the remaining built-in reporters, e.g. Dot/Line/HTML/JSON/JUnit/GitHub/Blob, from Playwright's own reference material found via search, so those specific descriptions aren't pulled from this exact page.)_

---

## The basic idea

A reporter is just what turns raw test results into something readable — for a human in a terminal, a browser-viewable HTML report, or a machine-readable file a CI system can ingest. You can set it via CLI flag:

```bash
npx playwright test --reporter=line
```

...or in config, for more control:

```js
export default defineConfig({
  reporter: 'line',
});
```

## You can (and often should) use multiple reporters at once

This is a nice detail — you're not limited to one. A common pattern is combining a human-friendly console reporter with a machine-friendly file output:

```js
export default defineConfig({
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],
});
```

## Different reporters for local vs. CI

Since local dev and CI have different needs (verbose vs. concise), you can branch on the `CI` env var:

```js
export default defineConfig({
  reporter: process.env.CI ? 'dot' : 'list',
});
```

`dot` is actually the **default reporter on CI already** — Playwright assumes you don't want a wall of text in your CI logs.

## The built-in reporters

- **List** (default locally) — prints one line per test as it runs, with pass/fail status. Failures get listed again at the end. You can opt into showing test _steps_ inline (`printSteps: true`) or print failures immediately as they happen rather than waiting for the run to finish (`printFailuresInline: true`).
    
- **Dot** (default on CI) — extremely compact: just one character per test (e.g. a dot for pass, an `F` for fail). Great for keeping CI logs short, especially with lots of parallel tests, though you lose per-test detail in the stream itself (failures still get detailed at the end).
    
- **Line** — a middle ground between List and Dot: more concise than List, showing just the most recently finished test on a single line, while still printing failures as they occur.
    
- **HTML** — generates a self-contained folder you can serve as a webpage, with full interactive detail (traces, screenshots, etc.). Opens automatically in a browser if any test failed — which is exactly the thing you want to disable in CI (`open: 'never'`), since a CI runner has no browser to pop open.
    
- **JSON** — dumps the entire run's results as structured JSON, useful if you want to feed the data into your own dashboard or tooling rather than just eyeballing it.
    
- **JUnit** — outputs a JUnit-style XML file. This is the "industry standard" format lots of CI systems and dashboards (Jenkins, Azure DevOps, etc.) know how to natively parse and display.
    
- **GitHub** — built specifically for GitHub Actions: annotates failures directly inline in the GitHub UI (as `::error` workflow commands). Note: not recommended if you're running a matrix strategy, since duplicate stack traces across matrix jobs can clutter the GitHub file view.
    
- **Blob** — a binary-ish format specifically meant for merging results from sharded/parallel runs across multiple machines (covered in more depth in the Sharding doc). Not really meant to be read directly — it's an intermediate format you merge later into an HTML/JSON/etc. report.
    

## Environment variables

Most reporters also expose environment-variable equivalents for their config options (e.g. `PLAYWRIGHT_JSON_OUTPUT_NAME`, `PLAYWRIGHT_HTML_OPEN`), which is handy when you don't want to hardcode reporter options directly in the config file and prefer to control them per CI job instead.

---

### Takeaway

The practical pattern that keeps showing up across guides: **one reporter for humans, one for machines.** Locally, that's usually List or HTML for debugging. On CI, that's Dot (or GitHub, if you're on Actions) for compact logs, plus JUnit or JSON as the structured artifact your CI system or dashboard actually consumes — and Blob if you're sharding and need to merge everything back into one report afterward.
# Study Notes — Mutation Testing & Stryker Mutator

**Sources:**
- https://stryker-mutator.io/ (Stryker Mutator homepage)
- https://stryker-mutator.io/docs/ (Stryker docs landing — general concepts)
- https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/ (mutant states reference, linked from the docs landing page)
- https://stryker-mutator.io/docs/stryker-js/guides/nodejs/ (StrykerJS Node.js guide)
- https://stryker-mutator.io/docs/stryker-js/configuration/ (StrykerJS configuration reference)

---

## Part 1 — Mutation Testing Concepts

### What mutation testing actually does

Stryker's own framing: it "tests your tests." The mechanism, concretely:

1. Stryker parses your production code and generates **mutants** — small, automated, deliberate changes to the code (e.g. flipping `>` to `>=`, changing `&&` to `||`, negating a boolean condition, replacing a return value, deleting a line). Stryker's JS engine alone supports 30+ mutation operators.
2. For each mutant, Stryker re-runs your existing test suite **against the mutated code**, one mutant at a time (with parallelism to keep this fast).
3. **The expectation is that a good test suite fails** when the code has been subtly broken. If a test goes red, the mutant is "killed" — your tests did their job. If every test still passes despite the injected bug, the mutant "survived" — meaning nothing in your suite would have caught that bug in production either.

The insight worth sitting with: a survived mutant is a proxy for a real, undetected class of bug. If flipping a `<` to `<=` doesn't break any test, that boundary condition simply isn't being verified — a real off-by-one bug in that spot would ship unnoticed.

### Mutation score — what it is and how it's calculated

The **mutation score** is the percentage of mutants your tests killed. Per Stryker's docs:

> "The higher the percentage of mutants killed, the more effective your tests are."

Formally (from the mutant-states-and-metrics reference):

- **Detected** = killed + timeout
- **Undetected** = survived + no coverage
- **Valid mutants** = detected + undetected (mutants that could actually be compiled and run)
- **Invalid mutants** = runtime errors + compile errors (excluded from scoring — they're not meaningful mutants)
- **Mutation score = detected / valid × 100**

This is a test-quality score, not a coverage score — it answers "of the bugs we could have injected, how many would our tests have caught?" rather than "how much code did we execute?"

### The key insight: coverage tells you code ran, not that it was tested well

This is the central pitch of the whole tool. Line/branch coverage answers "did execution pass through this code?" It says nothing about whether the test that touched that line actually **asserted** anything meaningful about the result. Stryker's docs use a sandwich analogy: code coverage tells you the bread is there, but not whether there's any filling — i.e., not *what kind* of paste is between the slices, just that something is present.

Concretely, a test like this gets 100% line coverage on the function but is worthless as a check:

```ts
function isEligible(age: number) {
  return age >= 18;
}

test("isEligible runs without throwing", () => {
  isEligible(20); // executes the line, asserts nothing about the outcome
});
```

Mutation testing exposes this immediately: flip `>=` to `>`, or `18` to `0`, or the whole return to `true` — the test above still passes for every one of those mutants, because it never checks the return value. A coverage report would call this line "covered." Stryker calls the mutants on it "survived," which is the more honest signal. This is the practical gap mutation testing closes: **coverage measures reach, mutation testing measures verification.**

### Mutant status categories

From the mutant-states-and-metrics docs, each mutant lands in exactly one state after a run:

| State | Meaning | Practical read |
|---|---|---|
| **Pending** | Mutant generated but not yet run — a transient in-progress state. | Not a final result; ignore in reports, it resolves during the run. |
| **Killed** | At least one test failed while this mutant was active. | The good outcome — your tests caught the injected bug. |
| **Survived** | All tests passed while the mutant was active. | A real gap: nothing in your suite would notice this class of bug. Investigate and add/strengthen a test. |
| **No Coverage** | No test even executed the mutated line, so it survived by default. | Worse than "survived" — this is a pure blind spot, not even a weak assertion. Usually the first thing to fix. |
| **Timeout** | Running the tests with this mutant active caused a timeout (e.g. the mutation created an infinite loop). | Counted as **detected** — the reasoning is that a CI build would time out and someone would notice, so it still signals "this would get caught." |
| **Runtime Error** | The test run errored out (as opposed to a clean test failure) while the mutant was active. | Excluded from the mutation score entirely — it's not a meaningful signal either way. |
| **Compile Error** | The mutant produced code that doesn't compile/build. | Also excluded from the score — an invalid mutant, common in typed/compiled languages like TypeScript. |
| **Ignored** | The mutant was deliberately excluded — by config, an inline comment, or Stryker's own heuristics. | Doesn't count against the mutation score, but still shows up in the report for visibility. |

Practical priority order when triaging a report: fix **No Coverage** mutants first (true blind spots — write a test that even reaches the code), then **Survived** mutants (a test reaches it but doesn't assert the right thing — strengthen the assertion), and treat **Timeout** as already "safe enough" unless the reported timeout count is suspiciously high (may indicate flaky mutants rather than genuinely infinite loops).

---

## Part 2 — Stryker for TypeScript / Node (StrykerJS)

### What StrykerJS is and how it fits a Playwright/TypeScript project

StrykerJS is the JavaScript/TypeScript flavor of Stryker. It's explicitly **test-runner agnostic** — it doesn't run your tests itself, it delegates to a test runner plugin (Jest, Mocha, Jasmine, Karma) or a generic `command` runner that just shells out and checks the exit code. For a Playwright/TypeScript suite, this typically means either:

- Using the `command` test runner to invoke `npx playwright test` (or your npm test script) per mutant, relying on the process exit code to decide killed vs. survived, or
- Using a dedicated runner plugin if your unit/component tests run under Jest/Mocha rather than Playwright itself (mutation testing suits fast, deterministic unit-style tests far better than full end-to-end browser runs — running a whole Playwright browser suite once per mutant is slow, since Stryker needs to execute the suite many times, once per mutant).

Because Stryker mutates the *compiled logic paths* under test, it's most valuable applied to the pieces of a Playwright framework that carry real logic — page object helper methods, data factories, custom assertion/wait utilities — rather than the E2E specs themselves.

### Config file basics

Stryker is configured via a `stryker.conf.json` (or `.mjs`/`.js` for programmatic config) at the project root, or via CLI flags. Initialize one with:

```bash
npx stryker init
```

which interactively asks about your test runner, package manager, and reporters, and scaffolds the config file.

### Key config concepts

- **`mutate`** — glob pattern(s) telling Stryker which files to mutate. Default behavior targets production code and excludes test files, e.g.:
  ```json
  "mutate": ["src/**/*.ts", "!src/**/*.spec.ts"]
  ```
  You can also scope a mutation range to specific lines/columns (`"src/app.ts:5:4-6:4"`) when iterating on one file.

- **`testRunner`** — which runner executes your tests per mutant. Common values: `"jest"`, `"mocha"`, `"jasmine"`, `"karma"`, or `"command"` (runs an arbitrary shell command and uses its exit code). TypeScript projects using ts-jest or Babel-Jest generally need no separate build step; projects compiled ahead-of-time (tsc, Webpack) need a `buildCommand`.

- **`buildCommand`** — a compile step run before/around each mutation batch when your test runner needs compiled JS rather than TS directly, e.g.:
  ```json
  "buildCommand": "tsc -b tsconfig.json"
  ```
  The guide's practical warning: ahead-of-time compilation is strongly preferred over just-in-time transpilation, because Stryker invokes the build/test cycle many times (once per mutant, or per batch) — a slow compiler step gets multiplied across the whole run.

- **`reporters`** — output formats. Defaults to `["html", "clear-text", "progress"]`; other options include `json`, `dashboard`, `dots`, `event-recorder`. Each has its own config block (e.g. `htmlReporter`, `clearTextReporter`).

- **`thresholds`** — pass/fail gating on the mutation score, e.g.:
  ```json
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": 50
  }
  ```
  `high`/`low` just color-code the report (green/yellow/red bands); `break` is the one with teeth — if the mutation score falls below it, Stryker exits non-zero, which is what you'd wire into CI to fail a build on regressed test quality. Setting `break: null` disables the hard gate.

### Running it and reading the report

Run with:

```bash
npx stryker run
```

This mutates matching files, executes the test suite once per surviving-candidate mutant, and prints a live progress bar plus a clear-text summary in the terminal. The **HTML reporter** (on by default) writes a report — typically to `reports/mutation/html/index.html` — that's the practically useful artifact:

- A file-tree view lets you drill into any source file and see it rendered with every mutant inline, color-coded (green = killed, red = survived, grey = no coverage/ignored).
- Clicking a mutant shows the exact one-line diff it applied (e.g. `age >= 18` → `age > 18`) plus which specific mutation operator produced it.
- The top-level score matches the `thresholds` color bands, so a quick skim of file-level percentages tells you where test quality is weakest before you drill into individual survivors.

Practical workflow: run Stryker locally after writing/refactoring tests for a module, open the HTML report, filter mentally to **No Coverage** and **Survived** mutants first (the highest-value fixes), and treat a green mutation score the same way you'd treat green coverage — a floor to maintain, not a target to game.

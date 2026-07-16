# ✅ My Personal Clean Code Checklist for Test Automation

A short reflection + running checklist I can use before merging any new Playwright/TypeScript test.

## 🧠 Reflection

Going through checked vs. unchecked exceptions in Java and then try/catch in TypeScript automation code, the thing that stuck with me most is: **error handling in tests isn't about avoiding failure, it's about making failure informative.** A test suite's whole job is to tell the truth when something's broken. Every try/catch I add is a decision point where I could accidentally make the suite lie — and the biggest risk is always the silent, empty catch block that looks harmless but actually hides a real bug.

The other thing that clicked: Playwright already does a lot of the "good error handling" for me automatically — auto-waiting, clear timeout messages, traces, screenshots on retry. So my default should be **write less try/catch, not more**, and only reach for it when I have a specific, nameable reason (optional element, cleanup, intentional negative test, or adding context before rethrowing).

## 📋 The Checklist

### Before adding a try/catch, ask:
- [ ] Do I have a **specific reason** to catch this, or am I just trying to make an error go away?
- [ ] If I catch it, will I **do something with it** (log, screenshot, retry, decide it's safe) — or am I about to write an empty/near-empty catch block?
- [ ] Could I get a **clearer error for free** by just letting Playwright's own timeout/assertion error surface instead?

### If I do catch, make sure:
- [ ] The catch block is **narrow** — wraps one action/step, not a whole test body.
- [ ] I **rethrow** unless I have a documented, deliberate reason not to (optional element, expected negative-test outcome).
- [ ] Any rethrown error includes **context**: which step, which locator, current URL, relevant test data.
- [ ] `error` is **narrowed** (`instanceof Error`) before I touch `.message` — it's `unknown` by default in modern TS.
- [ ] Cleanup code uses **try/finally**, not try/catch, so resources are always released without swallowing the real failure.

### Retry logic specifically:
- [ ] Retries are **capped** with a max attempt count — never infinite.
- [ ] Retries are used for **genuinely flaky infra** (network blips), not to paper over a real bug or a bad locator.
- [ ] I've logged each retry attempt so patterns of flakiness are visible later, not hidden.

### Before merging, sanity check the whole file:
- [ ] No empty `catch {}` blocks anywhere.
- [ ] No `catch` block that only does `console.log` and silently continues.
- [ ] No single try/catch wrapping the entire test — I can tell exactly which line failed from the error alone.
- [ ] Assertions (`expect(...)`) are **not** wrapped in try/catch — let Playwright's own failure reporting do its job.
- [ ] Diagnostics (screenshots/logs) are added **on the way out** via rethrow, never used as a replacement for rethrowing.
- [ ] I re-read every catch block and asked: *"If this exact error happened in CI at 2am, would I have enough information to know what broke?"*

## 🎯 The one-sentence version
**Catch only what you can name a reason for, always add context on the way out, and never let a test pass quietly when something real broke.**
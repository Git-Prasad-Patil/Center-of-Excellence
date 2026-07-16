# Common POM Anti-Patterns

**Based on:** the granularity and assertion-free principles from [01-page-object-model-deep-dive.md](./01-page-object-model-deep-dive.md) (Fowler, Playwright docs), applied in reverse — these are what happens when those principles are ignored. No single dedicated source covers this list; it's the practical failure modes that fall out of skipping granularity and encapsulation discipline.

---

## 1. Bloated page objects ("God page objects")

Symptom: one page object class ends up with 40+ methods and locators covering the entire page — header, nav, every section, every modal — because it was modeled per-*page* instead of per-*component* (the mistake [01](./01-page-object-model-deep-dive.md) warns about directly: Fowler's example splits a page into an album-list object, individual album objects, a header object, and a footer object — not one object for the whole page).

Why it hurts: any change anywhere on that page touches the same file, so unrelated features collide in diffs and code review. Locators for elements no single test even uses still get maintained. New team members can't tell which methods are relevant to the page they're testing.

Fix: split by UI component, not by page/route. Shared components (header nav, footer, a modal that appears on multiple pages) become their own Component Objects (see [03](./03-component-object-model.md)), composed into whichever page objects use them.

## 2. Fixture over-sharing

Symptom: a single mega-fixture provides everything — every page object, test data, auth state, feature flags — to every test, "just in case." Every test pays the setup cost of fixtures it never uses, because Playwright's fixture doc is explicit that fixtures are meant to be **on-demand**: "only required fixtures execute; unused fixtures skip" (see [05](./05-playwright-fixtures.md)) — that guarantee only holds if fixtures are actually scoped to what a given test needs, rather than bundled into one all-provides-everything object.

Why it hurts: slower test runs (unused setup still executes when it's bundled instead of declared per-fixture), unclear test intent (you can't tell what a test actually depends on from its fixture list if everything gets one fixture), and fragile tests (an unrelated fixture's teardown failing can fail a test that never used it).

Fix: keep fixtures narrow and composable — one fixture per page object or concern, declared individually, so a test's fixture parameter list documents exactly what it touches.

## 3. Test logic (assertions, branching, retries) living in the page object

Symptom: the page object itself contains `expect()` calls, if/else branching on business outcomes, or retry loops for "flaky" steps — blurring the line between "how do I interact with this UI" and "what does this test expect to be true."

Why it hurts: this is the exact line Fowler draws when he argues for **assertion-free page objects** (see [01](./01-page-object-model-deep-dive.md)) — access and verification are different concerns. When a page object asserts, two problems follow: (a) the same page object can't be reused by a test that expects a different outcome, since the "expected" behavior is baked into the object rather than the test, and (b) test failures report from inside a shared helper class instead of the specific test, making failure messages harder to trace back to intent.

Fix: page objects return state (booleans, strings, other page objects) or perform actions; tests decide what to assert on that returned state. The one exception Fowler allows — invariant-checking assertions that confirm the app loaded into a sane state — stays minimal and generic (never "does this match what *this specific test* expects").

---

### Takeaway

All three anti-patterns come from collapsing a boundary: bloated page objects collapse the page/component boundary, fixture over-sharing collapses the "what does this test actually need" boundary, and test logic in page objects collapses the access/verification boundary. The fix in each case is the same shape — draw the boundary back and let each piece do one job.

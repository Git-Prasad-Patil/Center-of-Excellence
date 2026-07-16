# Page Object Model — Deep Dive

**Sources:** playwright.dev/docs/pom, martinfowler.com/bliki/PageObject.html

---

## What it actually is

A Page Object Model (POM) wraps a page or a fragment of a page in an application-specific class, so tests interact with an API shaped like the app's domain ("log in", "add to cart") instead of raw selectors and DOM calls. Playwright's own framing: it gives you "a higher-level API which suits your application" and centralizes selectors so a UI change means editing one class, not every spec that touches that element.

Fowler's original framing goes a level deeper than "wrap selectors in a class" — the core principle is:

> It should allow a software client to do anything and see anything that a human can.

That's a completeness bar, not just a DRY mechanic. A page object's accessor methods should also return **meaningful types**: a string for a text field, a boolean for a checkbox, not raw locator handles or HTML. The point is that the test reads in terms of the domain, and the "how do I find/read this" detail lives entirely inside the page object.

## Granularity — the part that's easy to under-apply

Fowler is explicit that a page object shouldn't be one class per page. It should be one object per **significant UI component**. His example: a page listing albums gets an album-list object containing individual album objects, plus separate header and footer objects. This is the seed of what Playwright's ecosystem now calls the Component Object Model (see [03](./03-component-object-model.md)) — Fowler was describing it before the term existed.

## Navigation returns page objects, not raw pages

When an action on a page object causes navigation, the method should return the **next page object**, not a raw `Page`/browser context. A `LoginPage.login()` call returns a `DashboardPage`, for example. This makes call chains type-safe and self-documenting — the test can see, from the return type alone, where an action is expected to land.

## The debated bit: should page objects assert?

Fowler favors **assertion-free page objects** — the object's job is access, not verification, so `expect()` calls belong in the test, not the page object. The one exception he allows is invariant-checking: assertions that confirm the application state is sane (e.g., "did the page actually load") rather than checking a specific test's expected outcome. Some practitioners disagree and prefer page objects that return generic browser contexts so the test decides which page object to instantiate next — but the assertion-free default is the more common convention and the one these notes follow.

---

### Takeaway

POM is not "move the selector into a variable." It's: model each significant UI component as its own object, return meaningful types (never raw HTML/locators) from accessors, return the next page object on navigation, and keep assertions out of page objects except for basic sanity checks. Everything that follows in this set of notes (component objects, base classes, fixtures) is really just tooling to make that discipline sustainable as the suite grows.

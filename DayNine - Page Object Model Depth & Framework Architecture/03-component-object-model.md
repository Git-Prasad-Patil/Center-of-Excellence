# Component Object Model — Extending POM for Reusable UI Components

**Based on:** the granularity principle in martinfowler.com/bliki/PageObject.html (see [01](./01-page-object-model-deep-dive.md)), applied specifically to elements that repeat *across* pages rather than within one page.

---

## The gap plain POM leaves open

Fowler's granularity guidance (album-list object, header object, footer object, all inside one page) solves modeling a single page's internal structure. It doesn't, by itself, solve a second problem: a header nav, a footer, or a modal dialog usually isn't unique to one page — it appears on every page of the site. If each page object re-declares its own copy of the header's locators and methods, you're back to the exact duplication POM was meant to remove, just one level up.

## What a Component Object is

A **Component Object** is the same idea as a Page Object — wrap a chunk of UI in a class with meaningful accessor/action methods, keep locators private to that class — applied to a reusable fragment instead of an entire page. A page object then **composes** component objects as properties instead of re-implementing their behavior:

```ts
class BasePage {
  readonly headerNav: HeaderNavComponent;

  constructor(protected page: Page) {
    this.headerNav = new HeaderNavComponent(page);
  }
}

class HomePage extends BasePage {
  // HomePage-specific locators/methods only —
  // header nav behavior lives in headerNav, not duplicated here.
}
```

Every page object that extends the shared base automatically gets the same header/nav/modal behavior, defined exactly once.

## How this differs from just "another page object"

- A page object models something a test navigates *to* (it usually corresponds to a route/URL).
- A component object models something that *persists across* navigations — it doesn't own a URL, it's mounted inside whatever page object is currently active.
- Component objects are typically **composed**, not extended — a page object holds an instance of `HeaderNavComponent` as a property, rather than inheriting from it. Inheritance is reserved for the base-page hierarchy (see [04](./04-base-page-class-patterns-in-typescript.md)); composition is for "this component appears inside this page."

## Where the payoff shows up

The clearest sign a component object is worth extracting: the same locator/interaction shows up in two or more page objects already. That's the practical trigger — same signal as any other "extract when duplicated" rule, just applied to UI structure instead of business logic.

---

### Takeaway

Component Objects aren't a separate pattern from POM — they're POM's granularity principle applied across pages instead of within one page. Compose them into page objects (usually via a shared base class) rather than duplicating their locators in every page object that happens to render the same header or modal.

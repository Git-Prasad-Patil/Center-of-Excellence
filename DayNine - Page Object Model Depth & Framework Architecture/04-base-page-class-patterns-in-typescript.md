# Base Page Class Patterns in TypeScript

**Source:** refactoring.guru/design-patterns/typescript (Template Method, in particular), applied to Playwright page objects.

---

## The pattern that actually applies: Template Method

refactoring.guru's definition: Template Method "defines the skeleton of an algorithm in the superclass but lets subclasses override specific steps of the algorithm without changing its structure." That's precisely the shape of a good `BasePage`:

- The base class defines the **skeleton** every page object needs regardless of what page it represents: how to wait for something, how to log an action, how to capture an error, how to take a debug screenshot.
- Each concrete page class (`HomePage`, `CartPage`, ...) fills in the **specifics**: its own locators, its own domain methods (`addFirstProductToCart()`), without redefining how waiting/logging/error-capture work.

## What belongs in a base page class

Only things that are genuinely common to *every* page, with no page-specific knowledge baked in:

- **The `page: Page` reference itself** — stored once in the constructor, so every subclass gets it via `super(page)` instead of re-declaring it.
- **Generic wait helpers** — e.g. `waitForVisible(locator, timeout?)`, `waitForUrlContains(fragment)` — wrappers around Playwright's own waiting APIs that add nothing page-specific, just a consistent call shape across the suite.
- **Logging** — a `log(action: string)` method that writes through the shared logger (`utils/logger.ts` in this repo), so every page action gets a consistent, timestamped trail without each page object importing and calling the logger itself.
- **Error capture hooks** — a place to hook in "if this action throws, capture a screenshot/page snapshot before rethrowing," shared by every page object rather than duplicated per class.
- **Truly universal navigation** — e.g. `goto(path: string)` if every page shares the same base URL construction.

## What does NOT belong in a base page class

- **Any specific locator.** The moment a base class has `get loginLink()`, it has assumed every subclass has a login link — untrue, and it starts pulling page-specific knowledge into the one class every page object depends on (this is the "bloated" failure mode from [02](./02-common-pom-anti-patterns.md), just moved up to the base class instead of a leaf page object).
- **Assertions.** Per [01](./01-page-object-model-deep-dive.md), verification is the test's job, not the page object's — that applies to the base class most of all, since an assertion baked into the base would run for *every* page object in the suite.
- **Component objects that don't appear on every page.** A `HeaderNavComponent` that's genuinely on every page is reasonable to instantiate in the base constructor; a modal that only appears on two of ten pages belongs composed into just those two page objects, not the shared base.
- **Business/domain logic.** `checkout()` is a `CartPage` method, never a `BasePage` method — it means nothing outside the one page it applies to.

## The concrete shape

```ts
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async waitForVisible(locator: Locator, timeout = 5000) {
    await locator.waitFor({ state: "visible", timeout });
  }

  protected log(action: string) {
    logger.info(`[${this.constructor.name}] ${action}`);
  }

  protected async captureErrorContext(error: unknown, label: string) {
    // screenshot / page snapshot on failure, shared by every page object
  }
}

export class HomePage extends BasePage {
  // page-specific locators and methods only
}
```

---

### Takeaway

The test for "does this belong in BasePage" is: would every single page object need this, with zero page-specific assumptions baked in? If the answer requires "well, most pages have..." — it doesn't belong in the base class. That discipline is exactly what Template Method describes: a fixed skeleton (wait/log/error-capture), with all the variable steps left to subclasses.

# Exercise Implementation Summary — POM Depth & Framework Architecture

The other files in this folder are the study notes. This one records what was actually *built* to satisfy the three exercises, where it lives, and what running it proved.

## 1. Base page class — implemented

[pages/base.page.ts](../pages/base.page.ts) is an abstract `BasePage`, the Template Method skeleton every page object in this suite extends: `waitForVisible(locator, timeout)`, `goto(url)` (logs then navigates), `log(action)` (writes through `utils/logger.ts`'s winston logger, prefixed with the concrete class name), and `captureErrorContext(error, label)` (screenshots to `screenshots/` + logs the error — deliberately does not swallow or rethrow, that decision stays with the caller). Per [04-base-page-class-patterns-in-typescript.md](./04-base-page-class-patterns-in-typescript.md), it holds zero locators, zero assertions, and zero domain logic.

## 2. POM with component objects — implemented

Refactored the three existing specs that hit `https://demowebshop.tricentis.com/` directly:

- [pages/components/header-nav.component.ts](../pages/components/header-nav.component.ts) — `HeaderNavComponent`, verified live against the real header markup (`a.ico-register`, `a.ico-login`, `#topcartlink .cart-qty`, `a.ico-wishlist .wishlist-qty`), confirmed identical across every page checked. Methods return meaningful types (`getCartItemCount(): Promise<number>`, not the raw `"(0)"` string).
- [pages/components/notification-bar.component.ts](../pages/components/notification-bar.component.ts) — `NotificationBarComponent`, modeling the newsletter subscribe result block (`#newsletter-result-block`), chosen over a generic add-to-cart bar because it was verified to actually recur and reliably trigger across pages, matching the "same element on two-plus pages" trigger from [03-component-object-model.md](./03-component-object-model.md).
- [pages/home.page.ts](../pages/home.page.ts) — `HomePage extends BasePage`, composing both components as properties (constructed by `HomePage`, not by `BasePage` — not every page needs the notification bar).
- [utils/fixtures.ts](../utils/fixtures.ts) — layered a `homePage` fixture on top of the pre-existing error-handler `page` fixture, so importing `test`/`expect` from one module gives every spec both behaviors — the Fixtures+POM pairing from [05-playwright-fixtures.md](./05-playwright-fixtures.md).
- [tests/auto-waiting.spec.ts](../tests/auto-waiting.spec.ts), [tests/screenshot.spec.ts](../tests/screenshot.spec.ts), [tests/hard-soft-assertions.spec.ts](../tests/hard-soft-assertions.spec.ts) — refactored to use `homePage` and its components. The force-click in `auto-waiting.spec.ts` stays visible at the call site (`homePage.headerNav.clickRegister({ force: true })`) rather than being hard-coded inside the component, since baking it in would hide the exact behavior that test demonstrates. `hard-soft-assertions.spec.ts`'s intentionally-failing assertions were left byte-for-byte unchanged — only its navigation/title-read now routes through the page object.
- [tests/newsletter-signup.spec.ts](../tests/newsletter-signup.spec.ts) — new test added specifically to exercise `NotificationBarComponent` with a real assertion (the assertion lives in the test, not the component, per [01](./01-page-object-model-deep-dive.md)).

Verified by running the affected specs against the live site: `auto-waiting`, `screenshot`, and `newsletter-signup` pass; `hard-soft-assertions` still reports its two intentional failures (Hard Assertions test fails on `expect(5).toBe(10)`, Soft Assertions test fails on its two deliberately-wrong expected titles) — unchanged from before the refactor.

## 3. Test data factory — implemented

[utils/test-data-factory.ts](../utils/test-data-factory.ts) — per [06-test-data-management-strategies.md](./06-test-data-management-strategies.md): a `createUser(overrides)` factory function for flat user records (timestamped + random-suffixed email so parallel/rerun runs against the shared live demo site never collide), and a `RegistrationDataBuilder` fluent builder (`withGender`, `withNewsletter`, `withCompanyName`, `withUser`) whose `.build()` layers builder choices over `createUser()`'s baseline defaults. The module has no Playwright dependency — pure data construction, unit-testable without a browser.

[pages/registration.page.ts](../pages/registration.page.ts) — `RegistrationPage extends BasePage`, built against the real `/register` form (verified live: gender radios are optional, first/last name/email/password/confirm-password are required — there is no company-name field or newsletter checkbox on this particular form, so `RegistrationData`'s `companyName`/`newsletter` fields are accepted but intentionally unused by `register()`, documented in the class comment rather than silently dropped). Submission redirects to `/registerresult/{id}` with a `.result` element reading exactly "Your registration completed".

[tests/user-registration.spec.ts](../tests/user-registration.spec.ts) — builds data via `new RegistrationDataBuilder().withGender("F").withNewsletter(true).build()`, submits it through the `registrationPage` fixture (added to `utils/fixtures.ts` alongside `homePage` — this one deliberately does *not* auto-navigate, since not every registration test wants navigation to happen at construction time), and asserts success. Passed against the live site on a real run.

## Principles learned

- Fowler's granularity principle (album/header/footer as separate objects, not one page-sized object) is the same idea as extracting a Component Object — POM already contained the idea before "Component Object Model" was a separate name for it.
- The base-class test that actually holds up in practice: "would every page object need this with zero page-specific assumptions?" A locator, an assertion, or even a component that only appears on some pages fails that test and doesn't belong in `BasePage`.
- Verifying real site behavior before writing selectors mattered concretely here — the registration form did not have the company/newsletter fields a generic e-commerce registration form "usually" has, and guessing would have produced a page object that silently did nothing for those fields instead of documenting why.
- Fixtures and page objects solve different problems and combine rather than substitute: `homePage` auto-navigates because every consumer wants that; `registrationPage` deliberately doesn't, because navigation timing varies by test. The right fixture design isn't a single template applied to every page object.
- Keeping assertions out of page objects paid off directly in the one file that's supposed to fail: refactoring `hard-soft-assertions.spec.ts`'s navigation without touching its assertion values was only safe *because* the page object never had an opinion about what the title should be.

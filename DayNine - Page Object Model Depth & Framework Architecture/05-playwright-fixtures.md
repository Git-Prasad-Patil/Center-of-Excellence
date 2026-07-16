# Playwright Fixtures — and How They Differ from POM

**Source:** playwright.dev/docs/test-fixtures

---

## What a fixture actually is

A fixture sets up exactly what a test needs and nothing else, torn down automatically afterward, isolated between tests. Built-in ones (`page`, `context`, `browser`, `browserName`, `request`) already work this way — `page` is a fresh, isolated instance per test with no manual setup/teardown required.

Custom fixtures are declared with `test.extend<T>()`:

```ts
const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);      // test runs here
    await todoPage.removeAll(); // teardown, runs after the test
  },
});
```

## Scopes

- **Test-scoped** (default) — created and torn down for every individual test.
- **Worker-scoped** (`{ scope: 'worker' }`) — created once per worker process and reused across every test file that requests it in that worker; the shape for "start a server once, reuse it" setups.

## Options, automatic fixtures, composability

- **Option fixtures** make config declarative and overridable per Playwright project (`defaultItem: ['Something nice', { option: true }]`).
- **Automatic fixtures** (`{ auto: true }`) run for every test whether or not it lists them as a parameter — the mechanism for cross-cutting concerns like logging or debug capture without touching every test's signature. This repo's `utils/fixtures.ts` global-error-handler fixture is exactly this shape: it overrides the `page` fixture itself so every spec that imports `test` from it gets console/pageerror/crash capture for free.
- **Composability** — fixtures can depend on other fixtures (a `todoPage` fixture depends on `page`), and Playwright resolves the dependency order automatically: dependencies initialize first and tear down last.
- Fixtures are strictly **on-demand** — a test that doesn't list a fixture as a parameter never pays its setup/teardown cost. This is the property that fixture over-sharing quietly throws away (see [02](./02-common-pom-anti-patterns.md)).

## Fixtures + Page Objects together

The doc's own recommended pairing: instead of instantiating a page object in a `beforeEach` hook, wrap the instantiation *and* its setup/teardown in a fixture:

```ts
todoPage: async ({ page }, use) => {
  const todoPage = new TodoPage(page);
  await todoPage.goto();
  await todoPage.addToDo('item1');
  await use(todoPage);
  await todoPage.removeAll();
},
```

Every test that lists `todoPage` as a parameter gets a fully set-up page object with no repeated `beforeEach` boilerplate across spec files.

## Where fixtures end and POM begins

These solve different problems and aren't substitutes for each other:

| | **POM / Component Objects** | **Fixtures** |
|---|---|---|
| Solves | *How* a test talks to the UI — locators, semantic actions, encapsulating DOM detail | *What* a test receives before it runs — setup, teardown, isolation, shared state |
| Unit of reuse | A class per page/component | A named, injectable value per test |
| Composition | Page objects compose component objects | Fixtures compose other fixtures |

In practice they combine: a fixture's job is often just "construct the page object, run its setup steps, hand it to the test, tear it down" — the fixture is the delivery mechanism, the page object is what gets delivered.

---

### Takeaway

Use POM to describe *how* to interact with a piece of UI. Use a fixture to describe *what a test needs before the test body runs* and to guarantee it's cleaned up after. Don't reach for one to solve the other's job — a bloated all-purpose fixture that also encodes UI interaction logic is the fixture-over-sharing anti-pattern from [02](./02-common-pom-anti-patterns.md).

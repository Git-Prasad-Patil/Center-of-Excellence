# Cucumber Data Tables — Concepts and TypeScript Usage

Source: [cucumber/cucumber-jvm — datatable module](https://github.com/cucumber/cucumber-jvm/tree/main/datatable), read for the underlying data-table conversion model. The linked module is Java-specific (`cucumber-jvm`), so the concepts below are translated to how `@cucumber/cucumber` (the JS/TS implementation used in this repo) exposes the same idea.

## What a data table is for

A Gherkin `Data Table` is a `|`-delimited grid directly under a step (see [04](./04-gherkin-syntax-reference.md)). Rather than the step definition manually splitting strings, Cucumber gives it a structured object — the goal is the same in every Cucumber implementation (Java, JS, Ruby, etc.): **turn tabular text in the feature file into typed data in the step definition**, without hand-parsing.

## The shapes cucumber-jvm's datatable module supports

- **List of lists** (`List<List<String>>`) — the rawest form, just rows and columns.
- **List of maps** (`List<Map<String,String>>`) — first row is a header, every subsequent row becomes a map from header name to cell value. This is the shape used most often in practice.
- **Single map** (`Map<String,String>`) — a two-column table where the first column is treated as keys.
- **Custom object conversion** — via `DataTableType` registrations (`DataTableType.entry(SomeClass.class)`, or a hand-written `TableCellTransformer`/`TableEntryTransformer`), so a table row can convert directly into a domain object instead of a raw map.

## The equivalent in `@cucumber/cucumber` (this repo's stack)

The JS/TS library exposes the same "list of maps" idea via the `DataTable` class passed into a step definition:

```ts
import { DataTable } from "@cucumber/cucumber";

When("I add the following products to the cart:", async function (table: DataTable) {
  for (const row of table.hashes()) {
    // row is a Record<string, string>, one entry per Examples-style row,
    // keyed by the table's header column names.
  }
});
```

- `table.hashes()` — list-of-maps form (each row keyed by header). Used in [features/step-definitions/cart.steps.ts](../features/step-definitions/cart.steps.ts) for the "add several products" step and in [features/step-definitions/account.steps.ts](../features/step-definitions/account.steps.ts) / [checkout.steps.ts](../features/step-definitions/checkout.steps.ts) for the account-registration and card-payment steps.
- `table.raw()` — raw rows-and-columns, no header interpretation (equivalent to cucumber-jvm's `List<List<String>>`).
- `table.rowsHash()` — the "single map, first column is the key" form.
- Custom conversion isn't built into `@cucumber/cucumber` the same declarative way as Java's `DataTableType` registry, but the same effect is achieved by simply typing the result of `.hashes()` — e.g. this repo casts the parsed row to a `SignupDetails` or `CardDetails` interface (`features/support/pages.ts`) rather than working with untyped string maps throughout the step definition.

## Why this matters for reusable steps

Data tables are what let a single step definition stay generic across very different-shaped inputs, instead of writing one step per field. Three examples from this exercise:

1. **Multi-row table** — `I add the following products to the cart:` takes a table with `searchTerm` / `product` columns and loops over `table.hashes()`, so adding 2 products or 5 products is the same step definition, just a longer table in the `.feature` file.
2. **Single-row table used as a structured argument** — `I register a new account with the following details:` takes exactly one row via `table.hashes()[0]`, needing ten-odd named fields at once (name, email prefix, password, address, country, state, city, zip, mobile) without exploding into a dozen separate `And` steps or one unreadable Cucumber Expression.
3. **A second, independent single-row table in the same scenario** — `I pay with the following card details:` — proves the pattern composes: one scenario can use a data table for account details and a completely separate one for payment details without the two colliding, because each is scoped to its own step.

## The general principle carried over from cucumber-jvm's design

Whether it's Java or TypeScript, the datatable abstraction exists so that **the shape of the data in the `.feature` file (rows and columns) maps directly and predictably to a shape in code** (a list of typed rows), rather than the step definition doing brittle manual string splitting. That predictability is what makes data-table-driven steps reusable across scenarios with different amounts of data.

# Gherkin Syntax Reference — Notes

Source: [cucumber.io — Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)

## Keywords and structure

- **`Feature`** — required, first keyword in a `.feature` file. Free-form description text underneath it is documentation only (ignored by the runner). One `Feature` per file.
- **`Rule`** *(Gherkin 6+)* — optional, groups scenarios that all illustrate one specific business rule. Useful when a `Feature` covers several distinct rules and you want that grouping visible in the file, not just in a folder structure.
- **`Scenario`** / **`Example`** (synonyms) — a concrete example of a rule, conventionally 3–5 steps, following context → event → outcome.
- **`Background`** — `Given` steps shared by every scenario in a `Feature` (or `Rule`), run before each scenario individually (not once for the whole file — each scenario still gets an isolated run of the Background).
- **`Scenario Outline`** / **`Examples`** — a template scenario with `<placeholder>` tokens, run once per row of the `Examples` table. See the misuse anti-pattern in [03](./03-effective-gherkin-vs-anti-patterns.md).

## Step keywords: Given / When / Then / And / But / `*`

- `Given` — arranges context.
- `When` — the action/event.
- `Then` — the assertion.
- `And` / `But` — continues the previous step's keyword for readability.
- `*` — a bullet-point substitute for any of the above, useful for a list of `Given`s that don't read naturally as "And."

**The rule that trips people up:** step *matching* is keyword-agnostic. Cucumber matches a step's text against every registered step definition regardless of whether it was written as `Given`, `When`, `Then`, `And`, or `But` — the keyword is purely for human readability, not part of the match. Two step definitions with identical text but registered for different intents will still collide; the keyword doesn't disambiguate them.

## Step arguments

- **Data Tables** — a `|`-delimited table directly under a step, passed to the step definition as a table argument (a `DataTable` object in `@cucumber/cucumber`). Escape a literal pipe with `\|`, a newline within a cell with `\n`, a backslash with `\\`. See [datatable conversions](./05-cucumber-datatables.md) for how these get turned into typed data.
- **Doc Strings** — a multi-line block wrapped in `"""` (or triple backtick) directly under a step, passed as the step's final string argument. Useful for larger blobs (e.g. an expected JSON payload) that would be unreadable crammed onto one line.

## Tags

`@tag` above a `Feature`, `Rule`, `Scenario`, or `Examples` block. Tags are how you select subsets of scenarios to run (`--tags "@happy-path"`) and can be combined with boolean expressions (`@search and @negative`). In [features/ecommerce.feature](../features/ecommerce.feature), every scenario is tagged with an area (`@search` / `@cart` / `@checkout`) and a category (`@happy-path` / `@edge-case` / `@negative`), which is what let the exercise run "just the happy-path search scenario" in isolation while wiring things up (`--tags "@search and @happy-path"`).

## Comments and language

- `#` starts a comment, but only at the start of a line — inline trailing comments aren't supported.
- Gherkin supports 70+ spoken languages via a `# language: xx` header at the top of the file, translating the keywords themselves (e.g. `Scénario` for French `Scenario`). Not used in this repo's exercise (English defaults), but worth knowing it exists — it's specifically meant to let non-English-speaking domain experts write and read scenarios in their own language.

## Indentation

Not semantically significant to the parser (Gherkin isn't whitespace-sensitive like YAML), but two-space indentation under `Feature`/`Scenario` is the near-universal convention for readability, and is what's used throughout [features/ecommerce.feature](../features/ecommerce.feature).

## Where this shows up directly in the exercise

- `Background` — used once in [features/ecommerce.feature](../features/ecommerce.feature) for `Given I am on the Automation Exercise home page`, shared by every scenario in the file.
- `Scenario Outline` + `Examples` — used for the "unusual search input" edge-case scenario, since empty/special-character/very-long search terms are all genuinely testing the same rule ("the store doesn't error on odd input").
- Data Tables — used both for adding multiple products to the cart in one step, and for supplying new-account registration details and card payment details as single structured rows instead of a dozen separate steps.

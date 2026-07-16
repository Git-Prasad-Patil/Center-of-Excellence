# Naming Conventions

Conventions for this repo, so new content (tests, notes, folders) lands consistently.

## Test spec files (`tests/`)

`kebab-case.spec.ts` — describe the behavior under test, not the exercise/day it came from.

```
login.spec.ts
auto-waiting.spec.ts
drag-and-drop.spec.ts
global-error-handler.spec.ts
shadow-dom-exercise.spec.ts
```

Avoid mixed casing (`missingElementHandling-enhanced.spec.ts`) and inconsistent acronym casing (`shadowDOMExercise.spec.ts` vs. `shadowDomWorkingCode.spec.ts` — pick one: `shadow-dom-*`).

## Day folders

`Day<Word> - <Descriptive Title>` — the spelled-out day prefix (`DayOne`, `DayTwo`, …) stays as-is for continuity with existing folders and git history; the title after ` - ` names the actual topic so the folder is self-describing without opening it.

```
DayOne - Incubyte Culture & TDD Foundations + AI-Plugins Exploration
DayFive - Resilient Test Design & Error Handling in Automation
DayEight - CI-CD for QA - Principles & Pipeline Integration
```

Use `-` in place of `/` inside a title (e.g. `CI-CD` not `CI/CD`) since `/` is a path separator and can't appear in a single folder name.

## Study-note files inside a Day folder

Two existing styles, both fine — pick whichever fits how the day's content is structured:

- **Freeform `Title Case.md`** — for a handful of standalone topic notes with no inherent order (e.g. `DayOne`, `DayTwo`, `DayThree`, `DayEight`).
- **Numbered `NN-kebab-case.md`** — for a day that builds up sequentially, ending in an `NN-exercise-implementation-summary.md` (e.g. `DayFive`, `DaySix`). Use this style when the notes are meant to be read in order.

Don't mix the two styles within the same Day folder.

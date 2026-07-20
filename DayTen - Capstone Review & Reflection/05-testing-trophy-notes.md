# Study Notes — The Testing Trophy (Kent C. Dodds)

**Source:** https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications

> Note on the title: the page's actual title is **"The Testing Trophy and Testing Classifications"** (June 2021, ~7 min read) — it's Dodds's retrospective piece on where the trophy idea came from and how he defines the terms, not primarily a cost/benefit deep-dive. If you want the article with worked code examples and a fuller cost/confidence breakdown per layer, he links his companion post **"Static vs Unit vs Integration vs E2E Testing for Frontend Apps"** at the end — that's likely the piece the "for Continuous Delivery" framing has in mind.

---

## The trophy shape

Four layers, bottom to top:

1. **Static** — linting & type checking (ESLint, Flow/TypeScript in his original 2018 tweet)
2. **Unit** — a single function, class, or object, dependencies mocked or absent
3. **Integration** — multiple units working together, minimal mocking (e.g. network mocked via MSW)
4. **End to End (E2E)** — the real app, with as little mocking as possible (Cypress in his original tweet)

Visually it's a trophy, not a pyramid: narrow at the base (static), then it **bulges widest in the middle at integration** — the cup of the trophy — before narrowing again at the top (e2e). The width at each layer is meant to represent Dodds's intended emphasis: spend the most effort in the middle, not at the base.

## Why it differs from the classic Test Pyramid

- **He added the "static" layer** because, in his words, static analysis "is not a given" in JavaScript the way it is in "the predominant languages when the testing pyramid was introduced." The pyramid comes from a world (statically-typed, compiled backend languages) where type errors are caught for free at compile time — JS needed an explicit layer for that (ESLint/Flow/TypeScript) that other languages didn't need to name separately.
- **The pyramid's shape says "write mostly unit tests, a moderate number of integration tests, very few e2e tests."** The trophy inverts that emphasis: integration is the *largest* section, not unit.
- This traces back to a specific lineage: **Guillermo Rauch tweeted "Write tests. Not too many. Mostly integration." in December 2016.** Dodds agreed strongly enough, as a UI engineer, that he wrote his own blog post/conference talk with that exact title, and the trophy diagram (Feb 2018) grew out of that talk as a visual shorthand for the argument.
- A quote he includes from swyx captures the contrast directly:
  > "The Martin Fowler Test Pyramid has fallen out of style. Integration > Unit tests is the new conventional wisdom. In frontend, we now have the 'Testing Trophy' ... In backend, [there's] the 'Testing Honeycomb' from Spotify."

  Worth noting: even that quote scopes the trophy's rise to **frontend** specifically, and calls out that backend folks arrived at their own separate alternative (the Honeycomb) rather than adopting the trophy wholesale.

## What each layer is for, and how much of each

Dodds's own working definitions (he's explicit these are *his* pragmatic choices, not "the" canonical ones):

- **Static** — catch typos and type errors before any test even runs. Cheapest possible feedback loop.
- **Unit tests** — "test units which either have no dependencies (collaborators) or which have those mocked for the test." Isolated, fast, but only as trustworthy as the mocks are realistic.
- **Integration tests** — "test multiple units integrating with one another." In his own practice: rendering a real component tree, hitting real (or MSW-mocked) network boundaries, but not spinning up a full browser/deployment.
- **End-to-end tests** — validate that the whole thing works with as little mocking in place as practically possible — the closest thing to a real user's experience.

**On proportions:** the article deliberately **does not hand you a percentage split.** Dodds quotes Justin Searls approvingly on this point:
> "People love debating what percentage of which type of tests to write, but it's a distraction. Nearly zero teams write expressive tests that establish clear boundaries, run quickly & reliably, and only fail for useful reasons. Focus on that instead."

So "mostly integration" is a *directional* bias (weight your effort toward the middle of the trophy), not a numeric ratio to hit. The trophy's width-per-layer is illustrative, not a pie chart.

## Confidence vs. cost reasoning

The article frames the whole exercise as a return-on-investment problem, not a taxonomy exercise for its own sake:

> "It's all about getting a good return on your investment where 'return' is 'confidence' and 'investment' is 'time.'"

And the single guiding principle he repeats across his testing writing:

> "The more your tests resemble the way your software is used, the more confidence they can give you."

**Why integration tends to win the ROI argument in frontend/JS specifically:**
- Real users don't call your functions in isolation with mocked collaborators — they click through rendered UI. Pure unit tests (with heavy mocking) can pass while the integrated system is actually broken, giving *false* confidence.
- Full e2e tests resemble real usage most closely and thus give the *most* confidence per test — but they're the most expensive: slower, more infrastructure-dependent, and (implicitly, from the trophy's narrow e2e tip) not something you want to lean on for every case.
- Integration tests sit at the sweet spot: they exercise real component/module wiring (closer to real usage than a mocked unit test) at a cost much closer to a unit test than a full e2e run. That's why he built **Testing Library** specifically to make this style easy — rendering components with their real children, mocking only the network boundary (e.g. via MSW), and asserting on what a user would actually see/do.
- By his own account, this is *why* Testing Library became "the most popular and de facto standard testing library for React apps" (and beyond, wherever there's a DOM) — it operationalized the "mostly integration" advice.

## Explicit critique/contrast with the pyramid

- The pyramid's assumptions (compiled/typed language, unit-heavy emphasis) don't map cleanly onto JS — hence adding "static" as its own named layer.
- The swyx quote above is the most direct in-article statement that the pyramid has "fallen out of style" in favor of trophy-style, integration-weighted thinking — attributed to someone else, but included approvingly by Dodds.
- Dodds is careful to scope this: the trophy was built by looking at **his own codebase in isolation** as a frontend/UI engineer. He explicitly says he never considered whether it applies to microservices or backend services, and in the conclusion restates that it applies best to **monolith codebases** he personally owns — not distributed/serverless architectures.

## On the definitions debate itself

A recurring meta-point in the piece: the industry can't agree on what "unit test" even means, and Dodds argues that's largely fine as long as everyone is honest about their own definitions:

- Martin Fowler recounts a "test expert" from the 1990s who said: "in the first morning of my training course I cover 24 different definitions of unit test."
- Tim Bray, quoted approvingly: "let's not kid ourselves that our software-testing tenets constitute scientific knowledge."
- Dodds's own take: differences between speakers at the same testing conference often come down to *differing definitions of terms*, not real disagreement about how to achieve confidence. Classification is useful for having the conversation at all, but "ultimately it really doesn't matter" — the Justin Searls quote (expressive, fast, reliable tests that fail for useful reasons) is the thing to actually optimize for.

---

## Takeaway

The Testing Trophy isn't a stricter pyramid with a new label on top — it's a deliberate rebalancing for frontend/JS work: add a cheap "static" layer JS doesn't get for free, and shift the bulk of testing effort from the base (isolated units) to the middle (integration), because integration tests best approximate real usage per unit of cost. It's a **directional** heuristic ("write tests, not too many, mostly integration"), not a percentage quota — and Dodds is explicit that arguing over exact test-type ratios is a distraction from writing tests that are fast, reliable, and fail for genuinely useful reasons. The framing is also scoped: built from and intended for single-codebase (monolith) frontend work, not necessarily microservices or backend systems.

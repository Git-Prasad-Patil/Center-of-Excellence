# Test Strategy — Hypothetical Feature: Checkout Promo Code

## Feature under test

A new **"Apply promo code"** field on the cart/checkout page. The shopper types a code, clicks Apply, and the order total updates to reflect a discount (percentage-off, flat-amount-off, or free-shipping, depending on the code). Invalid, expired, or already-used codes show an inline error and leave the total unchanged. This slots naturally into the existing `features/ecommerce.feature` cart/checkout flow and would touch `features/support/money.ts` (the money/rounding logic already in the project) plus a new discount-calculation module.

This doc covers **what to test manually, what to automate, and what to deliberately not test — and why** for this feature, before a line of test code is written.

## What to automate

Automate anything that is (a) a business rule with more than one input/output combination, or (b) a regression risk on every future checkout change.

**Unit-level (fast, no browser) — the bulk of the coverage:**
- Discount calculation logic in isolation: percentage-off, flat-off, free-shipping, combined with tax/rounding rules already in `money.ts`.
- ZOMBIES-driven case list for the calculator itself: zero (empty cart), one item, many items, boundary (discount larger than subtotal, $0 subtotal, code applied twice), exceptions (malformed code format, null/undefined price), simple (single-item flat discount as the trivial case).
- Code validity rules as pure functions: expired code, already-redeemed code, code not applicable to items in cart, case-sensitivity of the code string.

**Integration/component-level:**
- The "Apply" action wired to a stubbed pricing service — confirm the UI calls the right endpoint with the right payload and renders whatever the service returns (success discount, or a specific error code), without needing a real backend or real codes seeded in a database.

**End-to-end (few, high-value only):**
- One happy-path E2E: add item to cart → apply a valid code → see reduced total → complete checkout. This is the "does the whole system actually wire together" confidence check — it's not where edge cases belong.
- One negative E2E: apply an invalid code → see the error, confirm checkout total is unaffected and checkout is still blocked/allowed as appropriate.

**Why automate these:** they're deterministic, have many input combinations that a human would get bored (and therefore sloppy) checking by hand every release, and a regression here is a silent money-calculation bug — exactly the kind of failure a fast, precise unit test is built to catch immediately rather than discovering after checkout has been shipping wrong totals for a week.

## What to test manually

- **Visual/UX judgment calls**: does the discount line item look right next to the subtotal/tax breakdown? Is the error message copy clear and non-alarming for a typo'd code? These are subjective "does this feel right" questions that no automated assertion can answer (per the Test Pyramid notes' point that appearance/usability sits outside what automation can judge).
- **Exploratory abuse testing** on first release: pasting extremely long strings, emoji, RTL text, copy-pasting a code with trailing whitespace or invisible characters from an email — a short scripted exploratory session is more likely to surface a weird real-world input than trying to enumerate every possible string automated.
- **Cross-device/responsive spot-check**: does the promo field + error state render sanely on a small viewport? One-time visual check per release, not worth a screenshot-diffing pipeline for a single field at this stage.
- **First-time real-payment-gateway sandbox run**: manually confirm the discounted total that reaches the actual payment provider sandbox matches what the UI displayed, once per integration change — this is a trust-but-verify check on a third-party boundary, not a repeatable regression suite.

**Why manual:** these are either one-off judgment calls, exploratory by nature (the value is a human being deliberately trying to break something in ways that are hard to enumerate up front), or so cheap/infrequent that building automation would cost more than it saves.

## What NOT to test, and why

- **The payment gateway's own correctness** (that it charges the card correctly, handles 3-D Secure, etc.) — that's the vendor's tested responsibility, not this feature's. We only need to test that *we send it the right discounted number*, which is covered by the integration test above.
- **Browser rendering engine behavior** (that CSS actually paints a red border on an invalid input) — trust the browser and the framework; testing that a class name got applied is testing the framework, not our logic.
- **Trivial pass-through code** — e.g. a getter that just returns `this.discountAmount` with no logic. Nothing to break, nothing worth a test asserting the language works.
- **Every possible promo-code string exhaustively** — infinite input space. ZOMBIES gives representative boundary/exception cases (handled above); beyond that, exhaustive fuzzing isn't worth the maintenance cost for a marketing input field with no security-sensitive parsing behind it.
- **Third-party promo-code-generation service internals** (if codes come from an external marketing platform) — out of this feature's boundary; we test how our system *reacts* to a code and its stated validity, not how the other system decided that validity.

## Layer summary

| Layer | What lives here | Roughly how much |
|---|---|---|
| Unit | Discount math, validity rules, ZOMBIES edge cases | Most of the suite |
| Integration | UI ↔ pricing service wiring, stubbed backend | A handful |
| E2E | One happy path, one negative path | Two tests, no more |
| Manual/exploratory | Visual polish, weird real-world input, gateway sandbox trust check | Ongoing, lightweight, not repeated every CI run |

This mirrors the reasoning in the Test Pyramid vs. Testing Trophy study notes ([04](./04-test-pyramid-notes.md), [05](./05-testing-trophy-notes.md), decision in [06](./06-pyramid-vs-trophy-decision.md)): push deterministic business-rule coverage as low and cheap as possible, keep the expensive/brittle E2E layer to the few journeys that actually need whole-system confidence, and leave genuinely subjective or exploratory territory to a human.

# Continuous Delivery vs. Continuous Deployment — Notes

These two terms get mixed up constantly, and honestly the confusion is understandable since they share most of their name. But they describe two genuinely different practices, and the difference actually matters for how a team works.

---

## The short version

- **Continuous Delivery (CD):** Every change that passes automated tests is _ready_ to be released to production at any time — but a human still decides _when_ to actually push the button.
- **Continuous Deployment:** Every change that passes automated tests is _automatically_ released to production. No human gatekeeper, no manual approval step.

So Continuous Deployment is really Continuous Delivery taken one step further — it removes the last manual step (the "go" decision).

---

## Continuous Delivery, in more detail

The core idea: your software is _always_ in a releasable state. Every commit goes through an automated build-and-test pipeline (often called a **deployment pipeline**), and if it passes every stage — unit tests, acceptance tests, performance tests, whatever the team has set up — it's proven itself production-ready.

But "ready to release" and "released" aren't the same thing here. A person (or a business process) still chooses the actual release moment — maybe that's tied to a sprint schedule, a marketing launch, a change-approval board, or just someone clicking a button.

**Why teams choose this:** Some organizations have real reasons to control release timing — regulatory sign-off, coordinated launches, or simply wanting a human in the loop before customer-facing changes go live. Continuous Delivery gives you the speed and confidence of full automation without giving up that final decision point.

---

## Continuous Deployment, in more detail

Same pipeline, same rigor — but the last gate is removed. If the code passes all automated checks, it goes to production automatically. No one has to click "deploy." No one has to approve the release.

This demands a very high level of trust in your automated tests, since there's no human safety net catching mistakes before customers see them. Teams that do this well tend to invest heavily in things like:

- Comprehensive automated test suites (not just unit tests — acceptance, integration, performance)
- Feature flags, so code can go to production without being visible/active yet
- Strong monitoring and fast rollback capability, since problems get caught in production rather than before it

**Why teams choose this:** Maximum speed. Changes reach users the moment they're proven good, with no queue of "approved but not yet released" work piling up.

---

## A simple way to remember it

||Continuous Delivery|Continuous Deployment|
|---|---|---|
|Automated pipeline (build, test)|✅|✅|
|Always releasable|✅|✅|
|Release to production|Manual trigger|Fully automatic|
|Human decides _when_ to ship|Yes|No|

Every Continuous Deployment setup is also doing Continuous Delivery — but not every Continuous Delivery setup goes all the way to Continuous Deployment.

---

### Takeaway

The real dividing line isn't the tooling — it's **whether a human makes the final call on releasing to production, or whether the pipeline does.** Both approaches rely on the same foundation (strong automated testing, small frequent integrations, a reliable pipeline) — Continuous Deployment just trusts that foundation enough to remove the last manual checkpoint.
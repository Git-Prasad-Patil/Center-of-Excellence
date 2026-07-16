# 

My plain-language recap of Fowler's bliki post. Source: https://martinfowler.com/bliki/Yagni.html

---

## The One-Line Version 🎯

Don't build a feature (or an abstraction, or a config option) today just because you _think_ you'll need it later. Wait until you actually, definitely need it.

Yagni started life as an acronym for "You Aren't Gonna Need It," born out of Extreme Programming (XP). It's basically the XP version of "keep it simple" — sometimes also called "Simple Design" or "incremental design." 🌱

---

## The Story That Explains It 🏴‍☠️

Fowler sets up a scenario: imagine you're building insurance software with two parts — pricing and sales. Right now, the team is working on pricing for storm risks. They already _know_ that in six months they'll also need pricing for piracy risks.

Tempting thought: "We're already in the pricing code... let's just build piracy pricing now too, while we're in there!" 🤔

YAGNI says: **nope.** Don't build it now. Wait until it's actually needed — even if that means literally sitting on your hands for a few months before starting it.

Why? Because there's a good chance the team is _wrong_ about needing it at all. Maybe piracy risk stops being a thing (Fowler's joke: "the Gondor Navy wipes out the pirates" ⚔️). Requirements change constantly — that's the whole premise of agile in the first place.

---

## The 4 Costs of Building Things Too Early 💸

This is the real meat of the article — Fowler breaks down exactly _why_ building ahead of need is expensive, even when your guess turns out to be right.

### 1. 🛠️ Cost of Build

The most obvious one. If you build a feature that turns out to be unnecessary, all that time spent designing, coding, and testing it — completely wasted.

Fun (scary) stat: even with careful planning, only about **⅓ of features actually improve the thing they were built to improve.** That means roughly **⅔ of "we'll probably need this" bets turn out wrong.** 😬 Not great odds to be building on.

### 2. ⏳ Cost of Delay

Even if you're right and the feature IS needed eventually — every hour spent on "future" work is an hour NOT spent on something valuable _right now_. In the insurance example: if the team had spent that time finishing the storm-pricing sales feature instead, they could've been making real revenue two months earlier. That delay is a real cost, even if the piracy feature turns out useful later.

### 3. 🎒 Cost of Carry

This is the sneaky one. Even a feature that's genuinely useful _someday_ adds extra complexity to the codebase **right now**, before anyone's using it. That complexity makes every other change harder — slower to build, harder to debug — for the entire time between "we built it" and "we actually needed it." You pay this tax on every unrelated feature built in the meantime. 🐌

### 4. 🔨 Cost of Repair

Teams learn and grow. The way you _imagined_ building a feature six months ago is rarely the way you'd build it once you actually understand the real requirement. So when the need finally shows up, you often end up reworking or replacing what you built early — which is basically the same pain as technical debt, except you took on the debt before you even had a reason to. 🩹

---

## It's Not Just About Big Features 🔍

Fowler points out that YAGNI applies just as much to **small stuff** as it does to giant features:

- Adding "flexible" abstractions or extra parameters "just in case" future needs show up.
- A regex helper that supports a case you don't actually need yet.
- Extra fields, methods, or config options nobody's using.

His quote-worthy line (paraphrased): an extensibility point that nobody actually uses isn't free — it's not just wasted effort, it's stuff that gets in your way later too. 🧱

These tiny decisions don't look like a big deal in project planning, but they add up. A pile of small "just in case" additions equals a genuinely more complicated codebase, and slower delivery of the stuff that actually matters right now.

---

## ⚠️ The Big Misunderstanding About YAGNI

This is the part people get wrong constantly, so pay attention:

> **YAGNI is NOT permission to write sloppy code or skip testing.** 🙅‍♂️

YAGNI only works safely if your codebase stays **easy to change.** That means:

- ✅ Refactoring is still required
- ✅ Automated/self-testing code is still required
- ✅ Continuous delivery practices are still required

These aren't "extra effort" that violates YAGNI — they're what _makes YAGNI safe._ If your code is hard to change, "we'll just add it later" becomes a trap instead of a smart strategy. Fowler's own words (paraphrased): YAGNI isn't an excuse to neglect your codebase's health — it actually requires a codebase that's easy to reshape. 🧘

Also worth noting: if adding something _doesn't_ add real complexity today, YAGNI doesn't even apply — there's no cost to weigh against, so there's no dilemma.

---

## When Does YAGNI Actually Backfire? 🤷

Fowler's honest about this: sometimes waiting really does cost you more than building early would have. The tricky part is that these cases are way easier to spot in hindsight than in the moment — and because we remember our "we should've built that sooner" regrets more vividly than our quiet YAGNI wins (a bias thing), it can _feel_ like YAGNI fails more than it actually does. Overall, Fowler's take: YAGNI failures are pretty rare, and the savings from following YAGNI usually outweigh them by a lot.

---

## 🧠 My Takeaway for Test Automation

- Don't build a giant, configurable base framework "just in case" before you have two or three real cases that actually need it.
- Don't add a config flag, environment switch, or abstraction layer for a scenario nobody's testing yet.
- An unused helper or abstraction isn't "future-proofing" — it's homework for whoever reads your code next. 📚
- This is NOT a free pass to skip real assertions, skip cleanup, or ignore flaky tests — those aren't "extra" features you're deferring, they're the actual health of your test suite, and skipping them is not what YAGNI means.

**In short:** build for what you need today. Keep the code clean and well-tested so that "later" stays cheap when it actually arrives. 🚀
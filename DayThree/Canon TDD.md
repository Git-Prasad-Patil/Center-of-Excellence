# 📏 Canon TDD (by Kent Beck) — My Notes

**Original article:** [Canon TDD – Kent Beck's Newsletter](https://newsletter.kentbeck.com/p/canon-tdd)

## 📌 What is this article about?

Kent Beck (the guy who literally invented TDD 😄) got tired of people criticizing TDD based on a **wrong understanding** of it. So he wrote this short, no-fluff article to clearly define **"the real official steps of TDD"** — he jokingly calls it "Canon TDD" (like the "official" version, not a strict rulebook you must follow).

He's basically saying: _"If you're going to criticize TDD, at least criticize the real thing, not a strawman version of it."_ 🙂

## 🔢 The 5 Steps of Canon TDD

1. **📝 Write a list** of test scenarios you want to cover
2. **✅ Pick ONE item** from the list → turn it into a real, runnable test
3. **🛠️ Change the code** to make that test pass (and keep all older tests passing too)
4. **🧹 Optionally refactor** (clean up the code/design) — this step is optional, not mandatory every time
5. **🔁 Repeat** step 2 until the list is empty

That's it. Sounds simple, but most people mess it up somewhere in these steps (see below 👇).

## 🎯 Why is this USEFUL from a QA perspective?

This article is basically a **QA goldmine** because Step 1 is _"make a list of test scenarios"_ — which is exactly what testers do every day! Here's why it matters:

- ✅ **"Test List" = Test Case Design.** Before writing any test, first _list all the scenarios_ — normal cases, edge cases, "what if this service times out," "what if the key doesn't exist yet," etc. This is basic **test analysis**, and Beck says this step is often skipped by beginners — same mistake QA newbies make too.
- ✅ **Separates "thinking about scenarios" from "thinking about the fix/implementation."** Big lesson here: **don't mix "what should happen" with "how it's built."** As a tester, you should be validating behavior, not worrying about how the code is internally structured.
- ✅ **One test at a time, not a batch.** He warns against writing ALL your tests up front and only then trying to make them pass. This causes confusion and rework. In QA terms: it's like writing 50 test cases and running them all blind before checking if even the app works for the basic case. Better to validate incrementally.
- ✅ **"Until your fear turns into boredom."** 😂 This is a great quote — it means: keep testing until you're no longer worried something might break. That's literally the _goal of QA_ — confidence that things work.
- ✅ **Confirms why regression matters.** Step 3 says the new test AND all previous tests must pass. This is the whole idea behind **regression testing** — new changes shouldn't break old, working features.

## 🚫 Common Mistakes Kent Calls Out (Good for QA Awareness Too!)

|Mistake|Why it's bad|
|---|---|
|Writing tests with no real assertions (just for "coverage")|Looks like testing, but doesn't verify anything — a fake sense of safety|
|Mixing implementation ideas into the test list|Leads to messy, overly-specific tests too early|
|Writing all tests first, then fixing code to pass them one by one|Causes rework and can be demotivating (nothing passes for a long time)|
|Deleting assertions just to make a test "pass"|This is basically **cheating the test** — very relevant to QA: never fake a pass!|
|Copy-pasting the actual output into the "expected" value|This defeats the whole purpose of verification — the test will always pass even if the logic is wrong|
|Refactoring too much or too early|Scope creep — stick to what's needed for the current test|

## 💡 Key Takeaway for QA

Even though this is written for developers, the **first step ("build a test scenario list")** is pure QA thinking. It reminds us:

> Good testing starts with good **analysis of scenarios** — not jumping straight into execution. And a test that can "fake" a pass (no real assertions, hardcoded expected values) is worse than no test at all — because it gives false confidence. ⚠️

---

📝 _Note: This article is a "manifesto"-style, opinionated piece. Kent Beck is clear that these steps are HIS official definition, not a mandatory rulebook — teams can adapt, but understanding the "canon" version helps you understand what critiques are actually about._
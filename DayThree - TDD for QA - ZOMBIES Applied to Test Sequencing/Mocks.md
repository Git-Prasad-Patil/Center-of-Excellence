# 🎭 Mocks Aren't Stubs (by Martin Fowler) — My Notes

**Original article:** [Mocks Aren't Stubs – martinfowler.com](https://martinfowler.com/articles/mocksArentStubs.html)

## 📌 What is this article about?

People often use the words "mock," "stub," "fake," "dummy" as if they all mean the same thing. Martin Fowler explains that they're actually **different things** with different purposes in testing. He also explains **two different philosophies of testing** — "classical" vs "mockist" — which affect _how_ people write automated tests.

This is a classic (a bit old, written in 2007) but still very relevant article, especially if you work with automated testing or talk to developers about test design. 🙂

## 🧩 The 5 Types of "Test Doubles" (fake objects used in testing)

Think of a **Test Double** as a stand-in actor (like a stunt double in movies 🎬) — something fake used in place of a real system/object during testing.

|Type|What it does|Simple Example|
|---|---|---|
|🫥 **Dummy**|Just fills a slot, never actually used|Passing `null` or a placeholder value just so the code compiles/runs|
|🏗️ **Fake**|Has a _working_ version, but it's a shortcut not fit for real use|An in-memory database used instead of a real one|
|📻 **Stub**|Gives back **canned/pre-set answers** when called|"If asked for the price, always return $10"|
|🕵️ **Spy**|Like a stub, but it also **remembers** how it was called|An email-sending stub that also records "3 emails were sent"|
|🎯 **Mock**|Comes preloaded with **expectations** — it checks HOW it was used|"I expect `send()` to be called exactly once with these exact values — if not, FAIL"|

👉 **Key difference:** Stubs/Fakes/Dummies just help the test _run_. **Mocks actively verify that the right calls happened** — that's the special part.

## ⚖️ Two Ways to "Verify" a Test Passed

- **State Verification** (used by stubs, classic testing): "After doing the action, did the object end up in the correct final state?" → _Check the result._
- **Behavior Verification** (used by mocks): "Did the object correctly _call_ the right things in the right order with the right values?" → _Check the process/interactions._

**Simple analogy:**

- State verification = checking if the cake 🎂 turned out right.
- Behavior verification = checking if the baker followed the recipe steps exactly, regardless of how the cake turned out.

## 🏛️ Classical vs Mockist Testing (Two Testing "Schools of Thought")

||Classical (a.k.a. "Detroit")|Mockist (a.k.a. "London")|
|---|---|---|
|Approach|Use real objects when possible, only fake things that are "awkward" (like sending real emails)|Replace almost every collaborator with a mock, even simple ones|
|Verifies via|Final state|Interactions/behavior|
|Test failure blast radius|A bug can cause failures to ripple across many related tests|A bug usually only breaks the test for that one specific unit|
|Coupling to code|Less coupled to _how_ code is written internally|More coupled to internal implementation details — refactoring can break tests more easily|

## 🎯 Why is this USEFUL from a QA perspective?

This article is super relevant for QA, especially if you review automation scripts or work closely with dev teams on unit/integration testing strategy:

- ✅ **Vocabulary clarity.** Knowing the exact difference between a mock, stub, fake, dummy, and spy helps you communicate precisely with developers instead of using "mock" as a catch-all word (which causes confusion in code reviews or test discussions).
- ✅ **Helps you judge test quality.** If a test uses **too many mocks with very strict expectations**, it may be **fragile** — meaning it can break just because the code changed internally, even though the actual feature still works fine! That's a red flag when reviewing automated test suites.
- ✅ **Explains why some bugs "hide" in mock-heavy tests.** If the mock's assumptions about a real service are wrong (e.g., mocked API response doesn't match the real API), tests can pass while the real feature is broken. 🚨 **This is a huge point for QA** — mocked/unit tests passing does NOT guarantee real-world/integration correctness. Don't skip integration or E2E testing just because unit tests (with mocks) are green!
- ✅ **Explains "blast radius" of bugs.** In classical (state-based) testing, one bug can cause many related tests to fail — which is actually useful info: if you see a large cluster of failures, look for one root cause instead of debugging every failure separately.
- ✅ **Reminds us: always pair with bigger, coarser tests.** Fowler explicitly says — whichever style you use, you MUST also have **broader acceptance/integration tests** across the whole system. Relying only on fine-grained mocked unit tests is risky.
- ✅ **Useful when writing test strategy docs.** If your team debates "should we mock this database call or use a real test database?" — this article gives you the vocabulary and trade-offs to have that conversation properly.

## 💡 Key Takeaway for QA

> Mocks aren't just "fake objects" — they represent a specific _testing philosophy_ (checking HOW something was used, not just the end result). Good for isolating unit tests fast, but risky if overused because they can create false confidence — a test can pass perfectly while the real integration is broken. Always balance mock-heavy unit tests with real integration/end-to-end tests. ⚠️

---

📝 _Note: The code examples in the article are in Java (using jMock/EasyMock libraries from the mid-2000s), but the concepts (mock vs stub vs fake, state vs behavior verification) are still exactly how the industry uses these terms today._
# 🧟 TDD Guided by ZOMBIES — My Notes

**Original article:** [TDD Guided by ZOMBIES – James Grenning's Blog](https://blog.wingman-sw.com/tdd-guided-by-zombies)

## 📌 What is this article about?

The author (James Grenning) talks about a memory trick called **ZOMBIES**. It's not about scary zombies 😅 — it's an **acronym** that helps a developer decide **"what test should I write next?"** when doing Test-Driven Development (TDD).

He explains it using a coding example (building a `CircularBuffer`), but the real value here is the **thinking order** he follows — and that thinking order is basically a checklist any QA person already uses when designing test cases.

## 🔤 What does ZOMBIES stand for?

|Letter|Meaning|In Plain Words|
|---|---|---|
|**Z**|Zero|Test the "nothing happened yet" case (e.g., empty list, brand-new object)|
|**O**|One|Test with just a single item/value|
|**M**|Many (More complex)|Test with multiple items — the "real world" case|
|**B**|Boundary Behaviors|Test the edges — full, empty, min, max, wrap-around|
|**I**|Interface|Make sure the way people "use" the feature makes sense|
|**E**|Exceptions|Test what happens when things go wrong (bad input, errors)|
|**S**|Simple Scenarios & Simple Solutions|Keep tests and fixes small and easy — don't overbuild|

👉 So basically: **start super simple (zero, one) → grow into complex (many) → check the edges (boundary) → check the ugly cases (exceptions)** — and keep everything simple along the way.

## 🎯 Why is this USEFUL from a QA perspective?

This is honestly one of the best things about the article — even though it's written for programmers, it's a **ready-made test design checklist** for testers too:

- ✅ **It gives structure to test case brainstorming.** Instead of randomly thinking of scenarios, ZOMBIES gives an order: empty → one → many → edges → errors.
- ✅ **It forces boundary testing.** A LOT of real bugs live at boundaries (full buffer, empty buffer, wrap-around). ZOMBIES makes sure you don't skip these.
- ✅ **It reminds you to test negative/exception scenarios (the "E").** QA folks already know: happy path isn't enough. This is basically "abuse case testing" baked into the process.
- ✅ **It stops "happy-path-only" thinking.** Many devs (and testers!) jump straight to the complicated main scenario. ZOMBIES says: prove the simple stuff works first, THEN build up.
- ✅ **Good for writing test scenario checklists/templates** — you could literally use Z-O-M-B-I-E-S as **column headers** in a test case design sheet:
    - Zero case?
    - One case?
    - Many case?
    - Boundary case?
    - Interface/usability check?
    - Exception/error case?
    - Kept it simple?

## 🧠 Real Example from the Article (CircularBuffer)

He builds a "buffer" (like a queue) step by step:

1. **Zero:** Is it empty right after creation? Is it "not full"?
2. **One:** Put one item in → no longer empty. Get it back → matches what was put in.
3. **Many:** Put 3 items, get them back in the same order (FIFO — First In First Out).
4. **Boundary:** What happens when buffer becomes completely full? What happens right after it stops being full?
5. **Wrap-around (a tricky boundary!):** When the buffer loops back to the start — this actually broke his code once! Good reminder that **boundary + wrap-around scenarios often hide real bugs.**
6. **Exceptions:** What if you try to `Put()` into a full buffer? What if you `Get()` from an empty one? Should not crash or corrupt data.

⚠️ **Interesting real bug he found:** After adding "wrap-around" logic, an old test (`fill_to_capacity`) suddenly failed! This is a great example of **why regression testing matters** — a change to fix one thing broke something that used to work.

## 💡 Key Takeaway for QA

Even if you're not writing code, **ZOMBIES = a mental checklist for complete test coverage**:

> Zero → One → Many → Boundaries → Interface → Exceptions → keep it Simple

Use it when reviewing test cases or writing your own test scenarios to make sure you're not missing the "boring" simple cases OR the "scary" edge cases.

---

📝 _Note: The article uses C/C++ code examples (CppUTest framework), but you don't need to know C to get the value — the ZOMBIES thinking process applies to any language or even manual testing._
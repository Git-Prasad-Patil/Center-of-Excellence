# 🌳 Exception Hierarchy: Java vs TypeScript — Study Notes

## 1. ☕ Java's Exception Tree

Think of it like a family tree. At the very top sits one class: **`Throwable`**. Only `Throwable` (or something under it) can be thrown or caught in Java.

`Throwable` has 2 kids 👇

- **`Error`** 💀 — big, scary, "the app is basically doomed" stuff. Comes from the JVM itself. Examples: `OutOfMemoryError`, `StackOverflowError`. Rule of thumb: don't even try to catch these, there's nothing you can do.
- **`Exception`** ⚠️ — stuff a normal app *might* want to catch and recover from. This is the branch we actually deal with day to day.

`Exception` then splits one more time:

- **`RuntimeException`** and everything under it → 🔓 **unchecked**
- Everything else under `Exception` → 🔒 **checked**

So the simple rule: **`RuntimeException` or `Error` subclass = unchecked. Anything else under `Exception` = checked.**

### 🔒 Checked exceptions
- Compiler checks these **before your code even runs**. You MUST catch them or declare `throws`, or it won't compile. No skipping!
- For things outside your control — a missing file, a dead network connection, a broken DB call.
- Examples: `IOException`, `FileNotFoundException`, `SQLException`, `ClassNotFoundException`.
- Basically Java forcing you to say "yes I thought about this failure" 🙋

### 🔓 Unchecked exceptions
- Compiler doesn't care. Code compiles fine even if you ignore them completely.
- Subclasses of `RuntimeException`. Usually = **you (the coder) messed up somewhere** 🙈
- Examples: `NullPointerException` 👻, `ArrayIndexOutOfBoundsException`, `ArithmeticException` (divide by zero 🚫➗0), `NumberFormatException`.
- These blow up at runtime because a bug slipped through.

### 🗺️ Quick picture
```
Throwable
├── Error 💀 (unchecked — don't catch, nothing to do)
└── Exception ⚠️
    ├── RuntimeException 🔓 (unchecked — your bugs)
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   └── ArithmeticException
    └── everything else 🔒 (checked — compiler makes you handle it)
        ├── IOException
        ├── SQLException
        └── ClassNotFoundException
```

**One-liner to remember 🧠:** checked = "stuff outside your control, compiler forces you to deal with it." Unchecked = "your own bug, compiler lets it slide."

---

## 2. 🟦 TypeScript — No Checked Exceptions, No Real Hierarchy

Big twist here: **TypeScript doesn't have checked exceptions at all**, and honestly doesn't have a real hierarchy either. 😅

What that means in practice:

- You can `throw` literally *anything* 🎲 — a string, a number, a plain object, not just an `Error`. TS doesn't stop you.
- A function's type signature tells you **nothing** about what it might throw. `function getUser(id: number): User` — could throw, could not, you'll never know just by looking 👀
- No `throws` keyword, no compiler enforcement, no "you must handle this" rule.

### 🧩 Closest thing to a hierarchy
JavaScript gives you a base `Error` class plus a few built-in flavors:
- `TypeError` — used the wrong type 🚫
- `RangeError` — value out of range (e.g. weird array length)
- `SyntaxError` — bad syntax, like broken JSON
- `ReferenceError` — referencing something that doesn't exist

Custom errors → just extend `Error`:
```ts
class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
  }
}
```
In `catch`, YOU have to check the type yourself with `instanceof` 🔍:
```ts
try {
  doSomething();
} catch (error) {
  if (error instanceof CustomError) {
    // handle it specifically
  } else if (error instanceof Error) {
    // generic fallback
  } else {
    // could genuinely be anything 🤷
  }
}
```
Since TS 4.4+, `error` defaults to type `unknown` in catch (a small nudge to be careful) — but it's just a nudge, not real enforcement like Java's checked exceptions.

### 😬 Why this can bite you
- Nothing warns you if a new error type shows up deep in some function chain — easy to miss handling it.
- Libraries rarely document what they throw, so `catch` blocks often become one big "catch everything and hope" 🕸️
- Because of this pain, people often switch to **Result objects / discriminated unions** instead of throwing — same vibe as Go's `(value, err)` or Rust's `Result<T, E>`. This puts the error info back into the return type, so TS *can* force you to handle it properly.

---

## 3. ⚖️ Java vs TypeScript — Side by Side

| Thing | ☕ Java | 🟦 TypeScript |
|---|---|---|
| Root type | `Throwable` | `Error` (just convention — anything can be thrown) |
| Real hierarchy? | ✅ Yes | ❌ Not really |
| Checked exceptions | ✅ Yes, compiler-enforced | ❌ Doesn't exist |
| Unchecked exceptions | ✅ Yes (`RuntimeException`, `Error`) | Everything is basically unchecked |
| Signature tells you what it throws? | ✅ Yes, via `throws` | ❌ No clue from the signature |
| What can be thrown? | Must be a `Throwable` | Literally anything 🎲 |
| Compiler forces handling? | ✅ For checked exceptions | ❌ Never |
| Common workaround | Not needed, built in | Result objects / unions to fake type safety |

---

## 4. 🎯 Takeaway

Java gives you a built-in safety net: checked exceptions = "this might genuinely fail, deal with it," unchecked = "that's a bug, go fix your code." TypeScript skips all of that — everything's thrown the same loose way, no compiler backup, no guaranteed handling. That's exactly why a lot of TS devs now reach for Result-style return types 📦 — to get back some of that "you MUST handle this" safety that Java gets for free.
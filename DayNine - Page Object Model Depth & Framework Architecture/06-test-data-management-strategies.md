# Test Data Management Strategies — Factory and Builder Patterns

**Source:** refactoring.guru/design-patterns/typescript (Factory Method, Builder)

---

## The problem

Hardcoding test data inline (`const email = "test@test.com"`) scales badly: values collide across parallel tests, "what does this object need to be valid" logic gets copy-pasted into every test that creates one, and a schema change means hunting down every inline literal.

## Factory pattern — for simple, mostly-uniform objects

refactoring.guru's definition: Factory Method "provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created." Applied to test data (looser than the full GoF pattern — most test-data "factories" are really a single function, not a subclass hierarchy), the idea is: one function/module owns "how to produce a valid instance of X," with sensible generated defaults, and callers override only the fields their specific test cares about.

```ts
function createUser(overrides: Partial<User> = {}): User {
  return {
    email: `user_${Date.now()}@example.com`,
    password: "Test@1234",
    firstName: "Test",
    lastName: "User",
    ...overrides,
  };
}
```

Good fit for: objects with a flat, mostly-fixed shape where "valid by default, override what this test needs" covers nearly every case.

## Builder pattern — for complex objects with many optional parts

refactoring.guru's definition: Builder "lets you construct complex objects step by step... using the same construction code" to produce different representations. This fits objects assembled from several optional/conditional pieces where a single function with a giant options object gets unreadable — a fluent chain instead makes the *construction* itself expressive:

```ts
class RegistrationDataBuilder {
  private data: Partial<RegistrationData> = {};

  withGender(gender: "M" | "F") { this.data.gender = gender; return this; }
  withNewsletter(subscribed: boolean) { this.data.newsletter = subscribed; return this; }
  withCompanyName(name: string) { this.data.company = name; return this; }

  build(): RegistrationData {
    return { ...defaultRegistrationData(), ...this.data };
  }
}

// usage:
const data = new RegistrationDataBuilder()
  .withGender("F")
  .withNewsletter(true)
  .build();
```

Good fit for: registration forms, checkout data, anything with several independent optional toggles where a test wants to read, at the call site, exactly which non-default choices it's making.

## Picking between them

- Flat object, defaults cover almost every case, occasional single-field override → **factory function**.
- Several optional/conditional fields, and the *combination chosen* is itself meaningful to the test reading it → **builder**.
- They're not mutually exclusive — a builder's `.build()` step can call a factory function internally for its baseline defaults, which is the shape used in this repo's test data factory (see [07](./07-exercise-implementation-summary.md)).

## Why this matters for test isolation specifically

Generated/randomized defaults (timestamped emails, random suffixes) are what make data factories pull double duty as a **test isolation** tool, not just a DRY one — two tests creating "a user" in parallel don't collide on the same fixed record, the same problem `tests/test-isolation.spec.ts` in this repo already documents for shared state (see DayFive's notes on brittle vs. resilient tests).

---

### Takeaway

Factories for flat objects with mostly-fixed shape and occasional overrides; builders for objects assembled from several optional, individually meaningful pieces. Both exist to move "what does a valid X look like" out of individual tests and into one place — the same motivation as POM, just applied to data instead of UI.

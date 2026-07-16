// Test data construction per
// "DayNine - Page Object Model Depth & Framework Architecture/06-test-data-management-strategies.md":
// a factory function for flat, mostly-uniform objects, and a builder class
// for objects assembled from several optional/conditional pieces. Both live
// here rather than beside a page object, and neither imports Playwright/Page
// at all — this module is pure data construction, unit-testable without a
// browser.

/** A flat, mostly-uniform user record — the shape most tests need "a valid user" to have. */
export interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Creates a valid UserData record with generated defaults, overriding only
 * the fields the caller passes in. The email is timestamped + suffixed with
 * a random string so parallel tests (and repeated runs against the shared
 * live demo site) never collide on the same address.
 */
export function createUser(overrides: Partial<UserData> = {}): UserData {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    email: `user_${uniqueSuffix}@example.com`,
    password: "Test@1234",
    firstName: "Test",
    lastName: "User",
    ...overrides,
  };
}

/**
 * The registration form's data: every flat UserData field, plus the
 * optional/conditional pieces the form itself may offer (gender, newsletter
 * opt-in, company name). Individual fields are optional here because not
 * every registration form exposes all of them — see
 * pages/registration.page.ts for which of these the live
 * demowebshop.tricentis.com/register form actually renders.
 */
export interface RegistrationData extends UserData {
  gender?: "M" | "F";
  newsletter?: boolean;
  companyName?: string;
}

/**
 * Fluent builder for RegistrationData. Registration has several independent
 * optional toggles (gender, newsletter, company name) on top of the flat
 * user fields, so a builder lets a test read, at the call site, exactly
 * which non-default choices it's making — instead of a large inline options
 * object. `.build()` spreads `createUser()`'s output as its baseline
 * defaults, then layers whatever the fluent methods set on top.
 */
export class RegistrationDataBuilder {
  private overrides: Partial<RegistrationData> = {};

  /** Sets the gender selection ("M" or "F"). */
  withGender(gender: "M" | "F"): this {
    this.overrides.gender = gender;
    return this;
  }

  /** Sets whether the built registration opts into the newsletter. */
  withNewsletter(subscribed: boolean): this {
    this.overrides.newsletter = subscribed;
    return this;
  }

  /** Sets the company name field. */
  withCompanyName(name: string): this {
    this.overrides.companyName = name;
    return this;
  }

  /** Overrides any flat UserData field (email, password, firstName, lastName). */
  withUser(overrides: Partial<UserData>): this {
    Object.assign(this.overrides, overrides);
    return this;
  }

  /** Builds the final RegistrationData, layering builder choices over createUser()'s defaults. */
  build(): RegistrationData {
    return { ...createUser(), ...this.overrides };
  }
}

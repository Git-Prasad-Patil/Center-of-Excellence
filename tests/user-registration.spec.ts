import { test, expect } from "../utils/fixtures";
import { RegistrationDataBuilder } from "../utils/test-data-factory";

// Exercises RegistrationPage (pages/registration.page.ts) against the live
// registration form at https://demowebshop.tricentis.com/register. Data is
// built via RegistrationDataBuilder, demonstrating a non-default choice
// (opting into the newsletter flag) at the call site; the factory underneath
// generates a timestamped/random email so this test is safe to re-run
// against the shared live site without colliding with a previous run's data.
test("Registering with valid details shows a completion confirmation", async ({
  registrationPage,
}) => {
  const registrationData = new RegistrationDataBuilder().withGender("F").withNewsletter(true).build();

  await registrationPage.goto();
  await registrationPage.register(registrationData);

  expect(await registrationPage.isRegistrationSuccessful()).toBe(true);
  expect(await registrationPage.getConfirmationMessage()).toContain("Your registration completed");
});

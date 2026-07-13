import { When, Then, DataTable } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { PlaywrightWorld } from "../support/world";
import { CartPage, SignupLoginPage, AccountInformationPage, SignupDetails } from "../support/pages";

When("I register a new account with the following details:", async function (this: PlaywrightWorld, table: DataTable) {
  const details = table.hashes()[0] as unknown as SignupDetails;
  // Appending a run-time-unique suffix keeps the scenario re-runnable —
  // automationexercise.com rejects signup with an email that already exists.
  const email = `${details.emailPrefix}.${Date.now()}@example.com`;

  const cart = new CartPage(this.page);
  await cart.goto();
  await cart.proceedToCheckout();
  await cart.goToLoginFromCheckoutModal();

  const signupLogin = new SignupLoginPage(this.page);
  await signupLogin.startSignup(details.namePrefix, email);

  await new AccountInformationPage(this.page).fillAndSubmit(details, { day: "10", month: "5", year: "1990" });
  await new AccountInformationPage(this.page).continueAfterAccountCreated();

  this.createdAccountEmail = email;
});

When("I attempt to log in with email {string} and password {string}", async function (this: PlaywrightWorld, email: string, password: string) {
  const signupLogin = new SignupLoginPage(this.page);
  await signupLogin.goto();
  await signupLogin.login(email, password);
});

Then("I should see an error that my email or password is incorrect", async function (this: PlaywrightWorld) {
  await expect(new SignupLoginPage(this.page).loginErrorMessage()).toBeVisible();
});

import { When, Then, DataTable } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { PlaywrightWorld } from "../support/world";
import { CartPage, CheckoutPage, PaymentPage, CardDetails } from "../support/pages";

When("I proceed to checkout and place the order with the comment {string}", async function (this: PlaywrightWorld, comment: string) {
  const cart = new CartPage(this.page);
  await cart.goto();
  await cart.proceedToCheckout();
  await new CheckoutPage(this.page).placeOrderWithComment(comment);
});

When("I pay with the following card details:", async function (this: PlaywrightWorld, table: DataTable) {
  const cardDetails = table.hashes()[0] as unknown as CardDetails;
  await new PaymentPage(this.page).pay(cardDetails);
});

Then("I should see an order confirmation", async function (this: PlaywrightWorld) {
  await expect(new PaymentPage(this.page).orderConfirmationHeading()).toBeVisible();
});

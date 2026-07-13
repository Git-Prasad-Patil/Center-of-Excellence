import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { PlaywrightWorld } from "../support/world";
import { HomePage, ProductsPage, ProductDetailsPage, CartPage } from "../support/pages";
import { parsePrice } from "../support/money";

// Reused by the direct "add to cart" action and the "Given I have added X"
// setup step, so a scenario can either exercise adding-to-cart as the
// behaviour under test, or use it purely as a precondition. Goes via the
// product detail page rather than the listing page's hover overlay: the
// overlay's "Add to cart" click is unreliable under a headless browser
// (the click registers but the site's JS doesn't always open the cart
// modal), whereas the detail page's plain, always-visible button is not.
async function searchAndAddProduct(world: PlaywrightWorld, productName: string) {
  await new HomePage(world.page).search(productName);
  await new ProductsPage(world.page).openProductDetails(productName);
  await new ProductDetailsPage(world.page).addToCart();
}

When("I add {string} to the cart", async function (this: PlaywrightWorld, productName: string) {
  await searchAndAddProduct(this, productName);
});

Given("I have added {string} to the cart", async function (this: PlaywrightWorld, productName: string) {
  await searchAndAddProduct(this, productName);
});

When("I add the following products to the cart:", async function (this: PlaywrightWorld, table: DataTable) {
  for (const row of table.hashes()) {
    await searchAndAddProduct(this, row.product);
    await new ProductsPage(this.page).continueShoppingFromModal();
  }
});

When("I add {string} to the cart with a quantity of {int}", async function (this: PlaywrightWorld, productName: string, quantity: number) {
  await new HomePage(this.page).search(productName);
  await new ProductsPage(this.page).openProductDetails(productName);

  const details = new ProductDetailsPage(this.page);
  this.capturedUnitPrice = parsePrice(await details.unitPriceText().innerText());
  await details.setQuantity(quantity);
  await details.addToCart();
});

Then("I should see a confirmation that the product was added to the cart", async function (this: PlaywrightWorld) {
  await expect(new ProductsPage(this.page).addToCartModal()).toContainText("added to cart");
});

Then("my cart should contain {string}", async function (this: PlaywrightWorld, productName: string) {
  await new ProductsPage(this.page).viewCartFromModal();
  await expect(new CartPage(this.page).row(productName)).toBeVisible();
});

Then("my cart should contain {int} line item(s)", async function (this: PlaywrightWorld, expectedCount: number) {
  const cart = new CartPage(this.page);
  await cart.goto();
  await expect(cart.rows()).toHaveCount(expectedCount);
});

Then("the cart line for {string} should total {int} times its unit price", async function (this: PlaywrightWorld, productName: string, multiplier: number) {
  const cart = new CartPage(this.page);
  await cart.goto();
  const lineTotal = parsePrice(await cart.lineTotal(productName).innerText());
  expect(this.capturedUnitPrice).toBeDefined();
  expect(lineTotal).toBeCloseTo(this.capturedUnitPrice! * multiplier, 2);
});

When("I remove {string} from the cart", async function (this: PlaywrightWorld, productName: string) {
  const cart = new CartPage(this.page);
  await cart.goto();
  await cart.remove(productName);
});

Then("my shopping cart should be empty", async function (this: PlaywrightWorld) {
  await expect(new CartPage(this.page).emptyCartMessage()).toBeVisible();
});

When("I try to proceed to checkout without logging in", async function (this: PlaywrightWorld) {
  const cart = new CartPage(this.page);
  await cart.goto();
  await cart.proceedToCheckout();
});

Then("I should be prompted to register or login before checking out", async function (this: PlaywrightWorld) {
  await expect(new CartPage(this.page).checkoutModal()).toContainText("Register / Login");
});

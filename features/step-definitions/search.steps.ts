import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { PlaywrightWorld } from "../support/world";
import { HomePage, ProductsPage } from "../support/pages";

// One parameterized step reused by both an explicit "When" action and a
// "Given" precondition, so scenarios can either search as the action under
// test or use a search as setup for a later cart/checkout step.
async function searchStore(world: PlaywrightWorld, term: string) {
  await new HomePage(world.page).search(term);
}

When("I search the store for {string}", async function (this: PlaywrightWorld, term: string) {
  await searchStore(this, term);
});

Given("I have searched the store for {string}", async function (this: PlaywrightWorld, term: string) {
  await searchStore(this, term);
});

Then("the search results should include a product named {string}", async function (this: PlaywrightWorld, productName: string) {
  await expect(new ProductsPage(this.page).productItem(productName)).toBeVisible();
});

Then("I should see zero products in the search results", async function (this: PlaywrightWorld) {
  const products = new ProductsPage(this.page);
  await expect(products.searchedProductsHeading()).toBeVisible();
  await expect(products.productCount()).toHaveCount(0);
});

import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { PlaywrightWorld } from "../support/world";
import { HomePage } from "../support/pages";

Given("I am on the Automation Exercise home page", async function (this: PlaywrightWorld) {
  await new HomePage(this.page).goto();
});

Then("the store should respond without an application error", async function (this: PlaywrightWorld) {
  const title = await this.page.title();
  expect(title.toLowerCase()).not.toContain("error");
  await expect(this.page.locator("body")).toBeVisible();
});

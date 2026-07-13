import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, type Browser } from "@playwright/test";
import { PlaywrightWorld } from "./world";
import { AccountPage } from "./pages";

setDefaultTimeout(60 * 1000);

let browser: Browser;

BeforeAll(async function () {
  browser = await chromium.launch({ headless: process.env.HEADLESS !== "false" });
});

// A fresh context+page per scenario is what gives each scenario test
// isolation (own cookies/localStorage/cart) without paying to relaunch
// the whole browser every time.
Before(async function (this: PlaywrightWorld) {
  this.browser = browser;
  this.context = await browser.newContext();
  this.page = await this.context.newPage();
});

After(async function (this: PlaywrightWorld, { result }) {
  if (result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot();
    this.attach(screenshot, "image/png");
  }

  if (this.createdAccountEmail && this.page) {
    // Best-effort cleanup so the shared demo site doesn't accumulate
    // throwaway accounts; a cleanup failure shouldn't mask the actual
    // scenario result, so it's swallowed rather than re-thrown.
    await new AccountPage(this.page).deleteAccount().catch(() => undefined);
  }

  await this.page?.close();
  await this.context?.close();
});

AfterAll(async function () {
  await browser?.close();
});

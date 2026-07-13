import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "@playwright/test";

/**
 * Shared per-scenario state. Kept intentionally small: a Playwright page,
 * and the handful of values steps need to hand off to later steps
 * (e.g. a unit price captured in a When so a Then can do the math).
 */
export class PlaywrightWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  capturedUnitPrice?: number;
  // Set when a scenario signs up a new account, so the After hook can
  // delete it afterwards and avoid leaving throwaway accounts behind on
  // the shared demo site.
  createdAccountEmail?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(PlaywrightWorld);

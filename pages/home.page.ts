import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { HeaderNavComponent } from "./components/header-nav.component";
import { NotificationBarComponent } from "./components/notification-bar.component";

const HOME_URL = "https://demowebshop.tricentis.com/";

/**
 * HomePage models https://demowebshop.tricentis.com/. It composes the
 * site-wide HeaderNavComponent and NotificationBarComponent as properties
 * rather than re-declaring their locators — per
 * "DayNine - Page Object Model Depth & Framework Architecture/03-component-object-model.md",
 * component objects are composed into whichever page object needs them.
 * That composition is deliberately done here, not inside BasePage: not
 * every page necessarily needs the notification bar, so BasePage stays
 * generic and HomePage stays responsible for wiring up what it uses.
 *
 * Only page-specific concerns (the welcome banner, the page title) live
 * directly on HomePage; everything else routes through the composed
 * components or BasePage's shared helpers.
 */
export class HomePage extends BasePage {
  readonly headerNav: HeaderNavComponent;
  readonly notificationBar: NotificationBarComponent;

  private readonly welcomeText: Locator;

  constructor(page: Page) {
    super(page);
    this.headerNav = new HeaderNavComponent(page);
    this.notificationBar = new NotificationBarComponent(page);
    this.welcomeText = page.getByText("Welcome to our store");
  }

  /** Navigates to the homepage. */
  async goto(): Promise<void> {
    await super.goto(HOME_URL);
  }

  /** Returns the homepage's welcome banner text. */
  async getWelcomeText(): Promise<string> {
    await this.waitForVisible(this.welcomeText);
    return this.welcomeText.innerText();
  }

  /** Returns the current page title. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }
}

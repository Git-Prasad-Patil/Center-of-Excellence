import { Locator, Page } from "@playwright/test";

// NotificationBarComponent models the newsletter subscribe box's inline
// result notification on https://demowebshop.tricentis.com/
// (#newsletter-subscribe-block / #newsletter-result-block).
//
// Verified live before building this: the subscribe block is rendered on
// every page checked (home, register, login, category pages) as part of the
// site-wide sidebar — not just the homepage — so it recurs across pages
// exactly like the header does, which is the same "extract a Component
// Object" trigger described in
// "DayNine - Page Object Model Depth & Framework Architecture/03-component-object-model.md".
// The result block itself is empty/hidden until the newsletter AJAX call
// resolves, then becomes visible with a confirmation message — confirmed by
// driving the real subscribe flow against the live site rather than
// guessing at selectors.
//
// Not extended from BasePage: composed into page objects instead, same
// reasoning as HeaderNavComponent.
export class NotificationBarComponent {
  private readonly emailInput: Locator;
  private readonly subscribeButton: Locator;
  private readonly resultBlock: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.locator("#newsletter-email");
    this.subscribeButton = page.locator("#newsletter-subscribe-button");
    this.resultBlock = page.locator("#newsletter-result-block");
  }

  /**
   * Fills in the newsletter email field and submits the subscribe request,
   * then waits for the confirmation notification to appear so callers can
   * immediately read it via getMessage()/isVisible() without racing the
   * AJAX call.
   */
  async subscribe(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.subscribeButton.click();
    await this.resultBlock.waitFor({ state: "visible" });
  }

  /** Returns the notification's current message text (a meaningful type, not the raw locator). */
  async getMessage(): Promise<string> {
    return (await this.resultBlock.innerText()).trim();
  }

  /** Whether the notification is currently shown — it has no content/visible box until an action populates it. */
  async isVisible(): Promise<boolean> {
    return this.resultBlock.isVisible();
  }
}

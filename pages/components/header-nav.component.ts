import { Locator, Page } from "@playwright/test";

// HeaderNavComponent models the header nav bar (.header-links) on
// https://demowebshop.tricentis.com/ — Register, Log in, the shopping cart
// summary, and the wishlist summary. Verified live: this exact markup
// (a.ico-register, a.ico-login, #topcartlink .cart-qty, a.ico-wishlist
// .wishlist-qty) recurs unchanged across every page checked (home, register,
// login, category pages), which is precisely the "same locator on two-plus
// pages" trigger for extracting a Component Object instead of letting each
// page object re-declare it (see
// "DayNine - Page Object Model Depth & Framework Architecture/03-component-object-model.md").
//
// Deliberately does NOT extend BasePage: per those notes, component objects
// are *composed* into whatever page object currently renders them, not part
// of the page inheritance chain. It still accepts a Page the same way
// BasePage does, since it needs to build its own locators.
export class HeaderNavComponent {
  private readonly registerLink: Locator;
  private readonly loginLink: Locator;
  private readonly cartQty: Locator;
  private readonly wishlistQty: Locator;

  constructor(private readonly page: Page) {
    this.registerLink = page.locator("a.ico-register");
    this.loginLink = page.locator("a.ico-login");
    this.cartQty = page.locator("#topcartlink .cart-qty");
    this.wishlistQty = page.locator("a.ico-wishlist .wishlist-qty");
  }

  /**
   * Clicks the Register link. Accepts the same options Playwright's own
   * `.click()` takes (notably `force`) so a caller that wants to
   * demonstrate bypassing actionability checks can still ask for that
   * explicitly at the call site — the locator stays encapsulated here,
   * but the choice of *how* to click is the caller's, not baked in.
   */
  async clickRegister(options?: { force?: boolean }): Promise<void> {
    await this.registerLink.click(options);
  }

  /** Clicks the Log in link. */
  async clickLogin(): Promise<void> {
    await this.loginLink.click();
  }

  /**
   * Returns the shopping cart item count as a number, parsed out of the
   * cart summary link text (e.g. "Shopping cart (0)" -> 0). Returning a
   * number instead of the raw "(0)" string is the "meaningful type" that
   * Fowler's granularity guidance asks accessor methods for.
   */
  async getCartItemCount(): Promise<number> {
    return this.parseCount(await this.cartQty.innerText());
  }

  /** Returns the wishlist item count as a number, parsed the same way. */
  async getWishlistItemCount(): Promise<number> {
    return this.parseCount(await this.wishlistQty.innerText());
  }

  private parseCount(text: string): number {
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }
}

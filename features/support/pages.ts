import type { Page } from "@playwright/test";

/**
 * Thin page objects for automationexercise.com. Step definitions call
 * these instead of embedding locators directly, so a markup change only
 * requires editing one place, and the same locator logic is reused
 * across every step that touches a given page.
 */

export const BASE_URL = "https://automationexercise.com";

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(BASE_URL);
  }

  async goToProducts() {
    await this.page.locator('a[href="/products"]').click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async search(term: string) {
    await this.goToProducts();
    await this.page.fill("#search_product", term);
    await this.page.click("#submit_search");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async goToSignupLogin() {
    await this.page.locator('a[href="/login"]').click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  loggedInAsIndicator() {
    return this.page.getByText("Logged in as", { exact: false });
  }
}

export class ProductsPage {
  constructor(private readonly page: Page) {}

  productItem(name: string) {
    return this.page.locator(".product-image-wrapper", { hasText: name }).first();
  }

  productCount() {
    return this.page.locator(".product-image-wrapper");
  }

  searchedProductsHeading() {
    return this.page.getByRole("heading", { name: "Searched Products" });
  }

  async openProductDetails(productName: string) {
    await this.productItem(productName).getByRole("link", { name: "View Product" }).click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  addToCartModal() {
    return this.page.locator("#cartModal");
  }

  async viewCartFromModal() {
    await this.page.locator("#cartModal").getByRole("link", { name: "View Cart" }).click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async continueShoppingFromModal() {
    await this.page.locator("#cartModal").getByRole("button", { name: "Continue Shopping" }).click();
  }
}

export class ProductDetailsPage {
  constructor(private readonly page: Page) {}

  unitPriceText() {
    return this.page.locator(".product-information span span");
  }

  async setQuantity(quantity: number) {
    await this.page.fill("#quantity", String(quantity));
  }

  async addToCart() {
    await this.page.locator("button.cart").click();
    // The add-to-cart click triggers an AJAX call before the modal appears;
    // waiting for the modal is what proves the cart was actually updated
    // server-side before a later step navigates away.
    await this.page.locator("#cartModal").waitFor({ state: "visible" });
  }
}

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(`${BASE_URL}/view_cart`);
  }

  rows() {
    return this.page.locator("#cart_info tbody tr");
  }

  row(productName: string) {
    return this.page.locator("#cart_info tbody tr", { hasText: productName });
  }

  lineTotal(productName: string) {
    return this.row(productName).locator(".cart_total_price");
  }

  async remove(productName: string) {
    await this.row(productName).locator("a.cart_quantity_delete").click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  emptyCartMessage() {
    return this.page.locator("#empty_cart");
  }

  async proceedToCheckout() {
    await this.page.getByText("Proceed To Checkout").click();
  }

  checkoutModal() {
    return this.page.locator("#checkoutModal");
  }

  async goToLoginFromCheckoutModal() {
    await this.page.locator("#checkoutModal").getByRole("link", { name: "Register / Login" }).click();
    await this.page.waitForLoadState("domcontentloaded");
  }
}

export interface SignupDetails {
  namePrefix: string;
  emailPrefix: string;
  password: string;
  firstName: string;
  lastName: string;
  address1: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobile: string;
}

export class SignupLoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(`${BASE_URL}/login`);
  }

  async startSignup(name: string, email: string) {
    await this.page.fill('input[data-qa="signup-name"]', name);
    await this.page.fill('input[data-qa="signup-email"]', email);
    await this.page.click('button[data-qa="signup-button"]');
    await this.page.waitForLoadState("domcontentloaded");
  }

  async login(email: string, password: string) {
    await this.page.fill('input[data-qa="login-email"]', email);
    await this.page.fill('input[data-qa="login-password"]', password);
    await this.page.click('button[data-qa="login-button"]');
    await this.page.waitForLoadState("domcontentloaded");
  }

  loginErrorMessage() {
    return this.page.getByText("Your email or password is incorrect!", { exact: false });
  }
}

export class AccountInformationPage {
  constructor(private readonly page: Page) {}

  async fillAndSubmit(details: SignupDetails, dateOfBirth: { day: string; month: string; year: string }) {
    await this.page.check("#id_gender1");
    await this.page.fill("#password", details.password);
    await this.page.selectOption("#days", dateOfBirth.day);
    await this.page.selectOption("#months", dateOfBirth.month);
    await this.page.selectOption("#years", dateOfBirth.year);
    await this.page.fill("#first_name", details.firstName);
    await this.page.fill("#last_name", details.lastName);
    await this.page.fill("#address1", details.address1);
    await this.page.selectOption("#country", details.country);
    await this.page.fill("#state", details.state);
    await this.page.fill("#city", details.city);
    await this.page.fill("#zipcode", details.zipcode);
    await this.page.fill("#mobile_number", details.mobile);
    await this.page.click('button[data-qa="create-account"]');
    await this.page.waitForLoadState("domcontentloaded");
  }

  async continueAfterAccountCreated() {
    await this.page.click('a[data-qa="continue-button"]');
    await this.page.waitForLoadState("domcontentloaded");
  }
}

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async placeOrderWithComment(comment: string) {
    await this.page.fill('textarea[name="message"]', comment);
    await this.page.getByRole("link", { name: "Place Order" }).click();
    await this.page.waitForLoadState("domcontentloaded");
  }
}

export interface CardDetails {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

export class PaymentPage {
  constructor(private readonly page: Page) {}

  async pay(details: CardDetails) {
    await this.page.fill('input[data-qa="name-on-card"]', details.nameOnCard);
    await this.page.fill('input[data-qa="card-number"]', details.cardNumber);
    await this.page.fill('input[data-qa="cvc"]', details.cvc);
    await this.page.fill('input[data-qa="expiry-month"]', details.expiryMonth);
    await this.page.fill('input[data-qa="expiry-year"]', details.expiryYear);
    await this.page.click('button[data-qa="pay-button"]');
    await this.page.waitForLoadState("domcontentloaded");
  }

  orderConfirmationHeading() {
    return this.page.getByRole("heading", { name: "Order Placed!" });
  }
}

export class AccountPage {
  constructor(private readonly page: Page) {}

  async deleteAccount() {
    await this.page.goto(`${BASE_URL}/delete_account`);
  }
}

import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { RegistrationData } from "../utils/test-data-factory";

const REGISTER_URL = "https://demowebshop.tricentis.com/register";

/**
 * RegistrationPage models https://demowebshop.tricentis.com/register.
 *
 * Verified live before building this: the form's "Your Personal Details"
 * fieldset renders gender radios (#gender-male/#gender-female, optional —
 * no red asterisk in the markup) plus required FirstName/LastName/Email
 * text inputs, and a separate "Your Password" fieldset renders required
 * Password/ConfirmPassword fields. There is no company-name field and no
 * newsletter checkbox anywhere in this form (the only "newsletter" markup
 * on the page is the unrelated sidebar subscribe widget that
 * NotificationBarComponent already models). RegistrationData still carries
 * optional `companyName`/`newsletter` fields to match this suite's general
 * registration-data shape (see
 * "DayNine - Page Object Model Depth & Framework Architecture/06-test-data-management-strategies.md"),
 * but `register()` below has nothing to fill them into on this real form,
 * so it deliberately ignores them rather than pretending to submit them.
 *
 * Submitting valid data redirects to /registerresult/{id} and renders a
 * `.result` element reading exactly "Your registration completed".
 */
export class RegistrationPage extends BasePage {
  private readonly genderMaleRadio: Locator;
  private readonly genderFemaleRadio: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly registerButton: Locator;
  private readonly confirmationResult: Locator;

  constructor(page: Page) {
    super(page);
    this.genderMaleRadio = page.locator("#gender-male");
    this.genderFemaleRadio = page.locator("#gender-female");
    this.firstNameInput = page.locator("#FirstName");
    this.lastNameInput = page.locator("#LastName");
    this.emailInput = page.locator("#Email");
    this.passwordInput = page.locator("#Password");
    this.confirmPasswordInput = page.locator("#ConfirmPassword");
    this.registerButton = page.locator("#register-button");
    this.confirmationResult = page.locator(".result");
  }

  /** Navigates to the registration page. */
  async goto(): Promise<void> {
    await super.goto(REGISTER_URL);
  }

  /**
   * Fills every field the live form actually renders from the passed
   * RegistrationData (gender is only selected if provided, since the form
   * treats it as optional) and submits. `companyName`/`newsletter` on the
   * data object have no corresponding field on this form and are not used —
   * see the class-level comment for why.
   */
  async register(data: RegistrationData): Promise<void> {
    try {
      if (data.gender === "M") {
        await this.genderMaleRadio.check();
      } else if (data.gender === "F") {
        await this.genderFemaleRadio.check();
      }

      await this.firstNameInput.fill(data.firstName);
      await this.lastNameInput.fill(data.lastName);
      await this.emailInput.fill(data.email);
      await this.passwordInput.fill(data.password);
      await this.confirmPasswordInput.fill(data.password);

      this.log(`Submitting registration for ${data.email}`);
      await this.registerButton.click();
      await this.waitForVisible(this.confirmationResult);
    } catch (error) {
      await this.captureErrorContext(error, "registration-submit");
      throw error;
    }
  }

  /** Returns the post-submit confirmation message text (e.g. "Your registration completed"). */
  async getConfirmationMessage(): Promise<string> {
    return (await this.confirmationResult.innerText()).trim();
  }

  /** Whether registration succeeded, based on the confirmation message's content. */
  async isRegistrationSuccessful(): Promise<boolean> {
    return (await this.getConfirmationMessage()).includes("Your registration completed");
  }
}

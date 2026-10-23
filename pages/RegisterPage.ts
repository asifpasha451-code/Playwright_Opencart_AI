import { expect, Locator, Page } from '@playwright/test';

export class RegisterPage {
  // Locators
  private readonly registerHeading: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly telephoneInput: Locator;
  private readonly passwordInput: Locator;
  private readonly passwordConfirmInput: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly continueButton: Locator;
  private readonly accountCreatedHeading: Locator;
  private readonly registrationErrors: Locator;

  constructor(page: Page) {
    // Initialize locators with CSS selectors
    this.registerHeading = page.getByRole('heading', { name: 'Register Account' });
    this.firstNameInput = page.getByLabel('First Name');
    this.lastNameInput = page.getByLabel('Last Name');
    this.emailInput = page.getByLabel('E-Mail');
    this.telephoneInput = page.getByLabel('Telephone');
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.passwordConfirmInput = page.getByLabel('Password Confirm', { exact: true });
    this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.accountCreatedHeading = page.getByRole('heading', { name: 'Your Account Has Been Created!' });
    this.registrationErrors = page.locator(
      '.alert-danger:visible, .text-danger:visible, .invalid-feedback.d-block:visible',
    );
  }

  /**
   * Verifies the registration page is displayed.
   * @returns Promise<boolean> - true if the registration page is displayed
   */
  async isRegistrationPageExists(): Promise<boolean> {
    return this.registerHeading.isVisible();
  }

  async waitForRegistrationPage(): Promise<void> {
    await expect(this.registerHeading, 'The registration form should load before filling it').toBeVisible();
  }

  /**
   * Fills the fields available on the registration form.
   * @param firstName - Customer first name
   * @param lastName - Customer last name
   * @param email - Customer email address
   * @param password - Customer password
   */
  async fillRegistrationForm(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    telephone: string,
  ): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    if (await this.telephoneInput.count()) {
      await this.telephoneInput.fill(telephone);
    }
    await this.passwordInput.fill(password);
    if (await this.passwordConfirmInput.count()) {
      await this.passwordConfirmInput.fill(password);
    }
  }

  /**
   * Accepts the Privacy Policy.
   */
  async acceptPrivacyPolicy(): Promise<void> {
    await this.privacyPolicyCheckbox.check();
  }

  /**
   * Submits the registration form.
   */
  async submitRegistration(): Promise<void> {
    await this.continueButton.click();
  }

  /**
   * Waits for the account-created confirmation.
   */
  async waitForAccountCreated(): Promise<void> {
    await expect(
      this.accountCreatedHeading.or(this.registrationErrors.first()),
      'Registration should succeed or show a validation error',
    ).toBeVisible();
    if (await this.registrationErrors.first().isVisible()) {
      const messages = (await this.registrationErrors.allInnerTexts()).join('; ');
      throw new Error(`Registration failed: ${messages}`);
    }
    await expect(this.accountCreatedHeading, 'Registration confirmation should be displayed').toBeVisible();
  }

  /**
   * Verifies the account-created confirmation.
   * @returns Promise<boolean> - true if the confirmation is displayed
   */
  async isAccountCreated(): Promise<boolean> {
    return this.accountCreatedHeading.isVisible();
  }
}

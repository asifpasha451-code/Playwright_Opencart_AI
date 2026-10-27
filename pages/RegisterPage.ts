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
  private readonly registrationWarning: Locator;

  constructor(page: Page) {
    // Initialize locators with CSS selectors
    this.registerHeading = page.getByRole('heading', { name: 'Register Account', exact: true });
    this.firstNameInput = page.locator('#input-firstname');
    this.lastNameInput = page.locator('#input-lastname');
    this.emailInput = page.locator('#input-email');
    this.telephoneInput = page.locator('#input-telephone');
    this.passwordInput = page.locator('#input-password');
    this.passwordConfirmInput = page.locator('#input-confirm');
    this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    this.accountCreatedHeading = page.getByRole('heading', {
      name: 'Your Account Has Been Created!',
      exact: true,
    });
    this.registrationWarning = page.locator('.alert.alert-danger');
  }

  /**
   * Waits for the registration form.
   */
  async waitForRegistrationPage(): Promise<void> {
    await expect(this.registerHeading, 'The registration form should be displayed').toBeVisible();
  }

  /**
   * Verifies the registration form is displayed.
   * @returns Promise<boolean> - true when the form heading is visible
   */
  async isRegistrationPageExists(): Promise<boolean> {
    return this.registerHeading.isVisible();
  }

  /**
   * Fills required registration data and optional fields supported by this OpenCart version.
   * @param firstName - Customer first name
   * @param lastName - Customer last name
   * @param email - Unique customer email
   * @param password - Customer password
   * @param telephone - Customer telephone when the form provides that field
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
    if (await this.privacyPolicyCheckbox.count()) {
      await this.privacyPolicyCheckbox.check();
    }
  }

  /**
   * Submits the registration form.
   */
  async submitRegistration(): Promise<void> {
    await this.continueButton.click();
  }

  /**
   * Waits for successful registration or returns the actual warning text.
   * @returns Promise<string> - Empty string on success or the displayed warning
   */
  async getRegistrationWarning(): Promise<string> {
    if (await this.registrationWarning.isVisible()) {
      return (await this.registrationWarning.innerText()).trim();
    }
    return '';
  }

  /**
   * Waits for the account-created confirmation.
   */
  async waitForAccountCreated(): Promise<void> {
    await expect(
      this.accountCreatedHeading,
      'OpenCart should show the account-created confirmation',
    ).toBeVisible();
  }

  /**
   * Verifies the account-created confirmation.
   * @returns Promise<boolean> - true when the confirmation heading is visible
   */
  async isAccountCreated(): Promise<boolean> {
    return this.accountCreatedHeading.isVisible();
  }
}

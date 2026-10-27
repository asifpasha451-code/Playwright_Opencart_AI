import { Locator, Page } from '@playwright/test';

export class LoginPage {
  // Locators
  private readonly returningCustomerHeading: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly accountDashboardHeading: Locator;
  private readonly loginWarning: Locator;

  constructor(page: Page) {
    // Initialize locators with CSS selectors
    this.returningCustomerHeading = page.getByRole('heading', { name: 'Returning Customer' });
    this.emailInput = page.locator('#input-email');
    this.passwordInput = page.locator('#input-password');
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.accountDashboardHeading = page.getByRole('heading', { name: 'My Account', exact: true, level: 1 });
    this.loginWarning = page.locator('.alert.alert-danger');
  }

  /**
   * Verifies the login form is displayed.
   * @returns Promise<boolean> - true when the returning customer heading is visible
   */
  async isLoginPageExists(): Promise<boolean> {
    return this.returningCustomerHeading.isVisible();
  }

  /**
   * Submits customer credentials.
   * @param email - Customer email address
   * @param password - Customer password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Waits for the authenticated account dashboard.
   */
  async waitForAccountDashboard(): Promise<void> {
    await this.accountDashboardHeading.waitFor({ state: 'visible' });
  }

  /**
   * Verifies that the account dashboard is displayed.
   * @returns Promise<boolean> - true when the dashboard heading is visible
   */
  async isAccountDashboardExists(): Promise<boolean> {
    return this.accountDashboardHeading.isVisible();
  }

  /**
   * Waits for a failed-login warning and returns its text.
   * @returns Promise<string> - Actual warning text shown by OpenCart
   */
  async getLoginWarningText(): Promise<string> {
    await this.loginWarning.waitFor({ state: 'visible' });
    return (await this.loginWarning.innerText()).trim();
  }
}

import { Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

  // Locators
  private readonly returningCustomerHeading: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly editAccountLink: Locator;
  private readonly loginWarning: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.returningCustomerHeading = page.getByRole('heading', { name: 'Returning Customer' });
    this.emailInput = page.getByLabel('E-Mail Address');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.editAccountLink = page.getByRole('link', { name: 'Edit Account', exact: true });
    this.loginWarning = page.locator('.alert.alert-danger');
  }

  /**
   * Verifies the login page is displayed.
   * @returns Promise<boolean> - true if the login page is displayed
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
    await this.editAccountLink.waitFor({ state: 'visible' });
  }

  /**
   * Waits for either the authenticated dashboard or an unsuccessful-login warning.
   */
  async waitForLoginResult(): Promise<'success' | 'failure'> {
    return Promise.race([
      this.editAccountLink.waitFor({ state: 'visible' }).then(() => 'success' as const),
      this.loginWarning.waitFor({ state: 'visible' }).then(() => 'failure' as const),
    ]);
  }

  /**
   * Verifies that the account dashboard and authenticated navigation are displayed.
   * @returns Promise<boolean> - true if the dashboard and navigation are visible
   */
  async isAccountDashboardExists(): Promise<boolean> {
    return this.editAccountLink.isVisible();
  }

  /**
   * Waits for an unsuccessful-login warning and returns its text.
   * @returns Promise<string> - The warning displayed by OpenCart
   */
  async getLoginWarningText(): Promise<string> {
    await this.loginWarning.waitFor({ state: 'visible' });
    return (await this.loginWarning.innerText()).trim();
  }
}

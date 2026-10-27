import { Locator, Page } from '@playwright/test';

export class LogoutPage {
  // Locators
  private readonly logoutHeading: Locator;
  private readonly continueLink: Locator;

  constructor(page: Page) {
    // Initialize locators with CSS selectors
    this.logoutHeading = page.getByRole('heading', { name: 'Account Logout', exact: true });
    this.continueLink = page.getByRole('link', { name: 'Continue', exact: true });
  }

  /**
   * Verifies the logout confirmation page.
   * @returns Promise<boolean> - true when the logout heading is visible
   */
  async isLogoutPageExists(): Promise<boolean> {
    return this.logoutHeading.isVisible();
  }

  /**
   * Waits for the logout confirmation page.
   */
  async waitForLogoutPage(): Promise<void> {
    await this.logoutHeading.waitFor({ state: 'visible' });
  }

  /**
   * Continues from the logout confirmation to the storefront.
   */
  async clickContinue(): Promise<void> {
    await this.continueLink.click();
  }
}

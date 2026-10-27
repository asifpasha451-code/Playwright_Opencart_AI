import { Locator, Page } from '@playwright/test';

export class MyAccountPage {
  private readonly page: Page;

  // Locators
  private readonly myAccountHeading: Locator;
  private readonly editAccountLink: Locator;
  private readonly accountLogoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.myAccountHeading = page.getByRole('heading', { name: 'My Account', exact: true, level: 1 });
    this.editAccountLink = page.getByRole('link', { name: 'Edit Account', exact: true });
    this.accountLogoutLink = page.locator('#top').getByRole('link', { name: 'Logout', exact: true });
  }

  /**
   * Waits for the authenticated account dashboard.
   */
  async waitForMyAccountPage(): Promise<void> {
    await this.myAccountHeading.waitFor({ state: 'visible' });
  }

  /**
   * Verifies the authenticated account dashboard is displayed.
   * @returns Promise<boolean> - true when account heading and account navigation appear
   */
  async isMyAccountPageExists(): Promise<boolean> {
    return (await this.myAccountHeading.isVisible()) && (await this.editAccountLink.isVisible());
  }

  /**
   * Verifies authenticated account navigation is available.
   * @returns Promise<boolean> - true when the account navigation is visible
   */
  async isAuthenticated(): Promise<boolean> {
    return this.editAccountLink.isVisible();
  }

  /**
   * Opens the account menu and signs out.
   */
  async clickLogout(): Promise<void> {
    await this.page.locator('#top')
      .getByRole('button', { name: 'My Account', exact: true })
      .click();
    await this.accountLogoutLink.waitFor({ state: 'visible' });
    await this.accountLogoutLink.click();
  }
}

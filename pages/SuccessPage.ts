import { Locator, Page } from '@playwright/test';

export class SuccessPage {
  // Locators
  private readonly successHeading: Locator;
  private readonly continueLink: Locator;

  constructor(page: Page) {
    // Initialize locators with CSS selectors
    this.successHeading = page.getByRole('heading', {
      name: 'Your Account Has Been Created!',
      exact: true,
    });
    this.continueLink = page.getByRole('link', { name: 'Continue', exact: true });
  }

  /**
   * Verifies the account-created confirmation page.
   * @returns Promise<boolean> - true when the confirmation heading is visible
   */
  async isSuccessPageExists(): Promise<boolean> {
    return this.successHeading.isVisible();
  }

  /**
   * Waits for the account-created confirmation page.
   */
  async waitForSuccessPage(): Promise<void> {
    await this.successHeading.waitFor({ state: 'visible' });
  }

  /**
   * Clicks Continue after registration.
   */
  async clickContinue(): Promise<void> {
    await this.continueLink.click();
  }
}

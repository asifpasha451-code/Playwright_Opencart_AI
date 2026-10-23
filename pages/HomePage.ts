import { expect, Locator, Page } from '@playwright/test';

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly featuredHeading: Locator;
  private readonly myAccountMenuTrigger: Locator;
  private readonly registerLink: Locator;
  private readonly loginLink: Locator;
  private readonly logoutLink: Locator;
  private readonly searchInput: Locator;
  private readonly shoppingCartLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.featuredHeading = page.getByRole('heading', { name: 'Featured' });
    const topBar = page.locator('#top');
    this.myAccountMenuTrigger = topBar
      .getByRole('button', { name: 'My Account', exact: true })
      .or(topBar.locator('a[title="My Account"]'))
      .first();
    this.registerLink = page.locator('#top').getByRole('link', { name: 'Register', exact: true });
    this.loginLink = page.locator('#top').getByRole('link', { name: 'Login', exact: true });
    this.logoutLink = page.locator('#top').getByRole('link', { name: 'Logout', exact: true });
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    this.shoppingCartLink = page.getByRole('link', { name: 'Shopping Cart', exact: true });
  }

  /**
   * Verifies the storefront is displayed.
   * @returns Promise<boolean> - true if the storefront is displayed
   */
  async isHomePageExists(): Promise<boolean> {
    return this.featuredHeading.isVisible();
  }

  async waitForHomePage(): Promise<void> {
    await expect(this.featuredHeading, 'The storefront should load from WEB_APP_URL').toBeVisible();
  }

  /**
   * Opens the Register page from My Account.
   */
  async clickRegister(): Promise<void> {
    await this.myAccountMenuTrigger.click();
    await expect(this.registerLink, 'Register should appear in the My Account menu').toBeVisible();
    await this.registerLink.click();
  }

  /**
   * Opens the Login page from My Account.
   */
  async clickLogin(): Promise<void> {
    await this.myAccountMenuTrigger.click();
    await expect(this.loginLink, 'Login should appear in the My Account menu').toBeVisible();
    await this.loginLink.click();
  }

  /**
   * Logs out the current customer.
   */
  async clickLogout(): Promise<void> {
    await this.myAccountMenuTrigger.click();
    await expect(this.logoutLink, 'Logout should appear in the My Account menu').toBeVisible();
    await this.logoutLink.click();
  }

  /**
   * Searches the catalogue for a product.
   * @param productName - Product name to search for
   */
  async searchProduct(productName: string): Promise<void> {
    await this.searchInput.fill(productName);
    await this.searchInput.press('Enter');
    await this.page.getByRole('heading', { name: `Search - ${productName}` }).waitFor({ state: 'visible' });
  }

  /**
   * Opens the shopping cart from the storefront navigation.
   */
  async openShoppingCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }
}

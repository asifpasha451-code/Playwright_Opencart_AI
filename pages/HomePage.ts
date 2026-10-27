import { expect, Locator, Page } from '@playwright/test';

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly featuredHeading: Locator;
  private readonly myAccountButton: Locator;
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
    this.myAccountButton = topBar.getByRole('button', { name: 'My Account', exact: true });
    this.registerLink = topBar.getByRole('link', { name: 'Register', exact: true });
    this.loginLink = topBar.getByRole('link', { name: 'Login', exact: true });
    this.logoutLink = topBar.getByRole('link', { name: 'Logout', exact: true });
    this.searchInput = page.getByRole('textbox', { name: 'Search', exact: true });
    this.shoppingCartLink = topBar.getByRole('link', { name: 'Shopping Cart', exact: true });
  }

  /**
   * Verifies the OpenCart storefront is displayed.
   * @returns Promise<boolean> - true when the storefront is visible
   */
  async isHomePageExists(): Promise<boolean> {
    return this.featuredHeading.isVisible();
  }

  /**
   * Waits for the storefront's featured-products section.
   */
  async waitForHomePage(): Promise<void> {
    await expect(this.featuredHeading, 'OpenCart storefront should be displayed').toBeVisible();
  }

  /**
   * Opens the My Account dropdown.
   */
  async clickMyAccount(): Promise<void> {
    await expect(this.myAccountButton, 'The My Account menu should be visible').toBeVisible();
    await this.myAccountButton.click();
  }

  /**
   * Verifies the account menu trigger is available on the storefront.
   * @returns Promise<boolean> - true when the My Account trigger is visible
   */
  async isMyAccountMenuVisible(): Promise<boolean> {
    return this.myAccountButton.isVisible();
  }

  /**
   * Verifies the logout link is currently visible in the account dropdown.
   * @returns Promise<boolean> - true when the Logout link is visible
   */
  async isLogoutLinkAvailable(): Promise<boolean> {
    return this.logoutLink.isVisible();
  }

  /**
   * Opens the registration page from the My Account dropdown.
   */
  async clickRegister(): Promise<void> {
    await this.clickMyAccount();
    await expect(this.registerLink, 'Register should be visible in the account menu').toBeVisible();
    await this.registerLink.click();
    await this.page.waitForURL(/route=account\/register/);
  }

  /**
   * Opens the login page from the My Account dropdown.
   */
  async clickLogin(): Promise<void> {
    await this.clickMyAccount();
    await expect(this.loginLink, 'Login should be visible in the account menu').toBeVisible();
    await this.loginLink.click();
    await this.page.waitForURL(/route=account\/login/);
  }

  /**
   * Opens the logout confirmation from the authenticated account menu.
   */
  async clickLogout(): Promise<void> {
    await this.clickMyAccount();
    await expect(this.logoutLink, 'Logout should be visible in the account menu').toBeVisible();
    await this.logoutLink.click();
    await this.page.waitForURL(/route=account\/logout/);
  }

  /**
   * Searches the product catalog.
   * @param productName - Known product name to search for
   */
  async searchProduct(productName: string): Promise<void> {
    await this.searchInput.fill(productName);
    await this.searchInput.press('Enter');
    await this.page.waitForURL(/route=product\/search/);
  }

  /**
   * Opens the shopping cart.
   */
  async openShoppingCart(): Promise<void> {
    await this.shoppingCartLink.click();
    await this.page.waitForURL(/route=checkout\/cart/);
  }
}

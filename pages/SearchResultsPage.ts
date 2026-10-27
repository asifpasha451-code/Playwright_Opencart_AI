import { Locator, Page } from '@playwright/test';

export class SearchResultsPage {
  // Locators
  private readonly page: Page;
  private readonly searchHeading: Locator;
  private readonly content: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.searchHeading = page.getByRole('heading', { level: 1 });
    this.content = page.locator('#content');
  }

  /**
   * Waits for the search results heading.
   * @param productName - Searched product name
   */
  async waitForSearchResults(productName: string): Promise<void> {
    await this.searchHeading.filter({ hasText: `Search - ${productName}` }).waitFor({ state: 'visible' });
  }

  /**
   * Verifies the search results page is displayed.
   * @returns Promise<boolean> - true when a search heading is visible
   */
  async isSearchResultsPageExists(): Promise<boolean> {
    return this.searchHeading.isVisible();
  }

  /**
   * Verifies a product with the exact requested name appears in the results.
   * @param productName - Product name to find
   * @returns Promise<boolean> - true when the product result is visible
   */
  async isProductDisplayed(productName: string): Promise<boolean> {
    return this.productLink(productName).isVisible();
  }

  /**
   * Reads the exact product name displayed in search results.
   * @param productName - Product name to read
   * @returns Promise<string> - Product name from the result link
   */
  async getProductName(productName: string): Promise<string> {
    return (await this.productLink(productName).innerText()).trim();
  }

  /**
   * Opens the exact product result.
   * @param productName - Product name to open
   */
  async clickProduct(productName: string): Promise<void> {
    await this.productLink(productName).click();
  }

  private productLink(productName: string): Locator {
    const productHeading = this.content.getByRole('heading', { name: productName, exact: true });
    return productHeading.getByRole('link', { name: productName, exact: true });
  }
}

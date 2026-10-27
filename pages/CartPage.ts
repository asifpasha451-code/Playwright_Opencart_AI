import { Locator, Page } from '@playwright/test';

export class CartPage {
  // Locators
  private readonly page: Page;
  private readonly cartHeading: Locator;
  private readonly totalRows: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.cartHeading = page.getByRole('heading', { name: 'Shopping Cart', exact: false, level: 1 });
    this.totalRows = page.getByRole('row').filter({ hasText: /^\s*Total/ });
  }

  /**
   * Waits for the shopping-cart page.
   */
  async waitForCartPage(): Promise<void> {
    await this.cartHeading.waitFor({ state: 'visible' });
  }

  /**
   * Verifies the shopping-cart page is displayed.
   * @returns Promise<boolean> - true when the cart heading is visible
   */
  async isCartPageExists(): Promise<boolean> {
    return this.cartHeading.isVisible();
  }

  /**
   * Verifies a product is present in the cart.
   * @param productName - Expected cart product
   * @returns Promise<boolean> - true when a matching product row is visible
   */
  async hasProduct(productName: string): Promise<boolean> {
    return this.productRow(productName).isVisible();
  }

  /**
   * Waits for a product row in the cart.
   * @param productName - Expected cart product
   */
  async waitForProduct(productName: string): Promise<void> {
    await this.productRow(productName).waitFor({ state: 'visible' });
  }

  /**
   * Reads the quantity stored in the matching cart row.
   * @param productName - Product to inspect
   * @returns Promise<string> - Cart quantity
   */
  async getProductQuantity(productName: string): Promise<string> {
    return this.productRow(productName).locator('input[name="quantity"]').inputValue();
  }

  /**
   * Reads the unit price in the matching cart row.
   * @param productName - Product to inspect
   * @returns Promise<string> - Displayed unit price
   */
  async getProductUnitPrice(productName: string): Promise<string> {
    return (await this.productRow(productName).locator('td').nth(3).innerText()).trim();
  }

  /**
   * Reads the line total in the matching cart row.
   * @param productName - Product to inspect
   * @returns Promise<string> - Displayed line total
   */
  async getProductLineTotal(productName: string): Promise<string> {
    return (await this.productRow(productName).locator('td').nth(4).innerText()).trim();
  }

  /**
   * Reads the final cart total.
   * @returns Promise<string> - Displayed cart total
   */
  async getCartTotal(): Promise<string> {
    return (await this.totalRows.last().locator('td').last().innerText()).trim();
  }

  private productRow(productName: string): Locator {
    return this.page.locator('#shopping-cart tbody tr').filter({ hasText: productName });
  }
}

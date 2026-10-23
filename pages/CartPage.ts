import { expect, Locator, Page } from '@playwright/test';

export class CartPage {
  // Locators
  private readonly cartHeading: Locator;

  constructor(private readonly page: Page) {
    // Initialize locators with CSS selectors
    this.cartHeading = page.getByRole('heading', { name: /^Shopping Cart/ });
  }

  /**
   * Verifies the shopping cart page is displayed.
   * @returns Promise<boolean> - true if the cart page is displayed
   */
  async isCartPageExists(): Promise<boolean> {
    return this.cartHeading.isVisible();
  }

  async waitForCartPage(): Promise<void> {
    await expect(this.cartHeading, 'The shopping cart should open after adding the product').toBeVisible();
  }

  async waitForProduct(productName: string): Promise<void> {
    await expect(this.getProductRow(productName), `${productName} should appear in the cart`).toBeVisible();
  }

  /**
   * Checks whether the named product appears in a cart row.
   * @param productName - Product to find
   * @returns Promise<boolean> - true if the product is in the cart
   */
  async hasProduct(productName: string): Promise<boolean> {
    const productRow = this.getProductRow(productName);
    return (await productRow.count()) > 0;
  }

  /**
   * Reads the product quantity from its cart row.
   * @param productName - Product to inspect
   * @returns Promise<string> - Quantity displayed in the cart
   */
  async getProductQuantity(productName: string): Promise<string> {
    const productRow = this.getProductRow(productName);
    return productRow.locator('input[name^="quantity"]').inputValue();
  }

  /**
   * Reads the product unit price from its cart row.
   * @param productName - Product to inspect
   * @returns Promise<string> - Unit price displayed in the cart
   */
  async getProductUnitPrice(productName: string): Promise<string> {
    const productRow = this.getProductRow(productName);
    const priceCells = productRow.getByRole('cell').filter({ hasText: /^[€£$¥₹]\s?\d[\d,.]*$/ });
    return (await priceCells.first().innerText()).trim();
  }

  /**
   * Reads the product line total from its cart row.
   * @param productName - Product to inspect
   * @returns Promise<string> - Line total displayed in the cart
   */
  async getProductLineTotal(productName: string): Promise<string> {
    const productRow = this.getProductRow(productName);
    const priceCells = productRow.getByRole('cell').filter({ hasText: /^[€£$¥₹]\s?\d[\d,.]*$/ });
    return (await priceCells.last().innerText()).trim();
  }

  /**
   * Reads the cart's Total row.
   * @returns Promise<string> - Cart total displayed on the page
   */
  async getCartTotal(): Promise<string> {
    const totalRow = this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: /^Total:?$/ }),
    });
    return (await totalRow.getByRole('cell').nth(1).innerText()).trim();
  }

  private getProductRow(productName: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('link', { name: productName, exact: true }),
    });
  }
}

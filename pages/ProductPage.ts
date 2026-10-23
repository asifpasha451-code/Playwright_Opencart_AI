import { expect, Locator, Page } from '@playwright/test';

export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly addToCartButton: Locator;
  private readonly addToCartSuccess: Locator;
  private readonly addedProductCartLink: Locator;
  private readonly quantityInput: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.addToCartButton = page.getByRole('button', { name: 'Add to Cart', exact: true });
    this.addToCartSuccess = page.getByText('Success: You have added', { exact: false });
    this.addedProductCartLink = page
      .locator('.alert-success')
      .getByRole('link', { name: /shopping cart/i });
    this.quantityInput = page.locator('input[name="quantity"]');
  }

  /**
   * Opens a product from search results.
   * @param productName - Product name to open
   */
  async openProduct(productName: string): Promise<void> {
    await this.page.getByRole('link', { name: productName, exact: true }).first().click();
    await this.page.getByRole('heading', { name: productName, exact: true }).waitFor({ state: 'visible' });
  }

  /**
   * Verifies the product details page is displayed.
   * @param productName - Expected product name
   * @returns Promise<boolean> - true if the product details are displayed
   */
  async isProductDetailsPageExists(productName: string): Promise<boolean> {
    return this.page.getByRole('heading', { name: productName, exact: true }).isVisible();
  }

  async getProductPrice(): Promise<string> {
    const price = this.page.getByRole('heading', { name: /^[€£$¥₹]\s?\d[\d,.]*$/ }).first();
    await expect(price, 'The selected product should display a currency price').toBeVisible();
    return (await price.innerText()).trim();
  }

  /**
   * Adds the displayed product to the cart.
   */
  async addToCart(quantity: string): Promise<void> {
    await this.quantityInput.fill(quantity);
    await this.addToCartButton.click();
    await this.addToCartSuccess.waitFor({ state: 'visible' });
  }

  /**
   * Opens the cart after adding the product.
   */
  async openShoppingCart(): Promise<void> {
    await this.addedProductCartLink.click({ noWaitAfter: true });
  }
}

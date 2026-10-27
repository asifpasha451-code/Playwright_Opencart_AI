import { Locator, Page } from '@playwright/test';

export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly productHeading: Locator;
  private readonly productPrice: Locator;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.productHeading = page.getByRole('heading', { level: 1 });
    this.productPrice = page.locator('#content h2').first();
    this.quantityInput = page.locator('#input-quantity');
    this.addToCartButton = page.getByRole('button', { name: 'Add to Cart', exact: true });
    this.successMessage = page.locator('.alert.alert-success');
  }

  /**
   * Verifies the product detail page is displayed.
   * @returns Promise<boolean> - true when a product heading is visible
   */
  async isProductPageExists(): Promise<boolean> {
    return this.productHeading.isVisible();
  }

  /**
   * Verifies the expected product detail page is displayed.
   * @param productName - Expected product heading
   * @returns Promise<boolean> - true when the heading exactly matches
   */
  async isProductDetailsPageExists(productName: string): Promise<boolean> {
    return this.page.getByRole('heading', { name: productName, exact: true, level: 1 }).isVisible();
  }

  /**
   * Reads the displayed product price.
   * @returns Promise<string> - Product price as shown by OpenCart
   */
  async getProductPrice(): Promise<string> {
    return (await this.productPrice.innerText()).trim();
  }

  /**
   * Sets product quantity.
   * @param quantity - Requested quantity
   */
  async setQuantity(quantity: string): Promise<void> {
    await this.quantityInput.fill(quantity);
  }

  /**
   * Adds the displayed product to the shopping cart.
   */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    await this.successMessage.waitFor({ state: 'visible' });
  }

  /**
   * Verifies the product-added confirmation.
   * @returns Promise<boolean> - true when the success message is visible
   */
  async isSuccessMessageVisible(): Promise<boolean> {
    return this.successMessage.isVisible();
  }

  /**
   * Reads the product-added confirmation text.
   * @returns Promise<string> - Message shown after adding the product
   */
  async getSuccessMessage(): Promise<string> {
    return (await this.successMessage.innerText()).trim();
  }
}

import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Customer can add a product to the cart @master @sanity @regression @web', async ({
  homePage,
  searchResultsPage,
  productPage,
  cartPage,
}) => {
  const { productName, productQuantity } = Helper.getProductDetails();

  await test.step('1) Search for the product and open its details', async () => {
    await homePage.searchProduct(productName);
    await searchResultsPage.waitForSearchResults(productName);
    await searchResultsPage.clickProduct(productName);
    expect(await productPage.isProductDetailsPageExists(productName), 'The selected product page should open').toBe(
      true,
    );
  });

  await test.step('2) Set requested quantity and add the product', async () => {
    await productPage.setQuantity(productQuantity);
    await productPage.addToCart();
    expect(await productPage.isSuccessMessageVisible(), 'OpenCart should confirm the product was added').toBe(true);
    expect(await productPage.getSuccessMessage()).toContain(`Success: You have added ${productName}`);
  });

  await test.step('3) Verify product and quantity in the cart', async () => {
    await homePage.openShoppingCart();
    await cartPage.waitForCartPage();
    await cartPage.waitForProduct(productName);
    expect(await cartPage.hasProduct(productName), `${productName} should be present in the cart`).toBe(true);
    expect(await cartPage.getProductQuantity(productName), 'Cart quantity should match the requested quantity').toBe(
      productQuantity,
    );
  });

  console.log('✅ Product added to cart.');
});

import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Customer can search for a known product @master @sanity @regression @web', async ({
  homePage,
  searchResultsPage,
}) => {
  const { productName } = Helper.getProductDetails();

  await test.step('1) Search the catalog for the known product', async () => {
    await homePage.searchProduct(productName);
    await searchResultsPage.waitForSearchResults(productName);
  });

  await test.step('2) Verify the exact product appears in search results', async () => {
    expect(await searchResultsPage.isSearchResultsPageExists(), 'Product search results should be displayed').toBe(true);
    expect(await searchResultsPage.isProductDisplayed(productName), `${productName} should appear in results`).toBe(true);
    expect(await searchResultsPage.getProductName(productName), 'Result name should match the search criteria').toBe(
      productName,
    );
  });

  console.log('✅ Product search completed.');
});

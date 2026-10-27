import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('End-to-end customer shopping flow @master @sanity @regression @end-to-end @web', async ({
  homePage,
  registerPage,
  successPage,
  myAccountPage,
  logoutPage,
  loginPage,
  searchResultsPage,
  productPage,
  cartPage,
}) => {
  test.setTimeout(60_000);

  const firstName = RandomDataUtil.getFirstName();
  const lastName = RandomDataUtil.getLastName();
  const email = RandomDataUtil.getEmail().replace('@', `+${Date.now()}@`).toLowerCase();
  const telephone = RandomDataUtil.getPhoneNumber();
  const password = RandomDataUtil.getPassword(14);
  const { productName, productQuantity } = Helper.getProductDetails();

  await test.step('1) Register a new customer with unique data', async () => {
    await homePage.clickRegister();
    await registerPage.waitForRegistrationPage();
    await registerPage.fillRegistrationForm(firstName, lastName, email, password, telephone);
    await registerPage.acceptPrivacyPolicy();
    await registerPage.submitRegistration();
    await successPage.waitForSuccessPage();
    expect(await successPage.isSuccessPageExists(), 'Registration confirmation should be displayed').toBe(true);
    expect(await myAccountPage.isAuthenticated(), 'New account navigation should be available').toBe(true);
  });

  await test.step('2) Log out and sign in with the new customer', async () => {
    await homePage.clickLogout();
    await logoutPage.waitForLogoutPage();
    await logoutPage.clickContinue();
    await homePage.waitForHomePage();
    await homePage.clickLogin();
    await loginPage.login(email, password);
    await loginPage.waitForAccountDashboard();
    expect(await myAccountPage.isMyAccountPageExists(), 'New customer should reach My Account').toBe(true);
  });

  const productPrice = await test.step('3) Search for and open the known product', async () => {
    await homePage.searchProduct(productName);
    await searchResultsPage.waitForSearchResults(productName);
    expect(await searchResultsPage.isProductDisplayed(productName), `${productName} should appear in results`).toBe(
      true,
    );
    await searchResultsPage.clickProduct(productName);
    expect(await productPage.isProductDetailsPageExists(productName), 'Product details should open').toBe(true);
    return productPage.getProductPrice();
  });

  await test.step('4) Add the product to cart and open the cart', async () => {
    await productPage.setQuantity(productQuantity);
    await productPage.addToCart();
    expect(await productPage.getSuccessMessage()).toContain(`Success: You have added ${productName}`);
    await homePage.openShoppingCart();
    await cartPage.waitForCartPage();
  });

  await test.step('5) Verify cart product, quantity, unit price, line total, and cart total', async () => {
    await cartPage.waitForProduct(productName);
    expect(await cartPage.hasProduct(productName), `${productName} should be in the cart`).toBe(true);
    expect(await cartPage.getProductQuantity(productName), 'Quantity should match the request').toBe(productQuantity);

    const unitPrice = await cartPage.getProductUnitPrice(productName);
    const lineTotal = await cartPage.getProductLineTotal(productName);
    const cartTotal = await cartPage.getCartTotal();
    const expectedLineTotal = Helper.convertPriceToNumber(productPrice) * Number(productQuantity);

    expect(unitPrice, 'Cart unit price should match the product page').toBe(productPrice);
    expect(Helper.convertPriceToNumber(lineTotal), 'Line total should equal unit price times quantity').toBe(
      expectedLineTotal,
    );
    expect(Helper.convertPriceToNumber(cartTotal), 'Cart total should match the line total').toBe(expectedLineTotal);
  });

  console.log('✅ End-to-end customer shopping flow completed.');
});

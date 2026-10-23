import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('End-to-end customer shopping flow @master @sanity @regression @end-to-end @web', async ({
  cartPage,
  homePage,
  loginPage,
  productPage,
  registerPage,
}) => {
  test.setTimeout(120_000);

  const { productName, productQuantity } = Helper.getProductDetails();
  const firstName = RandomDataUtil.getFirstName();
  const lastName = RandomDataUtil.getLastName();
  const telephone = RandomDataUtil.getPhoneNumber();
  const email = RandomDataUtil.getEmail().replace('@', `+${Date.now()}@`);
  const password = RandomDataUtil.getPassword(14);

  await test.step('1) Register a new customer', async () => {
    await homePage.waitForHomePage();
    await homePage.clickRegister();
    await registerPage.waitForRegistrationPage();
    await registerPage.fillRegistrationForm(firstName, lastName, email, password, telephone);
    await registerPage.acceptPrivacyPolicy();
    await registerPage.submitRegistration();
    await registerPage.waitForAccountCreated();
    expect(await registerPage.isAccountCreated(), 'The new customer should be created').toBe(true);
  });

  await test.step('2) Log out and sign in with the new customer', async () => {
    await homePage.clickLogout();
    await homePage.clickLogin();
    expect(await loginPage.isLoginPageExists(), 'The login page should open after logout').toBe(true);
    await loginPage.login(email, password);
    await loginPage.waitForAccountDashboard();
    expect(await loginPage.isAccountDashboardExists(), 'The new customer should sign in successfully').toBe(true);
  });

  const productPrice = await test.step('3) Search for and open the known product', async () => {
    await homePage.searchProduct(productName);
    await productPage.openProduct(productName);
    expect(
      await productPage.isProductDetailsPageExists(productName),
      `${productName} details should open from search results`,
    ).toBe(true);
    return productPage.getProductPrice();
  });

  await test.step('4) Add the product to the cart and open the cart', async () => {
    await productPage.addToCart(productQuantity);
    await productPage.openShoppingCart();
    await cartPage.waitForCartPage();
  });

  await test.step('5) Verify cart product, quantity, price, and total', async () => {
    await cartPage.waitForProduct(productName);
    expect(await cartPage.hasProduct(productName), `${productName} should be in the cart`).toBe(true);
    expect(await cartPage.getProductQuantity(productName), 'Cart quantity should match requested quantity').toBe(
      productQuantity,
    );
    const cartUnitPrice = await cartPage.getProductUnitPrice(productName);
    const cartLineTotal = await cartPage.getProductLineTotal(productName);
    const cartTotal = await cartPage.getCartTotal();
    expect(cartUnitPrice, 'Cart unit price should match product page').toBe(productPrice);
    expect(Helper.convertPriceToNumber(cartLineTotal), 'Cart line total should equal unit price times quantity').toBe(
      Helper.convertPriceToNumber(cartUnitPrice) * Number(productQuantity),
    );
    expect(Helper.convertPriceToNumber(cartTotal), 'Cart total should match the cart line total').toBe(
      Helper.convertPriceToNumber(cartLineTotal),
    );
  });

  console.log('✅ End-to-end shopping journey completed successfully.');
});

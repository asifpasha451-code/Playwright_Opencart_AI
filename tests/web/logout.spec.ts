import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Customer can log out @master @sanity @regression @web', async ({
  homePage,
  loginPage,
  myAccountPage,
  logoutPage,
}) => {
  const { email, password } = Helper.getLoginDetails();

  await test.step('1) Log in with configured valid customer credentials', async () => {
    await homePage.clickLogin();
    expect(await loginPage.isLoginPageExists(), 'Login form should be displayed').toBe(true);
    await loginPage.login(email, password);
    await loginPage.waitForAccountDashboard();
    expect(await myAccountPage.isAuthenticated(), 'Customer should be authenticated before logout').toBe(true);
  });

  await test.step('2) Open account logout and verify confirmation', async () => {
    await homePage.clickLogout();
    await logoutPage.waitForLogoutPage();
    expect(await logoutPage.isLogoutPageExists(), 'Logout confirmation page should be displayed').toBe(true);
  });

  await test.step('3) Continue to storefront and verify account is signed out', async () => {
    await logoutPage.clickContinue();
    await homePage.waitForHomePage();
    await homePage.clickMyAccount();
    expect(await homePage.isMyAccountMenuVisible(), 'Storefront should be displayed after logout').toBe(true);
    expect(await homePage.isLogoutLinkAvailable(), 'Logout must not remain available after sign-out').toBe(false);
  });

  console.log('✅ Customer logout completed.');
});

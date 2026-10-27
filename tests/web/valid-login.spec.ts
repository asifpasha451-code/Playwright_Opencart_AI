import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Customer can log in with valid credentials @master @sanity @regression @web', async ({
  homePage,
  loginPage,
  myAccountPage,
}) => {
  const { email, password } = Helper.getLoginDetails();

  await test.step('1) Open My Account login page', async () => {
    await homePage.clickLogin();
    expect(await loginPage.isLoginPageExists(), 'Returning Customer login form should be visible').toBe(true);
  });

  await test.step('2) Submit configured valid customer credentials', async () => {
    await loginPage.login(email, password);
    await loginPage.waitForAccountDashboard();
  });

  await test.step('3) Verify authenticated My Account page and navigation', async () => {
    expect(await loginPage.isAccountDashboardExists(), 'Login should reach My Account').toBe(true);
    expect(await myAccountPage.isMyAccountPageExists(), 'Account dashboard navigation should be visible').toBe(true);
  });

  console.log('✅ Valid customer login completed.');
});

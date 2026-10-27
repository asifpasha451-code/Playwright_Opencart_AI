import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('Invalid customer login is rejected @master @sanity @regression @web', async ({
  homePage,
  loginPage,
  myAccountPage,
}) => {
  const invalidEmail = RandomDataUtil.getEmail().replace('@', `+invalid-${Date.now()}@`).toLowerCase();
  const invalidPassword = RandomDataUtil.getPassword(16);

  await test.step('1) Open My Account login page', async () => {
    await homePage.clickLogin();
    expect(await loginPage.isLoginPageExists(), 'Returning Customer login form should be visible').toBe(true);
  });

  await test.step('2) Submit invalid customer credentials', async () => {
    await loginPage.login(invalidEmail, invalidPassword);
  });

  await test.step('3) Verify the expected warning and unauthenticated state', async () => {
    const warning = await loginPage.getLoginWarningText();
    expect(warning, 'OpenCart should reject unmatched email and password').toContain(
      'Warning: No match for E-Mail Address and/or Password.',
    );
    expect(await myAccountPage.isAuthenticated(), 'Invalid credentials must not authenticate').toBe(false);
  });

  console.log('✅ Invalid customer login was rejected.');
});

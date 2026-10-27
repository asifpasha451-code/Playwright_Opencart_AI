import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('Customer registration succeeds @master @sanity @regression @web', async ({
  homePage,
  registerPage,
  successPage,
  myAccountPage,
}) => {
  const firstName = RandomDataUtil.getFirstName();
  const lastName = RandomDataUtil.getLastName();
  const email = RandomDataUtil.getEmail().replace('@', `+${Date.now()}@`).toLowerCase();
  const telephone = RandomDataUtil.getPhoneNumber();
  const password = RandomDataUtil.getPassword(14);

  await test.step('1) Open the registration page from My Account', async () => {
    await homePage.clickRegister();
    await registerPage.waitForRegistrationPage();
    expect(await registerPage.isRegistrationPageExists(), 'Register Account form should be displayed').toBe(true);
  });

  await test.step('2) Complete and submit the customer registration form', async () => {
    await registerPage.fillRegistrationForm(firstName, lastName, email, password, telephone);
    await registerPage.acceptPrivacyPolicy();
    await registerPage.submitRegistration();
  });

  await test.step('3) Verify account-created confirmation and account navigation', async () => {
    await successPage.waitForSuccessPage();
    expect(await successPage.isSuccessPageExists(), 'Account-created confirmation should be displayed').toBe(true);
    expect(await registerPage.isAccountCreated(), 'Registration should succeed').toBe(true);
    expect(await myAccountPage.isAuthenticated(), 'New account navigation should be available').toBe(true);
  });

  console.log('✅ Customer registration completed.');
});

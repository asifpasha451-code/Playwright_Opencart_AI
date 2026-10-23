import { test, expect } from '../../fixtures/pageFixtures';
import { RowDataPacket } from 'mysql2';
import { executeQuery } from '../../utils/dbClient';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('Register customer and verify database record @master @db @end-to-end', async ({ homePage, registerPage }) => {
  test.setTimeout(90_000);

  const firstName = RandomDataUtil.getFirstName();
  const lastName = RandomDataUtil.getLastName();
  const telephone = RandomDataUtil.getPhoneNumber();
  const email = RandomDataUtil.getEmail().replace('@', `+${Date.now()}@`).toLowerCase();
  const password = RandomDataUtil.getPassword(14);

  await test.step('1) Register a uniquely generated customer through the storefront', async () => {
    expect(await homePage.isHomePageExists(), 'OpenCart storefront should be displayed').toBeTruthy();
    await homePage.clickRegister();
    expect(await registerPage.isRegistrationPageExists(), 'Registration form should be displayed').toBeTruthy();
    await registerPage.fillRegistrationForm(firstName, lastName, email, password, telephone);
    await registerPage.acceptPrivacyPolicy();
    await registerPage.submitRegistration();
    await registerPage.waitForAccountCreated();
    expect(await registerPage.isAccountCreated(), 'OpenCart should confirm successful registration').toBeTruthy();
  });

  await test.step('2) Verify the registered customer in MySQL', async () => {
    const customers = await executeQuery(
      'SELECT firstname, lastname, email, status, date_added FROM oc_customer WHERE email = ?',
      [email],
    ) as RowDataPacket[];

    expect(Array.isArray(customers), 'Customer query should return rows').toBeTruthy();
    expect(customers).toHaveLength(1);
    expect(customers[0].firstname, 'Database first name should match the submitted customer').toBe(firstName);
    expect(customers[0].lastname, 'Database last name should match the submitted customer').toBe(lastName);
    expect(customers[0].email, 'Database email should match the unique registered email').toBe(email);
    expect(customers[0].status, 'Newly registered customer should be active').toBe(1);
    expect(customers[0].date_added, 'Database registration timestamp should be present').toBeTruthy();
  });

  console.log('✅ Registered customer verified in MySQL.');
});

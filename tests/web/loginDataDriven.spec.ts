import path from 'node:path';
import { test, expect } from '../../fixtures/pageFixtures';
import { DataProvider } from '../../utils/DataReader';

type LoginDataRow = {
  testName?: string;
  TestName?: string;
  email: string;
  password: string;
  expected: 'success' | 'failure';
};

const loginData = DataProvider.readJson(
  path.resolve(__dirname, '../../testdata/opencart_logindata.json'),
) as LoginDataRow[];

for (const [index, row] of loginData.entries()) {
  const testName = row.testName ?? row.TestName ?? `Login data row ${index + 1}`;

  test(`${testName} (row ${index + 1}) @master @sanity @regression @web @datadriven`, async ({
    homePage,
    loginPage,
  }) => {
    await test.step('1) Open the OpenCart login page', async () => {
      await homePage.clickLogin();
      expect(await loginPage.isLoginPageExists(), 'The login form should be displayed').toBe(true);
    });

    await test.step('2) Submit the credentials from the external data row', async () => {
      const email = row.email.trim() === '' ? '' : row.email;
      const password = row.password.trim() === '' ? '' : row.password;
      await loginPage.login(email, password);
    });

    await test.step('3) Validate the result for this data row', async () => {
      const actualResult = await loginPage.waitForLoginResult();
      expect(
        actualResult,
        `Login should ${row.expected}; OpenCart reported ${actualResult}`,
      ).toBe(row.expected);

      if (row.expected === 'success') {
        await loginPage.waitForAccountDashboard();
        expect(await loginPage.isAccountDashboardExists(), 'The My Account page should be displayed').toBe(true);
      } else {
        const warning = await loginPage.getLoginWarningText();
        expect(
          warning,
          'OpenCart should report invalid credentials or explicitly throttle repeated login attempts',
        ).toMatch(
          /^Warning: (No match for E-Mail Address and\/or Password\.|Your account has exceeded allowed number of login attempts\. Please try again in 1 hour\.)$/,
        );
        expect(await loginPage.isAccountDashboardExists(), 'Failed login must not open My Account').toBe(false);
      }
    });

    console.log(`✅ Completed data-driven login: ${testName}`);
  });
}

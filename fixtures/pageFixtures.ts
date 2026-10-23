import { test as base } from '@playwright/test';
import dotenv from 'dotenv';
import { CartPage } from '../pages/CartPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { RegisterPage } from '../pages/RegisterPage';

dotenv.config();

const APP_URL = process.env.WEB_APP_URL || 'http://localhost/opencart/';

type PageFixtures = {
  cartPage: CartPage;
  homePage: HomePage;
  loginPage: LoginPage;
  productPage: ProductPage;
  registerPage: RegisterPage;
};

export const test = base.extend<PageFixtures>({
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  homePage: async ({ page }, use) => {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
});

test.afterEach(async ({ page, context }) => {
  if (!page.isClosed()) {
    await page.close();
  }
  await context.close();
});

export { expect } from '@playwright/test';

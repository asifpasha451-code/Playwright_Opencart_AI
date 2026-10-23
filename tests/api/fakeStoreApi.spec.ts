import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

test.describe('FakeStore API Tests', () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const CART_ID = Number(process.env.CART_ID ?? 1);
  const LIMIT = 5;

  test('POST - Successful login @master @sanity @api', async ({ request }) => {
    const userResponse = await request.get(`${BASE_URL}${Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID))}`);
    expect(userResponse.status(), 'Configured login user should exist').toBe(200);
    const user = await userResponse.json();

    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: user.username, password: user.password },
    });
    expect(response.status(), 'Valid credentials should return status 201').toBe(201);

    const body = await response.json();
    expect(typeof body.token, 'Authentication token should be a string').toBe('string');
    expect(body.token.length, 'Authentication token should not be empty').toBeGreaterThan(0);
  });

  test('POST - Invalid login @master @api', async ({ request }) => {
    const payload = RandomDataUtil.generateInvalidLoginPayload();
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, { data: payload });
    expect(response.status(), 'Invalid credentials should return status 401').toBe(401);

    const message = await response.text();
    expect(message, 'API should return its invalid-login message').toBe('username or password is incorrect');
  });

  test('GET - All products @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toEqual(expect.objectContaining({
      id: expect.any(Number),
      title: expect.any(String),
      price: expect.any(Number),
      category: expect.any(String),
      image: expect.any(String),
    }));
  });

  test('GET - Product by ID @master @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID))}`);
    expect(response.status()).toBe(200);

    const product = await response.json();
    expect(product.id).toBe(PRODUCT_ID);
    expect(product).toEqual(expect.objectContaining({
      title: expect.any(String),
      price: expect.any(Number),
      category: expect.any(String),
      image: expect.any(String),
    }));
  });

  test('GET - Products with limit @master @api', async ({ request }) => {
    const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(Array.isArray(products)).toBeTruthy();
    expect(products).toHaveLength(LIMIT);
  });

  test('GET - Products sorted ascending @master @api', async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'asc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const products = await response.json();
    const ids = products.map((product: { id: number }) => product.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => first - second));
  });

  test('GET - Products sorted descending @master @api', async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'desc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const products = await response.json();
    const ids = products.map((product: { id: number }) => product.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => second - first));
  });

  test('GET - All product categories @master @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status()).toBe(200);

    const categories = await response.json();
    expect(Array.isArray(categories)).toBeTruthy();
    expect(categories.length).toBeGreaterThan(0);
  });

  test('GET - Products by category @master @api', async ({ request }) => {
    const category = 'electronics';
    const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', encodeURIComponent(category));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((product: { category: string }) => product.category === category)).toBeTruthy();
  });

  test('POST - Create product @master @api', async ({ request }) => {
    const payload = RandomDataUtil.generateProductPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });
    expect(response.status()).toBe(201);

    const createdProduct = await response.json();
    expect(createdProduct.id).toBeTruthy();
    expect(createdProduct).toEqual(expect.objectContaining(payload));

    const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(createdProduct.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'Created product should be removed after validation').toBe(200);
  });

  test('PUT - Update product @master @api', async ({ request }) => {
    const payload = RandomDataUtil.generateUpdatedProductPayload();
    const route = Routes.UPDATE_PRODUCT.replace('{id}', String(PRODUCT_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status()).toBe(200);

    const updatedProduct = await response.json();
    expect(updatedProduct.id).toBe(PRODUCT_ID);
    expect(updatedProduct).toEqual(expect.objectContaining(payload));
  });

  test('DELETE - Product @master @api', async ({ request }) => {
    const route = Routes.DELETE_PRODUCT.replace('{id}', String(PRODUCT_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const deletedProduct = await response.json();
    expect(deletedProduct.id).toBe(PRODUCT_ID);
  });

  test('GET - All users @master @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
  });

  test('GET - User by ID @master @api', async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const user = await response.json();
    expect(user.id).toBe(USER_ID);
  });

  test('GET - Users with limit @master @api', async ({ request }) => {
    const route = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users).toHaveLength(LIMIT);
  });

  test('GET - Users sorted ascending @master @api', async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace('{order}', 'asc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const users = await response.json();
    const ids = users.map((user: { id: number }) => user.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => first - second));
  });

  test('GET - Users sorted descending @master @api', async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace('{order}', 'desc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const users = await response.json();
    const ids = users.map((user: { id: number }) => user.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => second - first));
  });

  test('POST - Create user @master @api', async ({ request }) => {
    const payload = RandomDataUtil.generateUserPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: payload });
    expect(response.status()).toBe(201);

    const createdUser = await response.json();
    expect(typeof createdUser.id, 'Created user response should contain a numeric ID').toBe('number');

    const deleteRoute = Routes.DELETE_USER.replace('{id}', String(createdUser.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'Created user should be removed after validation').toBe(200);
  });

  test('PUT - Update user @master @api', async ({ request }) => {
    const payload = RandomDataUtil.generateUserUpdatePayload();
    const route = Routes.UPDATE_USER.replace('{id}', String(USER_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status()).toBe(200);

    const updatedUser = await response.json();
    expect(updatedUser).toEqual(expect.objectContaining(payload));
  });

  test('DELETE - User @master @api', async ({ request }) => {
    const route = Routes.DELETE_USER.replace('{id}', String(USER_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const deletedUser = await response.json();
    expect(deletedUser.id).toBe(USER_ID);
  });

  test('GET - All carts @master @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status()).toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBeTruthy();
    expect(carts.length).toBeGreaterThan(0);
  });

  test('GET - Cart by ID @master @api', async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const cart = await response.json();
    expect(cart.id).toBe(CART_ID);
  });

  test('GET - Carts by date range @master @api', async ({ request }) => {
    const allCartsResponse = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(allCartsResponse.status()).toBe(200);
    const allCarts = await allCartsResponse.json();
    const cartDates: string[] = allCarts.map((cart: { date: string }) => cart.date.slice(0, 10)).sort();
    const startDate = cartDates[0];
    const endDate = cartDates[cartDates.length - 1];
    const route = Routes.GET_CARTS_BY_DATE_RANGE
      .replace('{startdate}', encodeURIComponent(startDate))
      .replace('{enddate}', encodeURIComponent(endDate));

    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBeTruthy();
    expect(carts.every((cart: { date: string }) => {
      const cartDate = cart.date.slice(0, 10);
      return cartDate >= startDate && cartDate <= endDate;
    })).toBeTruthy();
  });

  test('GET - Carts by user @master @api', async ({ request }) => {
    const route = Routes.GET_USER_CART.replace('{userId}', String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBeTruthy();
    expect(carts.every((cart: { userId: number }) => cart.userId === USER_ID)).toBeTruthy();
  });

  test('GET - Carts with limit @master @api', async ({ request }) => {
    const route = Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBeTruthy();
    expect(carts).toHaveLength(LIMIT);
  });

  test('GET - Carts sorted ascending @master @api', async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace('{order}', 'asc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const carts = await response.json();
    const ids = carts.map((cart: { id: number }) => cart.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => first - second));
  });

  test('GET - Carts sorted descending @master @api', async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace('{order}', 'desc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const carts = await response.json();
    const ids = carts.map((cart: { id: number }) => cart.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => second - first));
  });

  test('POST - Create cart @master @api', async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });
    expect(response.status()).toBe(201);

    const createdCart = await response.json();
    expect(createdCart.id).toBeTruthy();
    expect(createdCart.userId).toBe(payload.userId);
    expect(createdCart.products).toEqual(payload.products);

    const deleteRoute = Routes.DELETE_CART.replace('{id}', String(createdCart.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'Created cart should be removed after validation').toBe(200);
  });

  test('PUT - Update cart @master @api', async ({ request }) => {
    const payload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
    const route = Routes.UPDATE_CART.replace('{id}', String(CART_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status()).toBe(200);

    const updatedCart = await response.json();
    expect(updatedCart.id).toBe(CART_ID);
    expect(updatedCart.userId).toBe(USER_ID);
    expect(updatedCart.products).toEqual(payload.products);
  });

  test('DELETE - Cart @master @api', async ({ request }) => {
    const route = Routes.DELETE_CART.replace('{id}', String(CART_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const deletedCart = await response.json();
    expect(deletedCart.id).toBe(CART_ID);
  });

  test('SCHEMA - Product response @master @api', async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const product = await response.json();
    const validate = new Ajv().compile(DataProvider.readJson('api/schemas/product_api_schema.json'));
    expect(validate(product), `Product schema errors: ${JSON.stringify(validate.errors)}`).toBeTruthy();
  });

  test('SCHEMA - User response @master @api', async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const user = await response.json();
    const validate = new Ajv().compile(DataProvider.readJson('api/schemas/user_api_schema.json'));
    expect(validate(user), `User schema errors: ${JSON.stringify(validate.errors)}`).toBeTruthy();
  });

  test('SCHEMA - Cart response @master @api', async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const cart = await response.json();
    const validate = new Ajv().compile(DataProvider.readJson('api/schemas/cart_api_schema.json'));
    expect(validate(cart), `Cart schema errors: ${JSON.stringify(validate.errors)}`).toBeTruthy();
  });

  test('WORKFLOW - Product create, update, delete @master @api', async ({ request }) => {
    const createPayload = RandomDataUtil.generateProductPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: createPayload });
    expect(createResponse.status()).toBe(201);
    const createdProduct = await createResponse.json();
    expect(createdProduct.id).toBeTruthy();

    const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
    const updateRoute = Routes.UPDATE_PRODUCT.replace('{id}', String(createdProduct.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status()).toBe(200);
    const updatedProduct = await updateResponse.json();
    expect(updatedProduct.id).toBe(createdProduct.id);
    expect(updatedProduct).toEqual(expect.objectContaining(updatePayload));

    const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(createdProduct.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status()).toBe(200);
  });

  test('WORKFLOW - User create, update, delete @master @api', async ({ request }) => {
    const createPayload = RandomDataUtil.generateUserPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: createPayload });
    expect(createResponse.status()).toBe(201);
    const createdUser = await createResponse.json();
    expect(createdUser.id).toBeTruthy();

    const updatePayload = RandomDataUtil.generateUserUpdatePayload();
    const updateRoute = Routes.UPDATE_USER.replace('{id}', String(createdUser.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status()).toBe(200);
    const updatedUser = await updateResponse.json();
    expect(updatedUser).toEqual(expect.objectContaining(updatePayload));

    const deleteRoute = Routes.DELETE_USER.replace('{id}', String(createdUser.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status()).toBe(200);
  });

  test('WORKFLOW - Cart create, update, delete @master @api', async ({ request }) => {
    const createPayload = RandomDataUtil.generateCartPayload(USER_ID);
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: createPayload });
    expect(createResponse.status()).toBe(201);
    const createdCart = await createResponse.json();
    expect(createdCart.id).toBeTruthy();
    expect(createdCart.userId).toBe(USER_ID);
    expect(createdCart.products).toEqual(createPayload.products);

    const updatePayload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
    updatePayload.products[0].productId = createPayload.products[0].productId;
    updatePayload.products[0].quantity = createPayload.products[0].quantity + 1;
    const updateRoute = Routes.UPDATE_CART.replace('{id}', String(createdCart.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status()).toBe(200);
    const updatedCart = await updateResponse.json();
    expect(updatedCart.id).toBe(createdCart.id);
    expect(updatedCart.products).toEqual(updatePayload.products);
    expect(updatedCart.products[0].quantity).not.toBe(createPayload.products[0].quantity);

    const deleteRoute = Routes.DELETE_CART.replace('{id}', String(createdCart.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status()).toBe(200);
  });
});

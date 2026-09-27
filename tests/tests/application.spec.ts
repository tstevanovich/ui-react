import { expect, test } from '@playwright/test';

test('home renders with navigation and footer', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  await expect(page).toHaveTitle('Home | Orchestra React');
  await expect(page.getByRole('contentinfo')).toBeVisible();
  expect(errors).toEqual([]);
});

test('an unknown deep link can return home and browser Back restores it', async ({ page }) => {
  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page).toHaveTitle('Page not found | Orchestra React');
  await page.getByRole('link', { name: 'Return to Home' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('keyboard skip link focuses the main content target', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'Welcome' }).waitFor();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('skipTarget')).toBeFocused();
});

test('no-auth and environment endpoints respond with JSON', async ({ request }) => {
  const login = await request.get('/auth/applogin');
  expect(login.status()).toBe(200);
  expect(await login.json()).toEqual({});
  const environment = await request.get('/json/env-properties.json');
  expect(environment.status()).toBe(200);
  expect(await environment.json()).toHaveProperty('LOGGING_SERVER_URL');
});

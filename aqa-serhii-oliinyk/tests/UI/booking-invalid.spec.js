import { test, expect } from '@playwright/test';

test('Cannot book room with invalid data', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Book now' }).first().click();

  const checkIn = page.locator('#booking input').first();
  const checkOut = page.locator('#booking input').nth(1);

  await checkIn.click();
  await page.locator('.react-datepicker__day--020').first().click();

  await checkOut.click();
  await page.locator('.react-datepicker__day--027').first().click();

  await page.getByRole('button', { name: 'Check Availability' }).click();
  await page.getByRole('link', { name: 'Book now' }).nth(1).click();

  await page.getByRole('button', { name: 'Reserve Now' }).click();

  await page.getByRole('textbox', { name: 'Firstname' }).fill('');
  await page.getByRole('textbox', { name: 'Lastname' }).fill('');
  await page.getByRole('textbox', { name: 'Email' }).fill('invalid-email');
  await page.getByRole('textbox', { name: 'Phone' }).fill('123abc');

  await page.getByRole('button', { name: 'Reserve Now' }).click();

  await expect(
    page.locator('#root-container > div > div.container.my-5 > div > div.col-lg-4 > div > div > form > div.alert.alert-danger')
  ).toBeVisible();
});

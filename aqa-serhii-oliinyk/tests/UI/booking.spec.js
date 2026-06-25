import { test, expect } from '@playwright/test';

test('Open homepage, select room, choose dates and fill reservation form', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Book now' }).first().click();

  const checkIn = page.locator('#booking > div > div > div > form > div > div:nth-child(1) > div > div > input');
  const checkOut = page.locator('#booking > div > div > div > form > div > div:nth-child(2) > div.react-datepicker-wrapper.dateWrapper > div > input');

  await checkIn.click();
  await page.locator('.react-datepicker__day--020').first().click();

  await checkOut.click();
  await page.locator('.react-datepicker__day--027').first().click();

  await page.getByRole('button', { name: 'Check Availability' }).click();
  await page.getByRole('link', { name: 'Book now' }).nth(1).click();
  await page.getByRole('button', { name: 'Reserve Now' }).click();  
  await page.getByRole('textbox', { name: 'Firstname' }).fill('John');
  await page.getByRole('textbox', { name: 'Lastname' }).fill('Tester');
  await page.getByRole('textbox', { name: 'Email' }).fill('test@gmail.com');
  await page.getByRole('textbox', { name: 'Phone' }).fill('+380931234567');
  await page.getByRole('button', { name: 'Reserve Now' }).click();

  await expect(
    page.locator('#root-container > div > div.container.my-5 > div > div.col-lg-4 > div > div > p:nth-child(2)')
  ).toBeVisible();
});

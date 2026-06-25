import { test, expect } from '@playwright/test';

test('Previously booked dates are unavailable', async ({ page }) => {
  const checkInDate = 20;
  const checkOutDate = 27;

  await page.goto('/');
  await page.getByRole('link', { name: 'Book now' }).first().click();

  const checkIn = page.locator('#booking input').first();
  const checkOut = page.locator('#booking input').nth(1);

  await checkIn.click();
  await page.locator(`.react-datepicker__day--0${checkInDate}`).first().click();

  await checkOut.click();
  await page.locator(`.react-datepicker__day--0${checkOutDate}`).first().click();

  await page.getByRole('button', { name: 'Check Availability' }).click();
  await page.getByRole('link', { name: 'Book now' }).nth(1).click();
  await page.getByRole('button', { name: 'Reserve Now' }).click();

  await page.getByRole('textbox', { name: 'Firstname' }).fill('John');
  await page.getByRole('textbox', { name: 'Lastname' }).fill('Tester');
  await page.getByRole('textbox', { name: 'Email' }).fill('test@gmail.com');
  await page.getByRole('textbox', { name: 'Phone' }).fill('+380931234567');

  await page.getByRole('button', { name: 'Reserve Now' }).click();

  await page.goto('/');
  await page.getByRole('link', { name: 'Book now' }).nth(1).click();

  const unavailable = page.locator('.rbc-event-content', { hasText: 'Unavailable' });

  await expect(unavailable).toHaveCount(2);
  await expect(unavailable.first()).toBeVisible();
  await expect(unavailable.last()).toBeVisible();
});
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase('quote-decision-log');
    request.onsuccess = () => resolve(); request.onerror = () => resolve(); request.onblocked = () => resolve();
  }));
  await page.reload();
});

test('creates, reviews, sends, and records a client decision', async ({ page }) => {
  await page.getByRole('link', { name: /create your first quote/i }).click();
  await page.getByLabel('Client name').fill('North & Pine');
  await page.getByLabel('Client email').fill('hello@example.com');
  await page.getByLabel('Project').fill('Launch site');
  await page.getByLabel('Total amount').fill('4800');
  await page.getByLabel('Scope and deliverables').fill('Design and build a five-page launch site.');
  await page.getByRole('button', { name: /save quote/i }).click();
  await expect(page.locator('h1', { hasText: 'Launch site' })).toBeVisible();

  await page.getByRole('button', { name: /review quote/i }).click();
  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.check();
  await page.getByLabel('Reviewer name').fill('Mira Chen');
  await page.getByRole('button', { name: /mark send-ready/i }).click();
  await expect(page.getByText('Send-ready', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /prepare client link/i }).click();
  await page.getByRole('button', { name: /mark as sent/i }).click();
  await expect(page.getByRole('heading', { name: 'Marked as sent' })).toBeVisible();
  const link = await page.getByLabel('Private decision link').inputValue();
  await page.goto(link);
  await expect(page.getByText('Fingerprint verified')).toBeVisible();
  await page.getByText('Accept this quote').click();
  await page.getByLabel('Your full name').fill('Ada Client');
  await page.getByText(/I confirm I reviewed/).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Record decision' }).click();
  expect((await download).suggestedFilename()).toContain('decision-');
  await expect(page.getByRole('heading', { name: /Accepted by Ada Client/i })).toBeVisible();
});

test('has no serious accessibility findings on the empty state', async ({ page }) => {
  // @axe-core/playwright currently declares against a newer Playwright Page,
  // but its runtime API is compatible with the factory-pinned browser version.
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
});

test('retains the loaded app while offline', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'Offline behavior is exercised once in the mobile Chromium project.');
  await expect(page.getByRole('heading', { name: /Every quote/i })).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null);
  await page.waitForFunction(async () => {
    const keys = await caches.keys();
    const shell = keys.find((key) => key.startsWith('qd-shell-'));
    return shell ? (await (await caches.open(shell)).keys()).filter((request) => request.url.includes('/assets/index-')).length >= 2 : false;
  });
  await context.setOffline(true);
  await page.goto('/#home');
  await expect(page.locator('.offline-banner')).toBeVisible();
  await expect(page.getByRole('link', { name: /create your first quote/i })).toBeVisible();
});

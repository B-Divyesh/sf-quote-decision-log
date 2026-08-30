import { expect, test, type Page } from '@playwright/test';

async function resetDemo(page: Page): Promise<void> {
  await page.goto('/demo');
  await expect(page.getByLabel('Demo mode')).toContainText('sample data, nothing is saved');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#toast')).toContainText('Demo reset with two sample quotes.');
}

async function ensureServiceWorkerControl(page: Page): Promise<void> {
  if (await page.evaluate(() => navigator.serviceWorker?.controller != null)) return;
  await page.evaluate(async () => { await navigator.serviceWorker.register('/sw.js'); });
  await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null);
}

async function addDemoQuote(page: Page, number: string): Promise<void> {
  await page.goto('/demo/new');
  await page.getByLabel('Quote number').fill(number);
  await page.getByLabel('Client name').fill(`Client ${number}`);
  await page.getByLabel('Project').fill(`Project ${number}`);
  await page.getByLabel('Total amount').fill('100');
  await page.getByLabel('Scope and deliverables').fill(`Sample scope for ${number}.`);
  await page.getByRole('button', { name: 'Save quote' }).click();
  await expect(page.getByRole('heading', { name: `Project ${number}`, level: 1 })).toBeVisible();
}

test('@claim:demo-sample-data opens an isolated sample log in one click', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await page.goto('/');
  await page.getByRole('link', { name: /try it with sample data/i }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo mode')).toContainText('Demo — sample data, nothing is saved.');
  await expect(page.getByText('Cedar & Kite')).toBeVisible();
  await expect(page.getByText('Harrow & Vale')).toBeVisible();
  const names = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(names).toContain('demo:quote-decision-log');
  await page.goto('/?demo=1');
  await expect(page.getByLabel('Demo mode')).toContainText('sample data, nothing is saved');
  await expect(page.getByText('Cedar & Kite')).toBeVisible();
});

test('@claim:local-device-privacy keeps the demo flow on this origin', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await resetDemo(page);
  await page.getByRole('link', { name: /Product photography/ }).click();
  await expect(page.getByText('Fingerprint', { exact: true })).toBeVisible();
  expect(requests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
});

test('@claim:json-export exports the demo log as JSON', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await resetDemo(page);
  await page.goto('/demo/data');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /export json/i }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^quote-decision-backup-.*\.json$/);
  const content = await file.createReadStream();
  let exported = '';
  for await (const chunk of content!) exported += chunk.toString();
  expect(JSON.parse(exported).quotes).toHaveLength(2);
});

test('@claim:csv-export exports one CSV row for every demo quote', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await resetDemo(page);
  await page.goto('/demo/data');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const file = await download;
  const content = await file.createReadStream();
  let exported = '';
  for await (const chunk of content!) exported += chunk.toString();
  const rows = exported.trim().split('\n');
  expect(rows).toHaveLength(3);
  expect(rows[0]).toContain('Quote,Client,Project');
});

test('@claim:quote-fingerprint shows the immutable sample-version fingerprint', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await resetDemo(page);
  await page.getByRole('link', { name: /Product photography/ }).click();
  await expect(page.locator('code[title^="Full fingerprint:"]')).toHaveAttribute('title', /Full fingerprint: [a-f0-9]{64}$/);
});

test('@claim:review-checkpoint shows the named review on a send-ready sample', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await resetDemo(page);
  await page.getByRole('link', { name: /Website launch/ }).click();
  await expect(page.getByText('Cleared by Mira Chen')).toBeVisible();
  await expect(page.getByText('Send-ready', { exact: true })).toBeVisible();
});

test('@claim:client-link keeps the sample quote in a URL fragment', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await resetDemo(page);
  await page.getByRole('link', { name: /Website launch/ }).click();
  await page.getByRole('button', { name: /prepare client link/i }).click();
  const link = await page.getByLabel('Private decision link').inputValue();
  expect(new URL(link).hash).toMatch(/^#client\//);
  expect(new URL(link).hash).toContain('client/');
  await expect(page.getByText('This link carries the quote itself. Send it through your own email or message.')).toBeVisible();
  await expect(page.getByText(/No account or network request is needed/i)).toHaveCount(0);
});

test('@claim:decision-receipt exports the accepted sample decision receipt', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await resetDemo(page);
  await page.getByRole('link', { name: /Product photography/ }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /export decision receipt/i }).click();
  const file = await download;
  const content = await file.createReadStream();
  let receipt = '';
  for await (const chunk of content!) receipt += chunk.toString();
  expect(JSON.parse(receipt)).toMatchObject({ schema: 2, product: 'quote-decision-log', decision: 'accepted' });
});

test('@claim:unlimited-price shows the $19 one-time unlimited option after leaving the demo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await resetDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).first().click();
  await page.goto('/data');
  await expect(page.getByRole('link', { name: 'Buy unlimited — $19' })).toBeVisible();
  await expect(page.getByText(/one-time purchase unlocks unlimited quotes/i)).toBeVisible();
});

test('@claim:free-five-quotes applies the five-quote free allowance in the demo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await resetDemo(page);
  await addDemoQuote(page, 'QD-DEMO-01');
  await addDemoQuote(page, 'QD-DEMO-02');
  await addDemoQuote(page, 'QD-DEMO-03');
  await page.goto('/demo/new');
  await expect(page.getByRole('heading', { name: 'The sample log is full' })).toBeVisible();
  await expect(page.getByText('DEMO LIMIT · 5/5')).toBeVisible();
});

test('@claim:offline-reload keeps the seeded demo usable offline after its first visit', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'The isolated context claim runs once in Chromium.');
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await resetDemo(page);
    await ensureServiceWorkerControl(page);
    await page.waitForFunction(async () => (await caches.keys()).some((key) => key.startsWith('qd-shell-')));
    await context.setOffline(true);
    await page.goto('/demo#home');
    await expect(page.locator('.offline-banner')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quote log' })).toBeVisible();
    await expect(page.getByText('Cedar & Kite')).toBeVisible();
  } finally {
    await context.close();
  }
});

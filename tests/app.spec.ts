import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase('quote-decision-log');
    request.onsuccess = () => resolve(); request.onerror = () => resolve(); request.onblocked = () => resolve();
  }));
  await page.reload();
});

async function ensureServiceWorkerControl(page: Page): Promise<void> {
  if (await page.evaluate(() => navigator.serviceWorker?.controller != null)) return;
  await page.evaluate(async () => { await navigator.serviceWorker.register('/sw.js'); });
  await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null);
}

test('creates, reviews, sends, and records a client decision', async ({ page }, testInfo) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
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
  if (testInfo.project.name === 'mobile') {
    for (const legalLink of await page.locator('.client-footer a').all()) {
      const box = await legalLink.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
  }
  const clientA11y = await new AxeBuilder({ page: page as never }).analyze();
  expect(clientA11y.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByText('Accept this quote').click();
  await page.getByLabel('Your full name').fill('Ada Client');
  await page.getByText(/I confirm I reviewed/).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Record decision' }).click();
  expect((await download).suggestedFilename()).toContain('decision-');
  await expect(page.getByRole('heading', { name: /Accepted by Ada Client/i })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('has no serious accessibility findings on the empty state', async ({ page }) => {
  // @axe-core/playwright currently declares against a newer Playwright Page,
  // but its runtime API is compatible with the factory-pinned browser version.
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
});

test('supports the core review checkpoint with keyboard controls', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Keyboard workflow is viewport-independent and exercised once.');
  await page.getByRole('link', { name: 'Skip to main content' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  await page.getByRole('link', { name: /create your first quote/i }).focus();
  await page.keyboard.press('Enter');
  for (const [label, value] of [['Client name', 'Keyboard Co'], ['Project', 'Keyboard route'], ['Total amount', '850'], ['Scope and deliverables', 'Keyboard-only workflow.']] as const) {
    await page.getByLabel(label).focus();
    await page.keyboard.type(value);
  }
  await page.getByRole('button', { name: /save quote/i }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: /review quote/i }).focus();
  await page.keyboard.press('Enter');
  for (const checkbox of await page.getByRole('checkbox').all()) {
    await checkbox.focus();
    await page.keyboard.press('Space');
  }
  await page.getByLabel('Reviewer name').focus();
  await page.keyboard.type('Key Reviewer');
  await page.getByRole('button', { name: /mark send-ready/i }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Send-ready', { exact: true })).toBeVisible();
});

test('retains the loaded app while offline', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'Offline behavior is exercised once in the mobile Chromium project.');
  await expect(page.getByRole('heading', { name: /Every quote/i })).toBeVisible();
  await ensureServiceWorkerControl(page);
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

test('offers and activates a waiting service-worker update', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'The update lifecycle is exercised once.');
  const swPath = new URL('../dist/sw.js', import.meta.url);
  const original = await readFile(swPath, 'utf8');
  try {
    await ensureServiceWorkerControl(page);
    await writeFile(swPath, original.replaceAll('qd-shell-v3', 'qd-shell-v3-regression').replaceAll('qd-assets-v3', 'qd-assets-v3-regression'));
    await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
    await expect(page.locator('#toast').getByText('A fresh version is ready.')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Update now' }).click();
    await page.waitForFunction(async () => (await caches.keys()).includes('qd-shell-v3-regression'));
    await expect(page.getByRole('heading', { name: /Every quote/i })).toBeVisible();
    expect(await page.evaluate(async () => (await caches.keys()).some((key) => key === 'qd-shell-v3'))).toBe(false);
  } finally {
    await writeFile(swPath, original);
  }
});

test('stores a returned one-time license and verifies the unlock', async ({ page }) => {
  await page.route('https://pilot-api.sociobot.in/api/v1/products/quote-decision-log/verify**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }),
  }));
  await page.goto('/?license=test-license-token#data');
  await expect(page.getByRole('heading', { name: 'Unlimited is active' })).toBeVisible();
  expect(new URL(page.url()).searchParams.has('license')).toBe(false);
  expect(await page.evaluate(() => localStorage.getItem('sb_license:quote-decision-log'))).toBe('test-license-token');
});

test('rejects whitespace-only required quote fields with field guidance', async ({ page }) => {
  await page.getByRole('link', { name: /create your first quote/i }).click();
  await page.getByLabel('Client name').fill('   ');
  await page.getByLabel('Project').fill('   ');
  await page.getByLabel('Total amount').fill('0');
  await page.getByLabel('Scope and deliverables').fill('   ');
  await page.getByRole('button', { name: /save quote/i }).click();
  await expect(page.getByText('Complete the highlighted fields before saving.')).toBeVisible();
  await expect(page.getByText('Enter a client name, not only spaces.')).toBeVisible();
  await expect(page).toHaveURL(/#new$/);
});

test('rejects a structurally invalid backup without damaging the log', async ({ page }) => {
  await page.goto('/#data');
  const invalidBackup = {
    schema: 1,
    product: 'quote-decision-log',
    exportedAt: '2026-08-28T12:00:00.000Z',
    quotes: [{ id: 'broken', createdAt: '2026-08-28T12:00:00.000Z', updatedAt: '2026-08-28T12:00:00.000Z', currentVersion: 1, versions: [] }],
  };
  await page.locator('#backup-file').setInputFiles({ name: 'invalid-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(invalidBackup)) });
  await expect(page.locator('#toast').getByText(/no quote versions/i)).toBeVisible();
  await page.goto('/#home');
  await expect(page.getByRole('heading', { name: /Every quote/i })).toBeVisible();
});

test('offers an explicit recovery path for previously stored invalid data', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Storage recovery is viewport-independent and exercised once.');
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('quote-decision-log', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const transaction = request.result.transaction('quotes', 'readwrite');
      transaction.objectStore('quotes').put({ id: 'broken', createdAt: '2026-08-28T12:00:00.000Z', updatedAt: '2026-08-28T12:00:00.000Z', currentVersion: 1, versions: [] });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  }));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Local storage is unavailable' })).toBeVisible();
  await page.getByRole('link', { name: 'Open data recovery' }).click();
  await expect(page.getByRole('alert')).toContainText('Local data needs recovery');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete invalid local data' }).click();
  await page.goto('/#home');
  await expect(page.getByRole('heading', { name: /Every quote/i })).toBeVisible();
});

test('shows a valid imported receipt immediately and rejects missing consent', async ({ page }) => {
  await page.getByRole('link', { name: /create your first quote/i }).click();
  await page.getByLabel('Client name').fill('Immediate Co');
  await page.getByLabel('Project').fill('Receipt refresh');
  await page.getByLabel('Total amount').fill('1900');
  await page.getByLabel('Scope and deliverables').fill('Verify the return path.');
  await page.getByRole('button', { name: /save quote/i }).click();
  await page.getByRole('button', { name: /review quote/i }).click();
  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.check();
  await page.getByLabel('Reviewer name').fill('Mira Chen');
  await page.getByRole('button', { name: /mark send-ready/i }).click();
  await page.getByRole('button', { name: /prepare client link/i }).click();
  await page.getByRole('button', { name: /mark as sent/i }).click();

  const receipt = await page.evaluate(async () => {
    const quote = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const request = indexedDB.open('quote-decision-log', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const get = request.result.transaction('quotes').objectStore('quotes').getAll();
        get.onerror = () => reject(get.error);
        get.onsuccess = () => resolve(get.result[0] as Record<string, unknown>);
      };
    });
    const currentVersion = quote.currentVersion as number;
    const version = (quote.versions as Array<{ version: number; digest: string }>).find((item) => item.version === currentVersion)!;
    const decision = {
      quoteId: quote.id as string, version: currentVersion, digest: version.digest, decision: 'accepted', clientName: 'Ada Client',
      decidedAt: '2026-08-28T12:00:00.000Z', consentText: 'I confirm I reviewed this exact quote version and intend to record the decision shown.', note: '',
    };
    const bytes = new TextEncoder().encode(JSON.stringify(decision));
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    const receiptDigest = Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return { schema: 2, product: 'quote-decision-log', ...decision, receiptDigest };
  });

  await page.locator('#receipt-file').setInputFiles({ name: 'decision.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(receipt)) });
  await expect(page.getByRole('heading', { name: 'Accepted by Ada Client' })).toBeVisible();
  await expect(page.locator('#toast').getByText('Client decision imported: accepted.')).toBeVisible();

  const missingConsent = { ...receipt, decision: 'declined', clientName: 'Edited Import' } as Record<string, unknown>;
  delete missingConsent.consentText;
  await page.locator('#receipt-file').setInputFiles({ name: 'edited.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(missingConsent)) });
  await expect(page.locator('#toast').getByText(/explicit-consent evidence/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Accepted by Ada Client' })).toBeVisible();
});

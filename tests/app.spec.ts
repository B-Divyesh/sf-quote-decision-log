import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await Promise.all(['quote-decision-log', 'demo:quote-decision-log'].map((name) => new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve(); request.onerror = () => resolve(); request.onblocked = () => resolve();
    })));
  });
  await page.reload();
});

async function ensureServiceWorkerControl(page: Page): Promise<void> {
  if (await page.evaluate(() => navigator.serviceWorker?.controller != null)) return;
  await page.evaluate(async () => { await navigator.serviceWorker.register('/sw.js'); });
  await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null);
}

test('creates, reviews, sends, and records a client decision', async ({ page, context }, testInfo) => {
  const pageErrors: string[] = [];
  const requestUrls: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => requestUrls.push(request.url()));
  await page.getByRole('link', { name: 'Create a quote' }).click();
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
  expect(requestUrls.every((url) => new URL(url).origin === new URL(link).origin)).toBe(true);
  expect(requestUrls.some((url) => url.includes('#client/') || url.includes('North%20%26%20Pine'))).toBe(false);
  expect(await context.cookies()).toEqual([]);
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
  await page.getByText(/I confirm I reviewed/).click();
  const signer = page.getByLabel('Your full name');
  await signer.evaluate((input) => { input.removeAttribute('maxlength'); });
  await signer.fill('A'.repeat(501));
  await page.getByRole('button', { name: 'Record decision' }).click();
  await expect.poll(() => signer.evaluate((input) => (input as HTMLInputElement).validationMessage)).toMatch(/2 and 500/i);
  await expect(page.getByRole('heading', { name: /Launch site/i })).toBeVisible();
  await signer.fill('Ada Client');
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

test('has no serious accessibility findings on form, data, and legal screens', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'The mobile client screen is scanned in the lifecycle test.');
  for (const path of ['/new', '/data', '/demo', '/privacy/', '/terms/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), path).toEqual([]);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
  }
});

test('supports the core review checkpoint with keyboard controls', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Keyboard workflow is viewport-independent and exercised once.');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.getByRole('link', { name: 'Skip to main content' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  await page.getByRole('link', { name: 'Create a quote' }).focus();
  await page.keyboard.press('Enter');
  const createHeading = page.getByRole('heading', { name: 'Create a quote' });
  await expect(createHeading).toBeVisible();
  await expect(createHeading).toBeFocused();
  for (const [label, value] of [['Client name', 'Keyboard Co'], ['Project', 'Keyboard route'], ['Total amount', '850'], ['Scope and deliverables', 'Keyboard-only workflow.']] as const) {
    await page.getByLabel(label).focus();
    await page.keyboard.type(value);
  }
  await page.getByRole('button', { name: /save quote/i }).focus();
  await page.keyboard.press('Enter');
  const quoteHeading = page.getByRole('heading', { name: 'Keyboard route', level: 1 });
  await expect(quoteHeading).toBeVisible();
  await expect(quoteHeading).toBeFocused();
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

test('keeps data and legal links at the 44px mobile target baseline', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'This regression is measured at the mobile viewport.');
  await page.goto('/data');
  const terms = page.getByRole('link', { name: 'Terms' }).last();
  const termsBox = await terms.boundingBox();
  expect(termsBox?.height).toBeGreaterThanOrEqual(44);
  expect(termsBox?.width).toBeGreaterThanOrEqual(44);
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    for (const link of await page.locator('main a, header a, footer a').all()) {
      const box = await link.boundingBox();
      expect(box?.height, `${path} ${await link.innerText()}`).toBeGreaterThanOrEqual(44);
      expect(box?.width, `${path} ${await link.innerText()}`).toBeGreaterThanOrEqual(44);
    }
  }
});

test('rerenders paid state immediately after an invalid license verification', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'License state is viewport-independent.');
  await page.route('https://pilot-api.sociobot.in/api/v1/products/quote-decision-log/verify**', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'revoked' }),
  }));
  await page.goto('/data');
  await page.evaluate(() => {
    localStorage.setItem('sb_license:quote-decision-log', 'invalid-license-token');
    localStorage.setItem('sb_license:quote-decision-log:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Unlimited is active' })).toBeVisible();
  await page.getByRole('button', { name: 'Verify license now' }).click();
  await expect(page.getByRole('heading', { name: 'Keep every quote moving' })).toBeVisible();
  await expect(page.locator('#license-status')).toContainText('License no longer active');
  await expect(page.getByRole('link', { name: /buy unlimited/i })).toBeVisible();
});

test('uses real app URLs, route titles, social metadata, and the designed 404 page', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Route metadata is viewport-independent.');
  await page.goto('/new');
  await expect(page).toHaveTitle('New quote — Quote Decision');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/new$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.jpg$/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Quote Decision');
  await expect(page.getByRole('heading', { name: 'This page is not in the quote log.' })).toBeVisible();
});

test('does not throw when service worker registration is blocked', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'The resilience check runs once in Chromium.');
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Review quotes before tiny agencies send/i })).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('retains the loaded app while offline', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'Offline behavior is exercised once in the mobile Chromium project.');
  await expect(page.getByRole('heading', { name: /Review quotes before tiny agencies send/i })).toBeVisible();
  await ensureServiceWorkerControl(page);
  await page.waitForFunction(async () => {
    const keys = await caches.keys();
    const shell = keys.find((key) => key.startsWith('qd-shell-'));
    return shell ? (await (await caches.open(shell)).keys()).filter((request) => request.url.includes('/assets/index-')).length >= 2 : false;
  });
  await context.setOffline(true);
  await page.goto('/#home');
  await expect(page.locator('.offline-banner')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create a quote' })).toBeVisible();
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
    await expect(page.getByRole('heading', { name: /Review quotes before tiny agencies send/i })).toBeVisible();
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
  await page.goto('/data?license=test-license-token');
  await expect(page.getByRole('heading', { name: 'Unlimited is active' })).toBeVisible();
  expect(new URL(page.url()).searchParams.has('license')).toBe(false);
  expect(await page.evaluate(() => localStorage.getItem('sb_license:quote-decision-log'))).toBe('test-license-token');
});

test('rejects whitespace-only required quote fields with field guidance', async ({ page }) => {
  await page.getByRole('link', { name: 'Create a quote' }).click();
  await page.getByLabel('Client name').fill('   ');
  await page.getByLabel('Project').fill('   ');
  await page.getByLabel('Total amount').fill('0');
  await page.getByLabel('Scope and deliverables').fill('   ');
  await page.getByRole('button', { name: /save quote/i }).click();
  await expect(page.getByText('Complete the highlighted fields before saving.')).toBeVisible();
  await expect(page.getByText('Enter a client name, not only spaces.')).toBeVisible();
  await expect(page).toHaveURL(/\/new$/);
});

test('never persists a quote or review that violates the stored schema', async ({ page }) => {
  const countStoredQuotes = () => page.evaluate(() => new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('quote-decision-log', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const get = request.result.transaction('quotes').objectStore('quotes').getAll();
      get.onerror = () => reject(get.error);
      get.onsuccess = () => resolve(get.result.length);
    };
  }));

  await page.getByRole('link', { name: 'Create a quote' }).click();
  await page.getByLabel('Client name').fill('Bounded Co');
  await page.getByLabel('Project').fill('Schema guard');
  const amount = page.getByLabel('Total amount');
  await amount.fill('90071992547409.92');
  await amount.evaluate((input) => { input.removeAttribute('max'); });
  await page.getByLabel('Scope and deliverables').fill('Confirm invalid values do not reach IndexedDB.');
  await page.getByRole('button', { name: /save quote/i }).click();
  await expect(page.locator('#form-error')).toContainText(/larger amounts cannot be stored safely/i);
  expect(await countStoredQuotes()).toBe(0);

  await page.getByLabel('Total amount').fill('10');
  await page.getByRole('button', { name: /save quote/i }).click();
  await page.getByRole('button', { name: /review quote/i }).click();
  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.check();
  const reviewer = page.getByLabel('Reviewer name');
  await reviewer.evaluate((input) => { input.removeAttribute('maxlength'); });
  await reviewer.fill('R'.repeat(501));
  await page.getByRole('button', { name: /mark send-ready/i }).click();
  await expect.poll(() => reviewer.evaluate((input) => (input as HTMLInputElement).validationMessage)).toMatch(/2 and 500/i);
  expect(await countStoredQuotes()).toBe(1);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Schema guard', level: 1 })).toBeVisible();
});

test('rejects a structurally invalid backup without damaging the log', async ({ page }) => {
  await page.goto('/data');
  const invalidBackup = {
    schema: 1,
    product: 'quote-decision-log',
    exportedAt: '2026-08-28T12:00:00.000Z',
    quotes: [{ id: 'broken', createdAt: '2026-08-28T12:00:00.000Z', updatedAt: '2026-08-28T12:00:00.000Z', currentVersion: 1, versions: [] }],
  };
  await page.locator('#backup-file').setInputFiles({ name: 'invalid-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(invalidBackup)) });
  await expect(page.locator('#toast').getByText(/no quote versions/i)).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Review quotes before tiny agencies send/i })).toBeVisible();
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
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Review quotes before tiny agencies send/i })).toBeVisible();
});

test('shows a valid imported receipt immediately and rejects missing consent', async ({ page }) => {
  await page.getByRole('link', { name: 'Create a quote' }).click();
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

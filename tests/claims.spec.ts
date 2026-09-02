import { expect, test, type Download, type Page } from '@playwright/test';
import { Buffer } from 'node:buffer';

const CONSENT_TEXT = 'I confirm I reviewed this exact quote version and intend to record the decision shown.';

async function downloadText(download: Download): Promise<string> {
  const content = await download.createReadStream();
  let exported = '';
  for await (const chunk of content!) exported += chunk.toString();
  return exported;
}

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

async function createReviewedQuoteLink(page: Page, project: string): Promise<string> {
  await resetDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).first().click();
  await page.getByRole('link', { name: 'Create a quote' }).click();
  await page.getByLabel('Client name').fill('North & Pine');
  await page.getByLabel('Project').fill(project);
  await page.getByLabel('Total amount').fill('4800');
  await page.getByLabel('Scope and deliverables').fill('Design and build a five-page launch site.');
  await page.getByRole('button', { name: 'Save quote' }).click();
  await page.getByRole('button', { name: 'Review quote' }).click();
  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.check();
  await page.getByLabel('Reviewer name').fill('Mira Chen');
  await page.getByRole('button', { name: 'Mark send-ready' }).click();
  await page.getByRole('button', { name: 'Prepare client link' }).click();
  return page.getByLabel('Client decision link').inputValue();
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
  await page.getByRole('link', { name: 'Start for real' }).first().click();

  await page.getByRole('link', { name: 'Create a quote' }).click();
  await page.getByLabel('Client name').fill('Real Record Studio');
  await page.getByLabel('Project').fill('Real quote survives');
  await page.getByLabel('Total amount').fill('725');
  await page.getByLabel('Scope and deliverables').fill('Keep this real quote outside the sample workspace.');
  await page.getByRole('button', { name: 'Save quote' }).click();
  await expect(page.getByRole('heading', { name: 'Real quote survives', level: 1 })).toBeVisible();

  await page.goto('/');
  await page.getByRole('link', { name: 'Try demo' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await addDemoQuote(page, 'QD-DISCARD');
  await page.goto('/demo');
  await page.getByRole('link', { name: /Website launch/ }).click();
  await page.getByRole('button', { name: 'Prepare client link' }).click();
  const demoClientLink = await page.getByLabel('Client decision link').inputValue();
  await page.goto(demoClientLink);
  await page.getByText('Accept this quote').click();
  await page.getByLabel('Your full name').fill('Demo Client');
  await page.getByText(CONSENT_TEXT).click();
  const receiptDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Record decision' }).click();
  await receiptDownload;

  await page.goto('/demo');
  await expect(page.getByText('Client QD-DISCARD')).toBeVisible();
  await page.getByRole('link', { name: 'Start for real' }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Real Record Studio')).toBeVisible();
  expect(await page.evaluate(async () => {
    const count = (name: string, storeName: string) => new Promise<number>((resolve, reject) => {
      const request = indexedDB.open(name, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result;
        const result = database.transaction(storeName).objectStore(storeName).count();
        result.onerror = () => reject(result.error);
        result.onsuccess = () => { database.close(); resolve(result.result); };
      };
    });
    return Promise.all([
      count('demo:quote-decision-log', 'quotes'),
      count('demo:quote-decision-client-receipts', 'receipts'),
    ]);
  })).toEqual([0, 0]);

  await page.goto('/demo');
  await expect(page.getByText('Cedar & Kite')).toBeVisible();
  await expect(page.getByText('Harrow & Vale')).toBeVisible();
  await expect(page.getByText('Client QD-DISCARD')).toHaveCount(0);
  await page.goto('/?demo=1');
  await expect(page.getByLabel('Demo mode')).toContainText('sample data, nothing is saved');
  await expect(page.getByText('Cedar & Kite')).toBeVisible();
});

test('@claim:quote-fields restores the saved scope, value, and expiry after reload', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await resetDemo(page);
  await page.goto('/demo/new');
  await page.getByLabel('Quote number').fill('QD-FIELDS-01');
  await page.getByLabel('Client name').fill('Fieldproof Studio');
  await page.getByLabel('Project').fill('Campaign asset package');
  await page.getByLabel('Expiry date').fill('2027-04-18');
  await page.getByLabel('Total amount').fill('12345.67');
  await page.getByLabel('Scope and deliverables').fill('Create twelve edited product scenes for the launch campaign.');
  await page.getByRole('button', { name: 'Save quote' }).click();
  await expect(page.getByRole('heading', { name: 'Campaign asset package', level: 1 })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Campaign asset package', level: 1 })).toBeVisible();
  await expect(page.locator('.scope')).toContainText('Create twelve edited product scenes for the launch campaign.');
  await expect(page.locator('.total')).toHaveText('$12,345.67');
  await expect(page.locator('.paper-meta')).toContainText('Apr 18, 2027');
  expect(await page.evaluate(() => new Promise<Record<string, unknown>>((resolve, reject) => {
    const request = indexedDB.open('demo:quote-decision-log', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const get = request.result.transaction('quotes').objectStore('quotes').getAll();
      get.onerror = () => reject(get.error);
      get.onsuccess = () => {
        const quote = (get.result as Array<{ versions: Array<{ snapshot: Record<string, unknown> }> }>).find((item) => item.versions[0]?.snapshot.number === 'QD-FIELDS-01');
        resolve(quote?.versions[0]?.snapshot ?? {});
      };
    };
  }))).toMatchObject({
    scope: 'Create twelve edited product scenes for the launch campaign.',
    totalCents: 1234567,
    expiresOn: '2027-04-18',
  });
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

test('@claim:no-tracking-remote-resources runs the complete demo flow without tracking or remote resources', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  const requests: Array<{ method: string; resourceType: string; url: string }> = [];
  await page.addInitScript(() => {
    const calls: string[] = [];
    const original = navigator.sendBeacon.bind(navigator);
    Object.defineProperty(window, '__quoteDecisionBeaconCalls', { value: calls });
    navigator.sendBeacon = (url, data) => {
      calls.push(String(url));
      return original(url, data);
    };
  });
  page.on('request', (request) => requests.push({
    method: request.method(),
    resourceType: request.resourceType(),
    url: request.url(),
  }));

  await page.goto('/');
  await page.getByRole('link', { name: /try it with sample data/i }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('link', { name: /Website launch/ }).click();
  await page.getByRole('button', { name: 'Prepare client link' }).click();
  const link = await page.getByLabel('Client decision link').inputValue();
  await page.getByRole('button', { name: 'Mark as sent' }).click();
  await expect(page.getByRole('heading', { name: 'Marked as sent' })).toBeVisible();
  await page.goto(link);
  await page.getByText('Accept this quote').click();
  await page.getByLabel('Your full name').fill('Demo Client');
  await page.getByText(CONSENT_TEXT).click();
  const receiptDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Record decision' }).click();
  await receiptDownload;
  await page.goto('/demo/data');
  const backupDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  await backupDownload;

  const appOrigin = new URL(page.url()).origin;
  const allowedPaths = [
    /^\/$/,
    /^\/demo(?:\/data)?\/?$/,
    /^\/assets\/index-[A-Za-z0-9_-]+\.(?:js|css)$/,
    /^\/assets\/dispatch-gate-(?:640|960)(?:-[A-Za-z0-9_-]+)?\.webp$/,
    /^\/(?:manifest\.webmanifest|sw\.js)$/,
    /^\/icons\/icon(?:-192|-512|-maskable-512)?\.(?:svg|png)$/,
  ];
  expect(requests.length).toBeGreaterThan(0);
  for (const request of requests) {
    const url = new URL(request.url);
    expect(url.origin, request.url).toBe(appOrigin);
    expect(request.method, request.url).toBe('GET');
    expect(request.resourceType, request.url).not.toBe('font');
    expect(allowedPaths.some((pattern) => pattern.test(url.pathname)), request.url).toBe(true);
    expect(url.pathname, request.url).not.toMatch(/(?:analytics|advert|beacon|collect|pixel|telemetry|track)/i);
  }
  expect(requests.filter((request) => ['fetch', 'xhr', 'eventsource', 'websocket', 'ping'].includes(request.resourceType))).toEqual([]);
  expect(await page.evaluate(() => (window as unknown as { __quoteDecisionBeaconCalls: string[] }).__quoteDecisionBeaconCalls)).toEqual([]);
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
  const link = await page.getByLabel('Client decision link').inputValue();
  expect(new URL(link).hash).toMatch(/^#client\//);
  expect(new URL(link).hash).toContain('client/');
  await expect(page.getByText('This link carries the quote itself. Send it through your own email or message.')).toBeVisible();
  await expect(page.getByText('Anyone with this link can read the reviewed quote.')).toBeVisible();
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

test('@claim:decision-consent-record records the exact consent and typed client name', async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'The isolated client context runs once in Chromium.');
  const link = await createReviewedQuoteLink(page, 'Consent record');
  const clientContext = await browser.newContext({ acceptDownloads: true });
  const clientPage = await clientContext.newPage();
  try {
    await clientPage.goto(link);
    await clientPage.getByText('Accept this quote').click();
    await clientPage.getByLabel('Your full name').fill('Ada Client');
    await clientPage.getByText(CONSENT_TEXT).click();
    const receiptDownload = clientPage.waitForEvent('download');
    await clientPage.getByRole('button', { name: 'Record decision' }).click();
    const receipt = JSON.parse(await downloadText(await receiptDownload));
    expect(receipt.clientName).toBe('Ada Client');
    expect(receipt.consentText).toBe(CONSENT_TEXT);
    await expect(clientPage.getByRole('heading', { name: 'Accepted by Ada Client' })).toBeVisible();
  } finally {
    await clientContext.close();
  }
});

test('@claim:receipt-import imports a valid client receipt and preserves the quote when an invalid receipt is rejected', async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'The isolated client context runs once in Chromium.');
  await resetDemo(page);
  await page.getByRole('link', { name: /Website launch/ }).click();
  await page.getByRole('button', { name: 'Prepare client link' }).click();
  const link = await page.getByLabel('Client decision link').inputValue();
  await page.getByRole('button', { name: 'Mark as sent' }).click();

  const clientContext = await browser.newContext({ acceptDownloads: true });
  const clientPage = await clientContext.newPage();
  let receiptText = '';
  try {
    await clientPage.goto(link);
    await clientPage.getByText('Accept this quote').click();
    await clientPage.getByLabel('Your full name').fill('Ari Patel');
    await clientPage.getByText(CONSENT_TEXT).click();
    const receiptDownload = clientPage.waitForEvent('download');
    await clientPage.getByRole('button', { name: 'Record decision' }).click();
    receiptText = await downloadText(await receiptDownload);
  } finally {
    await clientContext.close();
  }

  await page.locator('#receipt-file').setInputFiles({ name: 'valid-decision.json', mimeType: 'application/json', buffer: Buffer.from(receiptText) });
  await expect(page.getByRole('heading', { name: 'Accepted by Ari Patel' })).toBeVisible();
  await expect(page.locator('#toast')).toContainText('Client decision imported: accepted.');

  const invalidReceipt = JSON.parse(receiptText) as Record<string, unknown>;
  delete invalidReceipt.consentText;
  await page.locator('#receipt-file').setInputFiles({ name: 'missing-consent.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(invalidReceipt)) });
  await expect(page.locator('#toast')).toContainText('explicit-consent evidence');
  await expect(page.getByRole('heading', { name: 'Accepted by Ari Patel' })).toBeVisible();
});

test('@claim:backup-import restores a valid demo backup after reload', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await resetDemo(page);
  await page.goto('/demo/data');
  const backupDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const backup = await downloadText(await backupDownload);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete all quotes' }).click();
  await expect(page.locator('#toast').getByText('All local quotes deleted.')).toBeVisible();
  await page.locator('#backup-file').setInputFiles({ name: 'quote-decision-backup.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await expect(page.locator('#toast').getByText('2 quotes imported.')).toBeVisible();
  await page.reload();
  await page.getByRole('link', { name: 'Quote log' }).click();
  await expect(page.getByText('Cedar & Kite')).toBeVisible();
  await expect(page.getByText('Harrow & Vale')).toBeVisible();
});

test('@claim:delete-local-quotes clears real quotes without changing demo data', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await resetDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).first().click();
  await page.getByRole('link', { name: 'Create a quote' }).click();
  await page.getByLabel('Client name').fill('Delete Me Studio');
  await page.getByLabel('Project').fill('Temporary quote');
  await page.getByLabel('Total amount').fill('1250');
  await page.getByLabel('Scope and deliverables').fill('A quote created to verify local deletion.');
  await page.getByRole('button', { name: 'Save quote' }).click();
  await page.goto('/data');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete all quotes' }).click();
  await page.reload();
  expect(await page.evaluate(() => new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('quote-decision-log', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const count = request.result.transaction('quotes').objectStore('quotes').count();
      count.onerror = () => reject(count.error);
      count.onsuccess = () => resolve(count.result);
    };
  }))).toBe(0);
  await page.goto('/demo');
  await expect(page.getByText('Cedar & Kite')).toBeVisible();
  await expect(page.getByText('Harrow & Vale')).toBeVisible();
});

test('@claim:delete-client-receipt removes a saved client receipt after reload', async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'The isolated client context runs once in Chromium.');
  const link = await createReviewedQuoteLink(page, 'Receipt deletion');
  const clientContext = await browser.newContext({ acceptDownloads: true });
  const clientPage = await clientContext.newPage();
  try {
    await clientPage.goto(link);
    await clientPage.getByText('Accept this quote').click();
    await clientPage.getByLabel('Your full name').fill('Ada Client');
    await clientPage.getByText(CONSENT_TEXT).click();
    const receiptDownload = clientPage.waitForEvent('download');
    await clientPage.getByRole('button', { name: 'Record decision' }).click();
    await receiptDownload;
    clientPage.once('dialog', (dialog) => dialog.accept());
    await clientPage.getByRole('button', { name: 'Delete local receipt' }).click();
    await expect(clientPage.locator('#toast').getByText('Client receipt deleted from this device.')).toBeVisible();
    await clientPage.reload();
    await expect(clientPage.getByRole('heading', { name: 'Record a clear answer' })).toBeVisible();
    expect(await clientPage.evaluate(async () => {
      const names = (await indexedDB.databases()).map((database) => database.name);
      if (!names.includes('quote-decision-client-receipts')) return 0;
      return new Promise<number>((resolve, reject) => {
        const request = indexedDB.open('quote-decision-client-receipts', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const count = request.result.transaction('receipts').objectStore('receipts').count();
          count.onerror = () => reject(count.error);
          count.onsuccess = () => resolve(count.result);
        };
      });
    })).toBe(0);
  } finally {
    await clientContext.close();
  }
});

test('@claim:unlimited-price displays the $19 one-time unlimited option and product checkout handoff', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await page.goto('/');
  const billingOrigin = new URL(page.url()).hostname === 'quote-decision-log.sociobot.in'
    ? 'https://api.sociobot.in'
    : 'https://pilot-api.sociobot.in';
  await expect(page.getByText('Pay $19 once to remove the quote limit.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open $19 checkout' })).toHaveAttribute('href', `${billingOrigin}/api/v1/products/quote-decision-log/checkout`);
  await resetDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/data');
  const checkout = page.getByRole('link', { name: 'Open $19 checkout' });
  await expect(checkout).toBeVisible();
  await expect(checkout).toHaveAttribute('href', `${billingOrigin}/api/v1/products/quote-decision-log/checkout`);
  await expect(page.getByText(/displays a \$19 one-time option for unlimited quotes/i)).toBeVisible();
});

test('@claim:free-five-quotes applies the five-quote free allowance in the demo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One desktop sandbox assertion is sufficient for this claim.');
  await page.goto('/');
  await expect(page.getByText('Use five quotes free.')).toBeVisible();
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

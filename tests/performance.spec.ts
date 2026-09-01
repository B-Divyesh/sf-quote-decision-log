import { expect, test } from '@playwright/test';

const MAX_LAYOUT_SHIFT = 0.05;
const MAX_BLOCKING_TIME_MS = 200;

test('mobile demo stays below layout-shift and main-thread budgets', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The performance budget uses its own 390px mobile context.');
  const context = await browser.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    const measurements = { layoutShifts: [] as number[], longTasks: [] as number[] };
    Object.assign(globalThis, { __performanceBudget: measurements });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) measurements.layoutShifts.push((entry as PerformanceEntry & { value: number }).value);
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) measurements.longTasks.push(entry.duration);
    }).observe({ type: 'longtask', buffered: true });
  });

  try {
    await page.goto('/demo', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Quote log' })).toBeVisible();
    await expect(page.getByText('Cedar & Kite')).toBeVisible();
    await page.waitForTimeout(500);

    const measurements = await page.evaluate(() => (
      globalThis as typeof globalThis & {
        __performanceBudget: { layoutShifts: number[]; longTasks: number[] };
      }
    ).__performanceBudget);
    const cumulativeLayoutShift = measurements.layoutShifts.reduce((total, value) => total + value, 0);
    const blockingTime = measurements.longTasks.reduce((total, duration) => total + Math.max(0, duration - 50), 0);

    await testInfo.attach('mobile-performance-budget.json', {
      body: JSON.stringify({
        viewport: '390x844',
        cpuSlowdown: 4,
        cumulativeLayoutShift,
        blockingTime,
        longTasks: measurements.longTasks,
        budgets: { cumulativeLayoutShift: MAX_LAYOUT_SHIFT, blockingTime: MAX_BLOCKING_TIME_MS },
      }, null, 2),
      contentType: 'application/json',
    });

    expect(cumulativeLayoutShift, 'fresh-load CLS').toBeLessThan(MAX_LAYOUT_SHIFT);
    expect(blockingTime, 'long-task blocking time at 4x CPU slowdown').toBeLessThanOrEqual(MAX_BLOCKING_TIME_MS);
  } finally {
    await context.close();
  }
});

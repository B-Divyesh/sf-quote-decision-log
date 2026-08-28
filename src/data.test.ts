import { describe, expect, it } from 'vitest';
import { decodeShare, digestSnapshot, encodeShare, quoteStatus, stableSnapshot } from './data';
import type { Quote, QuoteSnapshot, SharePayload } from './types';

const snapshot: QuoteSnapshot = {
  number: 'Q-2026-001', clientName: 'North & Pine', clientEmail: 'hello@example.com', project: 'Launch site',
  currency: 'USD', totalCents: 480000, expiresOn: '2026-09-30', scope: 'Design and build.', terms: 'Two rounds.',
};

function quote(overrides: Partial<Quote> = {}): Quote {
  return { id: 'q1', createdAt: '2026-08-28T00:00:00Z', updatedAt: '2026-08-28T00:00:00Z', currentVersion: 1,
    versions: [{ version: 1, createdAt: '2026-08-28T00:00:00Z', digest: 'abc', snapshot }], ...overrides };
}

describe('quote version integrity', () => {
  it('normalizes harmless whitespace and email casing before hashing', async () => {
    const altered = { ...snapshot, clientEmail: 'HELLO@EXAMPLE.COM ', project: ' Launch site ' };
    expect(stableSnapshot(altered)).toBe(stableSnapshot(snapshot));
    expect(await digestSnapshot(altered)).toBe(await digestSnapshot(snapshot));
  });

  it('changes the fingerprint when a commercial detail changes', async () => {
    expect(await digestSnapshot({ ...snapshot, totalCents: 490000 })).not.toBe(await digestSnapshot(snapshot));
  });

  it('round-trips unicode client payloads', async () => {
    const digest = await digestSnapshot(snapshot);
    const payload: SharePayload = { schema: 1, quoteId: 'q1', version: 1, digest, issuedAt: '2026-08-28T00:00:00Z', snapshot: { ...snapshot, clientName: 'Café 森' } };
    expect(decodeShare(encodeShare(payload))).toEqual(payload);
  });
});

describe('quote state', () => {
  it('requires review of the current version', () => {
    expect(quoteStatus(quote({ review: { version: 1, reviewer: 'Mira', reviewedAt: '2026-08-28T00:00:00Z', checks: [] } }))).toBe('ready');
    expect(quoteStatus(quote({ currentVersion: 2, versions: [...quote().versions, { version: 2, createdAt: '', digest: 'def', snapshot }], review: { version: 1, reviewer: 'Mira', reviewedAt: '', checks: [] } }))).toBe('draft');
  });

  it('shows expiry only after sending and lets a decision win', () => {
    const now = new Date('2026-10-01T00:00:00Z');
    expect(quoteStatus(quote({ sentAt: '2026-08-29T00:00:00Z' }), now)).toBe('expired');
    expect(quoteStatus(quote({ sentAt: '2026-08-29T00:00:00Z', decision: { quoteId: 'q1', version: 1, digest: 'abc', decision: 'accepted', clientName: 'Lee', decidedAt: '2026-09-01T00:00:00Z', consentText: 'yes', note: '' } }), now)).toBe('accepted');
  });
});

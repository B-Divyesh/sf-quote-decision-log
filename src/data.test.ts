import { describe, expect, it } from 'vitest';
import { CONSENT_TEXT, decodeShare, digestDecision, digestSnapshot, encodeShare, quoteStatus, stableSnapshot, validateBundle, validateDecision, validateQuote } from './data';
import type { Decision, ExportBundle, Quote, QuoteSnapshot, SharePayload } from './types';

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

describe('portable data integrity', () => {
  const decision = (): Decision => ({
    quoteId: 'q1', version: 1, digest: 'a'.repeat(64), decision: 'declined', clientName: 'Ada Client',
    decidedAt: '2026-08-28T12:00:00.000Z', consentText: CONSENT_TEXT, note: 'Not this round.',
  });

  it('requires exact consent evidence and detects edited decision fields', async () => {
    const genuine = decision();
    const receiptDigest = await digestDecision(genuine);
    await expect(validateDecision({ schema: 2, product: 'quote-decision-log', ...genuine, receiptDigest })).resolves.toMatchObject(genuine);
    await expect(validateDecision({ schema: 2, product: 'quote-decision-log', ...genuine, consentText: '', receiptDigest })).rejects.toThrow(/consent/i);
    await expect(validateDecision({ schema: 2, product: 'quote-decision-log', ...genuine, decision: 'accepted', clientName: 'Edited Import', receiptDigest })).rejects.toThrow(/integrity/i);
  });

  it('rejects a backup with no current version before it reaches storage', async () => {
    const invalid = { schema: 1, product: 'quote-decision-log', exportedAt: '2026-08-28T12:00:00.000Z', quotes: [{ ...quote(), versions: [] }] };
    await expect(validateBundle(invalid)).rejects.toThrow(/no quote versions/i);
  });

  it('accepts a fully valid exported bundle and verifies snapshot fingerprints', async () => {
    const digest = await digestSnapshot(snapshot);
    const validQuote = quote({ versions: [{ version: 1, createdAt: '2026-08-28T00:00:00.000Z', digest, snapshot }] });
    const bundle: ExportBundle = { schema: 1, product: 'quote-decision-log', exportedAt: '2026-08-28T12:00:00.000Z', quotes: [validQuote] };
    await expect(validateBundle(bundle)).resolves.toEqual(bundle);
    validQuote.versions[0].snapshot = { ...snapshot, project: 'Changed after export' };
    await expect(validateBundle(bundle)).rejects.toThrow(/fingerprint/i);
  });

  it('rejects unsafe amounts and overlong reviewers before they can be stored', () => {
    const validVersion = { version: 1, createdAt: '2026-08-28T00:00:00.000Z', digest: 'a'.repeat(64), snapshot };
    expect(() => validateQuote(quote({ versions: [{ ...validVersion, snapshot: { ...snapshot, totalCents: Number.MAX_SAFE_INTEGER + 1 } }] }))).toThrow(/quote details/i);
    expect(() => validateQuote(quote({
      versions: [validVersion],
      review: { version: 1, reviewer: 'R'.repeat(501), reviewedAt: '2026-08-28T00:00:00.000Z', checks: ['assumptions', 'price', 'scope'] },
    }))).toThrow(/review/i);
  });
});

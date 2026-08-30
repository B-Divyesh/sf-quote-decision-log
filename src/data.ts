import type { Decision, DecisionReceipt, ExportBundle, Quote, QuoteSnapshot, QuoteStatus, SharePayload } from './types';

const DB_NAME = 'quote-decision-log';
const STORE = 'quotes';
export const CONSENT_TEXT = 'I confirm I reviewed this exact quote version and intend to record the decision shown.';
const SHA256 = /^[a-f0-9]{64}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.includes('T') && Number.isFinite(Date.parse(value));
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function requiredText(value: unknown, maximum = 10_000): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum;
}

function assertSnapshot(value: unknown, context: string): asserts value is QuoteSnapshot {
  if (!isRecord(value) || !requiredText(value.number, 200) || !requiredText(value.clientName, 500) ||
      typeof value.clientEmail !== 'string' || value.clientEmail.length > 500 || !requiredText(value.project, 500) ||
      !requiredText(value.currency, 3) || !/^[A-Z]{3}$/.test(value.currency) ||
      !Number.isSafeInteger(value.totalCents) || Number(value.totalCents) < 0 || !validDate(value.expiresOn) ||
      !requiredText(value.scope, 50_000) || typeof value.terms !== 'string' || value.terms.length > 50_000) {
    throw new Error(`${context} has invalid or missing quote details.`);
  }
}

function assertDecision(value: unknown, context: string, requireReceiptDigest: boolean): asserts value is Decision {
  if (!isRecord(value) || !requiredText(value.quoteId, 200) || !Number.isSafeInteger(value.version) || Number(value.version) < 1 ||
      typeof value.digest !== 'string' || !SHA256.test(value.digest) ||
      (value.decision !== 'accepted' && value.decision !== 'declined') || !requiredText(value.clientName, 500) ||
      value.clientName.trim().length < 2 || !validTimestamp(value.decidedAt) || value.consentText !== CONSENT_TEXT ||
      typeof value.note !== 'string' || value.note.length > 500 ||
      (requireReceiptDigest && (typeof value.receiptDigest !== 'string' || !SHA256.test(value.receiptDigest)))) {
    throw new Error(`${context} is missing valid decision or explicit-consent evidence.`);
  }
  if (value.receiptDigest !== undefined && (typeof value.receiptDigest !== 'string' || !SHA256.test(value.receiptDigest))) {
    throw new Error(`${context} has an invalid integrity fingerprint.`);
  }
}

export function validateQuote(value: unknown, context = 'A stored quote'): Quote {
  if (!isRecord(value) || !requiredText(value.id, 200) || !validTimestamp(value.createdAt) ||
      !validTimestamp(value.updatedAt) || !Number.isSafeInteger(value.currentVersion) || Number(value.currentVersion) < 1 ||
      !Array.isArray(value.versions) || value.versions.length === 0) {
    throw new Error(`${context} has an invalid structure or no quote versions.`);
  }

  const versions = value.versions;
  const versionNumbers = new Set<number>();
  for (const [index, entry] of versions.entries()) {
    if (!isRecord(entry) || !Number.isSafeInteger(entry.version) || Number(entry.version) < 1 ||
        versionNumbers.has(Number(entry.version)) || !validTimestamp(entry.createdAt) ||
        typeof entry.digest !== 'string' || !SHA256.test(entry.digest)) {
      throw new Error(`${context}, version ${index + 1}, has invalid version metadata.`);
    }
    assertSnapshot(entry.snapshot, `${context}, version ${entry.version}`);
    versionNumbers.add(Number(entry.version));
  }
  if (!versionNumbers.has(Number(value.currentVersion))) throw new Error(`${context} does not contain its current version.`);

  if (value.review !== undefined) {
    const review = value.review;
    const requiredChecks = ['assumptions', 'price', 'scope'];
    if (!isRecord(review) || review.version !== value.currentVersion || !requiredText(review.reviewer, 500) ||
        review.reviewer.trim().length < 2 || !validTimestamp(review.reviewedAt) || !Array.isArray(review.checks) ||
        [...new Set(review.checks)].sort().join(',') !== requiredChecks.join(',')) {
      throw new Error(`${context} has an invalid internal review record.`);
    }
  }
  if (value.sentAt !== undefined && (!validTimestamp(value.sentAt) || value.review === undefined)) {
    throw new Error(`${context} has an invalid sent record.`);
  }

  const versionMap = new Map(versions.map((entry) => [entry.version, entry.digest]));
  const checkDecision = (decision: unknown, label: string, current: boolean): void => {
    assertDecision(decision, `${context} ${label}`, false);
    if (decision.quoteId !== value.id || versionMap.get(decision.version) !== decision.digest ||
        (current && decision.version !== value.currentVersion)) {
      throw new Error(`${context} ${label} does not match a saved quote version.`);
    }
  };
  if (value.decision !== undefined) checkDecision(value.decision, 'decision', true);
  if (value.decisionHistory !== undefined) {
    if (!Array.isArray(value.decisionHistory)) throw new Error(`${context} has invalid decision history.`);
    value.decisionHistory.forEach((decision, index) => checkDecision(decision, `decision history item ${index + 1}`, false));
  }
  return value as unknown as Quote;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('This browser does not provide local storage. Try a current browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Your local quote log could not be opened. Check browser storage permissions.'));
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const request = run(transaction.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('The local quote log could not be updated.'));
    transaction.oncomplete = () => db.close();
  });
}

export const quoteStore = {
  async all(): Promise<Quote[]> {
    const rows = await withStore<Quote[]>('readonly', (store) => store.getAll());
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  get(id: string): Promise<Quote | undefined> {
    return withStore<Quote | undefined>('readonly', (store) => store.get(id));
  },
  put(quote: Quote): Promise<IDBValidKey> {
    // Every write goes through the same schema guard used for imports and reads.
    // UI constraints improve recovery, but are not a persistence boundary.
    validateQuote(quote, 'The quote you are saving');
    return withStore<IDBValidKey>('readwrite', (store) => store.put(quote));
  },
  remove(id: string): Promise<undefined> {
    return withStore<undefined>('readwrite', (store) => store.delete(id));
  },
  clear(): Promise<undefined> {
    return withStore<undefined>('readwrite', (store) => store.clear());
  },
};

export function stableSnapshot(snapshot: QuoteSnapshot): string {
  return JSON.stringify({
    number: snapshot.number.trim(),
    clientName: snapshot.clientName.trim(),
    clientEmail: snapshot.clientEmail.trim().toLowerCase(),
    project: snapshot.project.trim(),
    currency: snapshot.currency,
    totalCents: snapshot.totalCents,
    expiresOn: snapshot.expiresOn,
    scope: snapshot.scope.trim(),
    terms: snapshot.terms.trim(),
  });
}

export async function digestSnapshot(snapshot: QuoteSnapshot): Promise<string> {
  const bytes = new TextEncoder().encode(stableSnapshot(snapshot));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function currentSnapshot(quote: Quote): QuoteSnapshot {
  const version = quote.versions.find((item) => item.version === quote.currentVersion);
  if (!version) throw new Error('This quote has no readable current version. Open Data and license to recover or delete local data.');
  return version.snapshot;
}

export function quoteStatus(quote: Quote, now = new Date()): QuoteStatus {
  if (quote.decision) return quote.decision.decision;
  const snapshot = currentSnapshot(quote);
  const expiry = new Date(`${snapshot.expiresOn}T23:59:59`);
  if (quote.sentAt && expiry.getTime() < now.getTime()) return 'expired';
  if (quote.sentAt) return 'sent';
  if (quote.review?.version === quote.currentVersion) return 'ready';
  return 'draft';
}

export function encodeShare(payload: SharePayload): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export function decodeShare(value: string): SharePayload {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const parsed = JSON.parse(new TextDecoder().decode(bytes)) as SharePayload;
  if (parsed.schema !== 1 || !requiredText(parsed.quoteId, 200) || !Number.isSafeInteger(parsed.version) || parsed.version < 1 ||
      typeof parsed.digest !== 'string' || !SHA256.test(parsed.digest) || !validTimestamp(parsed.issuedAt)) throw new Error('Invalid quote link.');
  assertSnapshot(parsed.snapshot, 'The quote link');
  return parsed;
}

function stableDecision(decision: Decision): string {
  return JSON.stringify({
    quoteId: decision.quoteId,
    version: decision.version,
    digest: decision.digest,
    decision: decision.decision,
    clientName: decision.clientName.trim(),
    decidedAt: decision.decidedAt,
    consentText: decision.consentText,
    note: decision.note.trim(),
  });
}

export async function digestDecision(decision: Decision): Promise<string> {
  const bytes = new TextEncoder().encode(stableDecision(decision));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function validateDecision(value: unknown): Promise<DecisionReceipt> {
  if (!isRecord(value) || value.schema !== 2 || value.product !== 'quote-decision-log') {
    throw new Error('That file is not a current Quote Decision receipt with integrity evidence. Ask the client to download it again.');
  }
  assertDecision(value, 'That receipt', true);
  const receipt = value as unknown as DecisionReceipt;
  if (await digestDecision(receipt) !== receipt.receiptDigest) {
    throw new Error('The receipt integrity check failed. Its decision details may have been changed.');
  }
  return receipt;
}

export async function validateBundle(value: unknown): Promise<ExportBundle> {
  if (!isRecord(value) || value.schema !== 1 || value.product !== 'quote-decision-log' ||
      !validTimestamp(value.exportedAt) || !Array.isArray(value.quotes)) {
    throw new Error('That file is not a Quote Decision backup.');
  }
  const quotes = value.quotes.map((quote, index) => validateQuote(quote, `Backup quote ${index + 1}`));
  if (new Set(quotes.map((quote) => quote.id)).size !== quotes.length) throw new Error('The backup contains duplicate quote IDs.');
  for (const [quoteIndex, quote] of quotes.entries()) {
    for (const version of quote.versions) {
      if (await digestSnapshot(version.snapshot) !== version.digest) {
        throw new Error(`Backup quote ${quoteIndex + 1}, version ${version.version}, does not match its fingerprint.`);
      }
    }
    for (const decision of [quote.decision, ...(quote.decisionHistory ?? [])]) {
      if (decision?.receiptDigest && await digestDecision(decision) !== decision.receiptDigest) {
        throw new Error(`Backup quote ${quoteIndex + 1} has an altered decision record.`);
      }
    }
  }
  return value as unknown as ExportBundle;
}

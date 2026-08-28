import type { Decision, ExportBundle, Quote, QuoteSnapshot, QuoteStatus, SharePayload } from './types';

const DB_NAME = 'quote-decision-log';
const STORE = 'quotes';

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
  return quote.versions.find((item) => item.version === quote.currentVersion)?.snapshot ?? quote.versions.at(-1)!.snapshot;
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
  if (parsed.schema !== 1 || !parsed.snapshot || !parsed.digest || !parsed.quoteId) throw new Error('Invalid quote link.');
  return parsed;
}

export function validateDecision(value: unknown): Decision {
  const receipt = value as Partial<Decision>;
  if (!receipt || !receipt.quoteId || !receipt.digest || !receipt.clientName || !receipt.decidedAt ||
      (receipt.decision !== 'accepted' && receipt.decision !== 'declined') || typeof receipt.version !== 'number') {
    throw new Error('That file is not a valid Quote Decision receipt.');
  }
  return receipt as Decision;
}

export function validateBundle(value: unknown): ExportBundle {
  const bundle = value as Partial<ExportBundle>;
  if (bundle.schema !== 1 || bundle.product !== 'quote-decision-log' || !Array.isArray(bundle.quotes)) {
    throw new Error('That file is not a Quote Decision backup.');
  }
  return bundle as ExportBundle;
}

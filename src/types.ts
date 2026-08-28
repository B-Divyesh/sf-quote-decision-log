export type QuoteStatus = 'draft' | 'ready' | 'sent' | 'accepted' | 'declined' | 'expired';

export interface QuoteSnapshot {
  number: string;
  clientName: string;
  clientEmail: string;
  project: string;
  currency: string;
  totalCents: number;
  expiresOn: string;
  scope: string;
  terms: string;
}

export interface QuoteVersion {
  version: number;
  createdAt: string;
  digest: string;
  snapshot: QuoteSnapshot;
}

export interface Review {
  version: number;
  reviewer: string;
  reviewedAt: string;
  checks: string[];
}

export interface Decision {
  quoteId: string;
  version: number;
  digest: string;
  decision: 'accepted' | 'declined';
  clientName: string;
  decidedAt: string;
  consentText: string;
  note: string;
}

export interface Quote {
  id: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: number;
  versions: QuoteVersion[];
  review?: Review;
  sentAt?: string;
  decision?: Decision;
  decisionHistory?: Decision[];
}

export interface SharePayload {
  schema: 1;
  quoteId: string;
  version: number;
  digest: string;
  issuedAt: string;
  snapshot: QuoteSnapshot;
}

export interface ExportBundle {
  schema: 1;
  product: 'quote-decision-log';
  exportedAt: string;
  quotes: Quote[];
}

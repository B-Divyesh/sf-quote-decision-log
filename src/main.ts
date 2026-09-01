import './styles.css';
import hero640 from './assets/dispatch-gate-640.webp';
import hero960 from './assets/dispatch-gate-960.webp';
import { clientReceiptStore, CONSENT_TEXT, currentSnapshot, decodeShare, digestDecision, digestSnapshot, encodeShare, quoteStatus, quoteStore, useDemoQuoteStorage, validateBundle, validateDecision, validateQuote } from './data';
import { csvEscape, downloadText } from './download';
import { captureReturnedLicense, checkoutUrl, clearLicense, isUnlocked, licenseToken, saveLicense, verifyLicense } from './license';
import type { Decision, ExportBundle, Quote, QuoteSnapshot, SharePayload } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const FREE_LIMIT = 5;
const MAX_SAFE_AMOUNT = '90071992547409.91';
let quotes: Quote[] = [];
let storageError = '';
let toastTimer = 0;
const demoMode = location.pathname === '/demo' || location.pathname.startsWith('/demo/') || new URLSearchParams(location.search).get('demo') === '1';

// A demo is a separate IndexedDB database, never a view over real quotes.
useDemoQuoteStorage(demoMode);

type AppRoute = 'home' | 'new' | 'data' | `quote/${string}` | `edit/${string}`;

function appPath(route: AppRoute = 'home'): string {
  const base = demoMode ? '/demo' : '';
  if (route === 'home') return base || '/';
  return `${base}/${route}`;
}

function currentRoute(): AppRoute {
  const base = demoMode ? '/demo' : '';
  const route = location.pathname.slice(base.length).replace(/^\/+|\/+$/g, '');
  if (!route) return 'home';
  if (route === 'new' || route === 'data' || route.startsWith('quote/') || route.startsWith('edit/')) return route as AppRoute;
  return 'home';
}

function routeForCurrentMode(pathname: string): AppRoute | null {
  const base = demoMode ? '/demo' : '';
  if (demoMode ? !(pathname === '/demo' || pathname.startsWith('/demo/')) : pathname.startsWith('/demo')) return null;
  const segment = pathname.slice(base.length).replace(/^\/+|\/+$/g, '');
  if (!segment) return 'home';
  if (segment === 'new' || segment === 'data' || segment.startsWith('quote/') || segment.startsWith('edit/')) return segment as AppRoute;
  return null;
}

function setDocumentDetails(title: string, description: string): void {
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `${location.origin}${location.pathname}`);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', `${location.origin}${location.pathname}`);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
}

function navigate(destination: AppRoute): void {
  const target = appPath(destination);
  if (location.pathname === target && !location.hash) { route(true); return; }
  history.pushState(null, '', target);
  route(true);
}

function hasUnlimitedQuotes(): boolean {
  return !demoMode && isUnlocked();
}

const escapeHtml = (value: string | number | undefined) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

function money(cents: number, currency: string): string {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100); }
  catch { return `${currency} ${(cents / 100).toFixed(2)}`; }
}

function dateLabel(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso.includes('T') ? iso : `${iso}T12:00:00`));
}

function statusLabel(status: ReturnType<typeof quoteStatus>): string {
  return ({ draft: 'Needs review', ready: 'Send-ready', sent: 'Awaiting client', accepted: 'Accepted', declined: 'Declined', expired: 'Expired' })[status];
}

function icon(name: 'home' | 'new' | 'data' | 'privacy' | 'check' | 'arrow' | 'copy' | 'download'): string {
  const paths = {
    home: '<path d="M4 11.5 12 5l8 6.5V20h-6v-5h-4v5H4z"/>',
    new: '<path d="M12 5v14M5 12h14"/>',
    data: '<path d="M5 5h14v14H5zM8 9h8M8 13h8M8 17h5"/>',
    privacy: '<path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6zM9 12l2 2 4-5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    copy: '<path d="M8 8h11v11H8zM5 16H4V4h12v1"/>',
    download: '<path d="M12 4v11m-4-4 4 4 4-4M5 19h14"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
}

function shell(content: string, section = 'home'): string {
  return `<div class="shell">
    <header class="rail">
      <a class="brand" href="${appPath()}" aria-label="Quote Decision home"><span class="brand-mark">QD</span><span>Quote<br>Decision</span></a>
      <nav aria-label="Primary">
        <a href="${appPath()}" ${section === 'home' && !demoMode ? 'aria-current="page"' : ''}>${icon('home')}<span>Quote log</span></a>
        <a href="${appPath('data')}" ${section === 'data' ? 'aria-current="page"' : ''}>${icon('data')}<span>Data & license</span></a>
        <a href="/demo" ${demoMode && section !== 'data' ? 'aria-current="page"' : ''}>${icon('check')}<span>Try demo</span></a>
        <a href="/privacy/">${icon('privacy')}<span>Privacy</span></a>
      </nav>
      <div class="rail-foot"><span id="network-state" class="network-state"><i></i>${navigator.onLine ? 'Online' : 'Offline'}</span><span class="privacy-note">Stored on this device</span></div>
    </header>
    <div id="offline-banner" class="offline-banner" ${navigator.onLine ? 'hidden' : ''}>Offline — changes stay here on this device.</div>
    <main id="main" tabindex="-1">${demoMode ? '<aside class="demo-banner" aria-label="Demo mode"><span><b>Demo</b> — sample data, nothing is saved.</span><button type="button" data-reset-demo>Reset demo</button><a href="/">Start for real</a></aside>' : ''}${content}</main>
    <footer><span>Quote review and client decisions for tiny agencies.</span><span><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></span><span>Built by Param Factory · v1.0.4</span></footer>
    <div id="live" class="sr-only" aria-live="polite"></div>
    <div id="toast" class="toast" role="status" hidden></div>
  </div>`;
}

function workflow(active: number): string {
  const labels = ['Draft', 'Reviewed', 'Sent', 'Decision'];
  return `<ol class="route" aria-label="Quote progress">${labels.map((label, index) => `<li class="${index < active ? 'complete' : index === active ? 'active' : ''}"><span>${index < active ? '✓' : index + 1}</span>${label}</li>`).join('')}</ol>`;
}

function setToast(message: string, action?: string): void {
  const element = document.querySelector<HTMLDivElement>('#toast');
  const live = document.querySelector<HTMLDivElement>('#live');
  if (!element) return;
  clearTimeout(toastTimer);
  element.hidden = false;
  element.innerHTML = `<span>${escapeHtml(message)}</span>${action ? `<button type="button" data-toast-action>${escapeHtml(action)}</button>` : ''}`;
  if (live) live.textContent = message;
  if (!action) toastTimer = window.setTimeout(() => { element.hidden = true; }, 4000);
}

function renderError(title: string, detail: string): void {
  app.innerHTML = shell(`<section class="empty compact"><span class="station-code">SERVICE NOTICE</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(detail)}</p><div class="button-row centered"><button class="button primary" data-retry>Try again</button><a class="button secondary" href="${appPath('data')}">Open data recovery</a></div></section>`);
  document.querySelector('[data-retry]')?.addEventListener('click', () => void boot());
}

function dashboard(): void {
  if (storageError) { renderError('Local storage is unavailable', storageError); return; }
  if (!quotes.length) {
    app.innerHTML = shell(`<section class="hero">
      <div class="hero-copy"><span class="eyebrow">Quote review and decision record</span><h1>Review quotes before you send them.</h1><p>For tiny agencies that need one checked quote and a clear client answer before work starts.</p><div class="hero-actions"><a class="button primary" href="/demo">Try it with sample data ${icon('arrow')}</a><span>See two sample quotes; no data is saved.</span><a class="text-action" href="${appPath('new')}">Create a quote</a></div><ul class="plain-facts"><li>Stored in this browser</li><li>Works offline after the first visit</li><li>$19 one-time unlimited option</li></ul></div>
      <figure><picture><source media="(max-width: 700px)" srcset="${hero640}"><img src="${hero960}" width="960" height="640" alt="Geometric rail lines passing through a brass checkpoint toward a ticket" fetchpriority="high" decoding="async"></picture><figcaption>Review before sending.</figcaption></figure>
    </section><section class="how"><span class="station-code">HOW IT WORKS</span><h2>Review, send, then record the answer.</h2><ol><li><b>01</b><span><strong>Draft</strong>Capture scope, value, and expiry.</span></li><li><b>02</b><span><strong>Review</strong>A named teammate checks the exact version.</span></li><li><b>03</b><span><strong>Send</strong>Share a link that carries the reviewed quote.</span></li><li><b>04</b><span><strong>Record</strong>Import the client’s consent receipt.</span></li></ol></section>`);
    bindShared();
    return;
  }

  const counts = quotes.reduce((acc, quote) => { acc[quoteStatus(quote)]++; return acc; }, { draft: 0, ready: 0, sent: 0, accepted: 0, declined: 0, expired: 0 });
  app.innerHTML = shell(`<header class="page-head"><div><span class="eyebrow">Decision control</span><h1>Quote log</h1><p>${quotes.length} quote${quotes.length === 1 ? '' : 's'} held on this device.</p></div><a class="button primary" href="${appPath('new')}">${icon('new')} New quote</a></header>
    <section class="signal-row" aria-label="Quote totals"><div><b>${counts.draft + counts.ready}</b><span>Before send</span></div><div><b>${counts.sent + counts.expired}</b><span>Awaiting</span></div><div><b>${counts.accepted}</b><span>Accepted</span></div><div><b>${counts.declined}</b><span>Declined</span></div></section>
    <section class="quote-list" aria-labelledby="log-heading"><div class="section-heading"><div><span class="station-code">LOCAL REGISTER</span><h2 id="log-heading">Recent quotes</h2></div><label class="search"><span>Filter quotes</span><input id="filter" type="search" placeholder="Client, project, or number"></label></div>
      <div id="quote-rows">${quotes.map(quoteRow).join('')}</div><p id="no-results" class="empty-line" hidden>No quotes match that filter.</p>
    </section>`, 'home');
  document.querySelector<HTMLInputElement>('#filter')?.addEventListener('input', (event) => {
    const query = (event.currentTarget as HTMLInputElement).value.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll<HTMLElement>('[data-search]').forEach((row) => { const visible = row.dataset.search?.includes(query) ?? true; row.hidden = !visible; if (visible) shown++; });
    const noResults = document.querySelector<HTMLElement>('#no-results');
    if (noResults) noResults.hidden = shown > 0;
  });
  bindShared();
}

function quoteRow(quote: Quote): string {
  const snapshot = currentSnapshot(quote);
  const status = quoteStatus(quote);
  return `<a class="quote-row" href="${appPath(`quote/${quote.id}`)}" data-search="${escapeHtml(`${snapshot.number} ${snapshot.clientName} ${snapshot.project}`.toLowerCase())}">
    <span class="status-symbol status-${status}" aria-hidden="true">${status === 'accepted' ? '✓' : status === 'declined' ? '×' : status === 'expired' ? '!' : '•'}</span>
    <span class="quote-main"><strong>${escapeHtml(snapshot.project)}</strong><small>${escapeHtml(snapshot.clientName)} · ${escapeHtml(snapshot.number)}</small></span>
    <span class="quote-value">${escapeHtml(money(snapshot.totalCents, snapshot.currency))}<small>Expires ${escapeHtml(dateLabel(snapshot.expiresOn))}</small></span>
    <span class="status-pill status-${status}">${escapeHtml(statusLabel(status))}</span>${icon('arrow')}
  </a>`;
}

function quoteForm(existing?: Quote): void {
  const snapshot = existing ? currentSnapshot(existing) : null;
  const today = new Date();
  today.setDate(today.getDate() + 30);
  if (!existing && quotes.length >= FREE_LIMIT && !hasUnlimitedQuotes()) { paywall(); return; }
  app.innerHTML = shell(`<header class="page-head"><div><a class="back-link" href="${existing ? appPath(`quote/${existing.id}`) : appPath()}">← Back</a><span class="eyebrow">${existing ? `Version ${existing.currentVersion}` : 'New route'}</span><h1>${existing ? 'Edit quote' : 'Create a quote'}</h1><p>${existing ? 'Saving a changed reviewed quote creates a new version and clears approval.' : 'Capture the commercial promise. You can review it next.'}</p></div></header>
    <form id="quote-form" class="form-panel" novalidate>
      <div class="form-section"><span class="station-code">IDENTITY</span><h2>Quote and client</h2><div class="field-grid three"><label>Quote number<input name="number" required maxlength="200" aria-describedby="number-error" value="${escapeHtml(snapshot?.number ?? `Q-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`)}"><span class="field-error" id="number-error" hidden>Enter a quote number, not only spaces.</span></label><label>Client name<input name="clientName" autocomplete="organization" required maxlength="500" aria-describedby="clientName-error" value="${escapeHtml(snapshot?.clientName)}"><span class="field-error" id="clientName-error" hidden>Enter a client name, not only spaces.</span></label><label>Client email <span>(optional)</span><input name="clientEmail" type="email" autocomplete="email" maxlength="500" value="${escapeHtml(snapshot?.clientEmail)}"></label></div></div>
      <div class="form-section"><span class="station-code">COMMITMENT</span><h2>Work and value</h2><div class="field-grid"><label>Project<input name="project" required maxlength="500" aria-describedby="project-error" value="${escapeHtml(snapshot?.project)}"><span class="field-error" id="project-error" hidden>Enter a project name, not only spaces.</span></label><label>Expiry date<input name="expiresOn" type="date" required value="${escapeHtml(snapshot?.expiresOn ?? today.toISOString().slice(0, 10))}"></label><label>Currency<select name="currency"><option>USD</option><option>EUR</option><option>GBP</option><option>INR</option><option>AUD</option><option>CAD</option></select></label><label>Total amount<input name="amount" type="number" min="0" max="${MAX_SAFE_AMOUNT}" step="0.01" inputmode="decimal" required aria-describedby="amount-error" value="${snapshot ? (snapshot.totalCents / 100).toFixed(2) : ''}"><span class="field-error" id="amount-error" hidden>Enter an amount up to ${MAX_SAFE_AMOUNT}; larger amounts cannot be stored safely.</span></label></div><label>Scope and deliverables<textarea name="scope" required maxlength="50000" rows="7" aria-describedby="scope-error">${escapeHtml(snapshot?.scope)}</textarea><span class="field-error" id="scope-error" hidden>Describe the scope; spaces alone cannot be saved.</span></label><label>Terms or assumptions <span>(optional)</span><textarea name="terms" maxlength="50000" rows="4">${escapeHtml(snapshot?.terms)}</textarea></label></div>
      <div id="form-error" class="form-error" role="alert" hidden></div><div class="form-actions"><button class="button primary" type="submit">${existing ? 'Save version' : 'Save quote'} ${icon('arrow')}</button><a class="button secondary" href="${existing ? appPath(`quote/${existing.id}`) : appPath()}">Cancel</a></div>
    </form>`, existing ? 'home' : 'new');
  const currency = document.querySelector<HTMLSelectElement>('[name="currency"]');
  if (currency && snapshot) currency.value = snapshot.currency;
  document.querySelector<HTMLFormElement>('#quote-form')?.addEventListener('submit', (event) => void saveQuote(event, existing));
  bindShared();
}

async function saveQuote(event: SubmitEvent, existing?: Quote): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const error = document.querySelector<HTMLDivElement>('#form-error')!;
  const requiredText = ['number', 'clientName', 'project', 'scope'];
  for (const name of requiredText) {
    const field = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
    const fieldError = document.querySelector<HTMLElement>(`#${name}-error`);
    const blank = field.value.trim().length === 0;
    field.setCustomValidity(blank ? fieldError?.textContent ?? 'Enter a value, not only spaces.' : '');
    if (fieldError) fieldError.hidden = !blank;
    field.addEventListener('input', () => { field.setCustomValidity(''); if (fieldError) fieldError.hidden = true; }, { once: true });
  }
  if (!form.reportValidity()) { error.hidden = false; error.textContent = 'Complete the highlighted fields before saving.'; return; }
  const values = new FormData(form);
  const amount = Number(values.get('amount'));
  const cents = Math.round(amount * 100);
  const amountError = document.querySelector<HTMLElement>('#amount-error');
  if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(cents)) {
    error.hidden = false; error.textContent = `Enter an amount up to ${MAX_SAFE_AMOUNT}; larger amounts cannot be stored safely.`;
    if (amountError) amountError.hidden = false;
    return;
  }
  if (amountError) amountError.hidden = true;
  const snapshot: QuoteSnapshot = {
    number: String(values.get('number')).trim(), clientName: String(values.get('clientName')).trim(), clientEmail: String(values.get('clientEmail')).trim(),
    project: String(values.get('project')).trim(), currency: String(values.get('currency')), totalCents: cents,
    expiresOn: String(values.get('expiresOn')), scope: String(values.get('scope')).trim(), terms: String(values.get('terms')).trim(),
  };
  try {
    const digest = await digestSnapshot(snapshot);
    const now = new Date().toISOString();
    if (existing && existing.versions.some((version) => version.digest === digest)) { navigate(`quote/${existing.id}`); setToast('No changes to save.'); return; }
    const version = existing ? existing.currentVersion + 1 : 1;
    const quote: Quote = existing ? { ...existing, updatedAt: now, currentVersion: version, versions: [...existing.versions, { version, createdAt: now, digest, snapshot }], review: undefined, sentAt: undefined, decisionHistory: existing.decision ? [...(existing.decisionHistory ?? []), existing.decision] : existing.decisionHistory, decision: undefined } : { id: crypto.randomUUID(), createdAt: now, updatedAt: now, currentVersion: 1, versions: [{ version: 1, createdAt: now, digest, snapshot }] };
    validateQuote(quote, 'This quote');
    await quoteStore.put(quote);
    await refreshQuotes();
    navigate(`quote/${quote.id}`);
    setToast(existing ? 'New version saved; review is required again.' : 'Quote saved. Review it before sending.');
  } catch (caught) { error.hidden = false; error.textContent = caught instanceof Error ? caught.message : 'The quote could not be saved.'; }
}

function quoteDetail(quote: Quote): void {
  const snapshot = currentSnapshot(quote);
  const version = quote.versions.find((item) => item.version === quote.currentVersion)!;
  const status = quoteStatus(quote);
  const active = status === 'draft' ? 0 : status === 'ready' ? 1 : status === 'sent' || status === 'expired' ? 2 : 3;
  const nextAction = status === 'draft'
    ? `<button class="button primary" data-open-review>Review quote ${icon('arrow')}</button>`
    : status === 'ready'
      ? `<button class="button primary" data-open-share>Prepare client link ${icon('arrow')}</button>`
      : status === 'sent' || status === 'expired'
        ? `<button class="button primary" data-open-share>View decision link</button><button class="button secondary" data-import-receipt>Import decision receipt</button>`
        : `<button class="button primary" data-export-receipt>${icon('download')} Export decision receipt</button>`;
  app.innerHTML = shell(`<header class="page-head quote-head"><div><a class="back-link" href="${appPath()}">← Quote log</a><span class="eyebrow">${escapeHtml(snapshot.number)} · Version ${quote.currentVersion}</span><h1>${escapeHtml(snapshot.project)}</h1><p>Prepared for ${escapeHtml(snapshot.clientName)}.</p></div><span class="status-pill large status-${status}">${escapeHtml(statusLabel(status))}</span></header>
    ${workflow(active)}
    <div class="quote-layout"><section class="paper" aria-labelledby="quote-summary"><div class="paper-top"><div><span class="station-code">QUOTE ${escapeHtml(snapshot.number)}</span><h2 id="quote-summary">${escapeHtml(snapshot.project)}</h2><p>For ${escapeHtml(snapshot.clientName)}${snapshot.clientEmail ? ` · ${escapeHtml(snapshot.clientEmail)}` : ''}</p></div><strong class="total">${escapeHtml(money(snapshot.totalCents, snapshot.currency))}</strong></div><div class="paper-meta"><span><b>Version</b>${quote.currentVersion}</span><span><b>Expires</b>${escapeHtml(dateLabel(snapshot.expiresOn))}</span><span><b>Fingerprint</b><code title="Full fingerprint: ${version.digest}">${version.digest.slice(0, 12)}…</code></span></div><div class="scope"><h3>Scope and deliverables</h3><p>${escapeHtml(snapshot.scope).replaceAll('\n', '<br>')}</p>${snapshot.terms ? `<h3>Terms and assumptions</h3><p>${escapeHtml(snapshot.terms).replaceAll('\n', '<br>')}</p>` : ''}</div></section>
      <aside class="dispatch"><span class="station-code">DISPATCH DESK</span><h2>Next stop</h2>${dispatchCopy(quote, status)}<div class="action-stack">${nextAction}</div><div class="minor-actions"><a href="${appPath(`edit/${quote.id}`)}">Edit quote</a><button type="button" class="link-button danger-link" data-delete-quote>Delete quote</button></div></aside>
    </div>
    ${quote.review ? `<section class="audit"><span class="audit-mark">✓</span><div><span class="station-code">INTERNAL REVIEW</span><h2>Cleared by ${escapeHtml(quote.review.reviewer)}</h2><p>Version ${quote.review.version} reviewed ${escapeHtml(dateLabel(quote.review.reviewedAt))}. Checked scope, price, and delivery assumptions.</p></div></section>` : ''}
    ${quote.decision ? decisionPanel(quote.decision) : ''}
    ${quote.decisionHistory?.length ? `<section class="audit-history"><span class="station-code">RETIRED VERSION DECISIONS</span><h2>Earlier receipts</h2><ul>${quote.decisionHistory.map((item) => `<li>Version ${item.version}: <b>${item.decision}</b> by ${escapeHtml(item.clientName)} on ${escapeHtml(dateLabel(item.decidedAt))} · <code>${item.digest.slice(0, 12)}…</code></li>`).join('')}</ul><p>These decisions remain in the audit trail but do not apply to the current version.</p></section>` : ''}
    <input id="receipt-file" type="file" accept="application/json,.json" hidden>`, 'home');

  document.querySelector('[data-open-review]')?.addEventListener('click', () => reviewScreen(quote));
  document.querySelector('[data-open-share]')?.addEventListener('click', () => void shareScreen(quote));
  document.querySelector('[data-import-receipt]')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#receipt-file')?.click());
  document.querySelector<HTMLInputElement>('#receipt-file')?.addEventListener('change', (event) => void importReceiptFile(event));
  document.querySelector('[data-export-receipt]')?.addEventListener('click', () => { if (quote.decision) void exportReceipt(quote.decision, snapshot.number); });
  document.querySelector('[data-delete-quote]')?.addEventListener('click', () => void deleteQuote(quote));
  bindShared();
}

function dispatchCopy(quote: Quote, status: ReturnType<typeof quoteStatus>): string {
  if (status === 'draft') return '<p>Have one teammate verify what you are about to promise. Their name and checks stay with this version.</p>';
  if (status === 'ready') return `<p>Version ${quote.currentVersion} passed review. Create the client link, then mark it sent.</p>`;
  if (status === 'sent') return '<p>The reviewed version is out. The client can accept or decline without an account, then return a receipt.</p>';
  if (status === 'expired') return '<p>This quote passed its expiry date without a recorded decision. You can still inspect its link or create a revised version.</p>';
  return `<p>The client ${status} this exact version. The decision receipt is preserved below.</p>`;
}

function decisionPanel(decision: Decision): string {
  return `<section class="decision-panel decision-${decision.decision}"><span class="decision-seal">${decision.decision === 'accepted' ? '✓' : '×'}</span><div><span class="station-code">CLIENT DECISION</span><h2>${decision.decision === 'accepted' ? 'Accepted' : 'Declined'} by ${escapeHtml(decision.clientName)}</h2><p>${escapeHtml(dateLabel(decision.decidedAt))} · Version ${decision.version} · Fingerprint <code>${decision.digest.slice(0, 12)}…</code></p>${decision.note ? `<blockquote>${escapeHtml(decision.note)}</blockquote>` : ''}<small>This records explicit click consent; it is not represented as a regulated electronic signature.</small></div></section>`;
}

function reviewScreen(quote: Quote): void {
  const snapshot = currentSnapshot(quote);
  app.innerHTML = shell(`<header class="page-head"><div><a class="back-link" href="${appPath(`quote/${quote.id}`)}">← Quote ${escapeHtml(snapshot.number)}</a><span class="eyebrow">Internal checkpoint · Version ${quote.currentVersion}</span><h1>Review before sending</h1><p>Confirm the exact scope, price, and assumptions below. All checks are required.</p></div></header>${workflow(0)}
    <div class="review-layout"><section class="review-sheet"><span class="station-code">REVIEW COPY</span><h2>${escapeHtml(snapshot.project)}</h2><dl><div><dt>Client</dt><dd>${escapeHtml(snapshot.clientName)}</dd></div><div><dt>Total</dt><dd>${escapeHtml(money(snapshot.totalCents, snapshot.currency))}</dd></div><div><dt>Expiry</dt><dd>${escapeHtml(dateLabel(snapshot.expiresOn))}</dd></div></dl><h3>Scope</h3><p>${escapeHtml(snapshot.scope).replaceAll('\n', '<br>')}</p>${snapshot.terms ? `<h3>Terms</h3><p>${escapeHtml(snapshot.terms).replaceAll('\n', '<br>')}</p>` : ''}</section>
      <form id="review-form" class="checkpoint"><span class="station-code">CLEARANCE</span><h2>Three-point check</h2><label class="check-row"><input type="checkbox" name="checks" value="scope" required><span><b>Scope is complete</b>The deliverables match what the client expects.</span></label><label class="check-row"><input type="checkbox" name="checks" value="price" required><span><b>Price and expiry are correct</b>The commercial details are ready to stand behind.</span></label><label class="check-row"><input type="checkbox" name="checks" value="assumptions" required><span><b>Assumptions are visible</b>Dependencies and boundaries are not hidden.</span></label><label class="reviewer">Reviewer name<input name="reviewer" autocomplete="name" required minlength="2" maxlength="500"></label><p class="fine-print">Your name records an internal approval for this version. It is not a legal signature.</p><button class="button primary wide" type="submit">${icon('check')} Mark send-ready</button></form></div>`, 'home');
  document.querySelector<HTMLFormElement>('#review-form')?.addEventListener('submit', (event) => void approveQuote(event, quote));
  bindShared();
}

async function approveQuote(event: SubmitEvent, quote: Quote): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const reviewer = form.elements.namedItem('reviewer') as HTMLInputElement;
  const reviewerName = reviewer.value.trim();
  reviewer.setCustomValidity(reviewerName.length < 2 || reviewerName.length > 500 ? 'Enter a name between 2 and 500 characters.' : '');
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const reviewedAt = new Date().toISOString();
  const reviewedQuote: Quote = { ...quote, updatedAt: reviewedAt, review: { version: quote.currentVersion, reviewer: reviewerName, reviewedAt, checks: values.getAll('checks').map(String) } };
  validateQuote(reviewedQuote, 'This quote review');
  await quoteStore.put(reviewedQuote);
  await refreshQuotes();
  quoteDetail(reviewedQuote);
  setToast('Review recorded. This exact version is send-ready.');
}

async function shareScreen(quote: Quote): Promise<void> {
  if (!quote.review || quote.review.version !== quote.currentVersion) { reviewScreen(quote); return; }
  const version = quote.versions.find((item) => item.version === quote.currentVersion)!;
  const payload: SharePayload = { schema: 1, quoteId: quote.id, version: version.version, digest: version.digest, issuedAt: new Date().toISOString(), snapshot: version.snapshot };
  const url = `${location.origin}${location.pathname}#client/${encodeShare(payload)}`;
  app.innerHTML = shell(`<header class="page-head"><div><a class="back-link" href="${appPath(`quote/${quote.id}`)}">← Quote ${escapeHtml(version.snapshot.number)}</a><span class="eyebrow">Dispatch · Version ${quote.currentVersion}</span><h1>Send the reviewed version</h1><p>This link carries the quote itself. Send it through your own email or message.</p></div></header>${workflow(quote.sentAt ? 2 : 1)}
    <section class="share-panel"><div class="share-copy"><span class="station-code">CLIENT LINK</span><h2>Ready for ${escapeHtml(version.snapshot.clientName)}</h2><p>The fingerprint in this link matches the version reviewed by ${escapeHtml(quote.review.reviewer)}. If any quote detail changes, this approval and link are retired.</p><label>Client decision link<textarea id="share-url" readonly rows="5">${escapeHtml(url)}</textarea></label><p class="link-warning"><strong>Anyone with this link can read the reviewed quote.</strong></p><div class="button-row"><button class="button primary" data-copy-link>${icon('copy')} Copy client link</button><a class="button secondary" href="${escapeHtml(url)}" target="_blank">Preview client page</a></div></div>
      <div class="ticket"><span>VERSION</span><b>${quote.currentVersion}</b><span>FINGERPRINT</span><code>${version.digest.slice(0, 16)}</code><span>EXPIRES</span><strong>${escapeHtml(dateLabel(version.snapshot.expiresOn))}</strong></div></section>
    <section class="send-confirm"><div><span class="station-code">FINAL STOP</span><h2>${quote.sentAt ? 'Marked as sent' : 'Mark it sent when it leaves'}</h2><p>${quote.sentAt ? `Sent ${escapeHtml(dateLabel(quote.sentAt))}. Waiting for a portable client receipt.` : 'Copy the link into your own email or message. Quote Decision does not contact the client or upload the quote.'}</p></div>${quote.sentAt ? `<button class="button secondary" data-import-receipt>Import client receipt</button>` : `<button class="button primary" data-mark-sent>Mark as sent ${icon('arrow')}</button>`}</section>
    <input id="receipt-file" type="file" accept="application/json,.json" hidden>`, 'home');
  document.querySelector('[data-copy-link]')?.addEventListener('click', () => void copyText(url, 'Client link copied.'));
  document.querySelector('[data-mark-sent]')?.addEventListener('click', () => void markSent(quote));
  document.querySelector('[data-import-receipt]')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#receipt-file')?.click());
  document.querySelector<HTMLInputElement>('#receipt-file')?.addEventListener('change', (event) => void importReceiptFile(event));
  bindShared();
}

async function markSent(quote: Quote): Promise<void> {
  quote.sentAt = new Date().toISOString(); quote.updatedAt = quote.sentAt;
  await quoteStore.put(quote); await refreshQuotes(); await shareScreen(quote); setToast('Marked as sent. Awaiting the client decision.');
}

async function clientPage(encoded: string, transientDecision?: Decision): Promise<void> {
  let payload: SharePayload;
  try {
    payload = decodeShare(encoded);
    if (await digestSnapshot(payload.snapshot) !== payload.digest) throw new Error('The quote details do not match their fingerprint.');
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'This quote link is incomplete.';
    app.innerHTML = `<main id="main" class="client-main"><section class="empty compact"><span class="station-code">LINK CHECK FAILED</span><h1>This quote cannot be verified</h1><p>${escapeHtml(message)} Ask the sender for a fresh link.</p></section></main>`;
    return;
  }
  const snapshot = payload.snapshot;
  const expired = new Date(`${snapshot.expiresOn}T23:59:59`).getTime() < Date.now();
  const localQuote = quotes.find((quote) => quote.id === payload.quoteId);
  const storedDecision = await clientReceiptStore.get(payload).catch(() => undefined);
  const existingDecision = storedDecision ?? transientDecision ?? (localQuote?.decision?.digest === payload.digest ? localQuote.decision : undefined);
  app.innerHTML = `<main id="main" class="client-main"><header class="client-brand"><a class="brand" href="${appPath()}" aria-label="Quote Decision home"><span class="brand-mark">QD</span><span>Quote<br>Decision</span></a><span class="verified">✓ Fingerprint verified</span></header>
    <article class="client-quote"><div class="client-title"><div><span class="eyebrow">Decision requested · Quote ${escapeHtml(snapshot.number)}</span><h1>${escapeHtml(snapshot.project)}</h1><p>Prepared for ${escapeHtml(snapshot.clientName)}</p></div><strong>${escapeHtml(money(snapshot.totalCents, snapshot.currency))}</strong></div>
      <div class="client-meta"><span><b>Version</b>${payload.version}</span><span><b>Expires</b>${escapeHtml(dateLabel(snapshot.expiresOn))}</span><span><b>Fingerprint</b><code>${payload.digest.slice(0, 12)}…</code></span></div>
      ${expired ? '<div class="notice danger-notice"><b>This quote has expired.</b> You can review it, but a new decision cannot be recorded. Ask the sender for an updated quote.</div>' : ''}
      <section><h2>Scope and deliverables</h2><p>${escapeHtml(snapshot.scope).replaceAll('\n', '<br>')}</p>${snapshot.terms ? `<h2>Terms and assumptions</h2><p>${escapeHtml(snapshot.terms).replaceAll('\n', '<br>')}</p>` : ''}</section>
    </article>
    ${existingDecision ? `<section class="client-decision">${decisionPanel(existingDecision)}<div class="button-row"><button class="button secondary" data-export-client-receipt>${icon('download')} Download receipt again</button>${storedDecision ? '<button class="link-button danger-link" data-delete-client-receipt>Delete local receipt</button>' : ''}</div></section>` : expired ? '' : `<form id="decision-form" class="client-decision"><span class="station-code">YOUR DECISION</span><h2>Record a clear answer</h2><p>This creates a portable receipt for you to return to the sender. Your entry stays on this device unless you share the downloaded file.</p><fieldset><legend>Choose one</legend><label class="decision-option accept"><input type="radio" name="decision" value="accepted" required><span><b>Accept this quote</b>I intend to proceed on this exact version.</span></label><label class="decision-option decline"><input type="radio" name="decision" value="declined"><span><b>Decline this quote</b>I do not intend to proceed on this version.</span></label></fieldset><label>Your full name<input name="clientName" autocomplete="name" required minlength="2" maxlength="500"></label><label>Note <span>(optional)</span><textarea name="note" rows="3" maxlength="500"></textarea></label><label class="consent"><input type="checkbox" name="consent" required><span>${CONSENT_TEXT}</span></label><p class="fine-print">This is an audit record of explicit consent, not a claim of a regulated electronic signature.</p><button class="button primary wide" type="submit">Record decision</button></form>`}
    <footer class="client-footer"><span>Quote details are carried in this link; they are not uploaded by Quote Decision.</span><span><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></span></footer><div id="live" class="sr-only" aria-live="polite"></div><div id="toast" class="toast" role="status" hidden></div></main>`;
  document.querySelector<HTMLFormElement>('#decision-form')?.addEventListener('submit', (event) => void recordClientDecision(event, payload));
  document.querySelector<HTMLInputElement>('#decision-form [name="clientName"]')?.addEventListener('input', (event) => (event.currentTarget as HTMLInputElement).setCustomValidity(''));
  document.querySelector('[data-export-client-receipt]')?.addEventListener('click', () => { if (existingDecision) void exportReceipt(existingDecision, snapshot.number); });
  document.querySelector('[data-delete-client-receipt]')?.addEventListener('click', () => void deleteClientReceipt(payload));
}

async function recordClientDecision(event: SubmitEvent, payload: SharePayload): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const values = new FormData(form);
  const clientName = String(values.get('clientName')).trim();
  const nameField = form.elements.namedItem('clientName') as HTMLInputElement;
  nameField.setCustomValidity(clientName.length < 2 || clientName.length > 500 ? 'Enter a name between 2 and 500 characters.' : '');
  if (!form.reportValidity()) return;
  const decision: Decision = { quoteId: payload.quoteId, version: payload.version, digest: payload.digest, decision: String(values.get('decision')) as Decision['decision'], clientName, decidedAt: new Date().toISOString(), consentText: CONSENT_TEXT, note: String(values.get('note')).trim() };
  decision.receiptDigest = await digestDecision(decision);
  let retained = true;
  try { await clientReceiptStore.put(decision); }
  catch { retained = false; }
  const local = await quoteStore.get(payload.quoteId).catch(() => undefined);
  if (local && local.versions.some((version) => version.version === payload.version && version.digest === payload.digest)) {
    if (local.currentVersion === payload.version) local.decision = decision;
    else local.decisionHistory = [...(local.decisionHistory ?? []), decision];
    local.updatedAt = decision.decidedAt;
    await quoteStore.put(local).then(() => refreshQuotes()).catch(() => undefined);
  }
  await exportReceipt(decision, payload.snapshot.number);
  await clientPage(encodeShare(payload), decision);
  setToast(retained ? 'Decision recorded. Return the downloaded receipt to the sender.' : 'Receipt downloaded, but this browser could not keep a local copy. Keep the file and allow site storage before trying again.');
}

async function deleteClientReceipt(payload: SharePayload): Promise<void> {
  if (!confirm('Delete this client receipt from this device? Download it first if you need a copy.')) return;
  try {
    await clientReceiptStore.remove(payload);
    await clientPage(encodeShare(payload));
    setToast('Client receipt deleted from this device.');
  } catch {
    setToast('The client receipt could not be deleted. Check browser storage permissions and try again.');
  }
}

async function exportReceipt(decision: Decision, quoteNumber: string): Promise<void> {
  const receiptDigest = decision.receiptDigest ?? await digestDecision(decision);
  downloadText(`decision-${quoteNumber.replace(/[^a-z0-9-]/gi, '_')}-v${decision.version}.json`, JSON.stringify({ schema: 2, product: 'quote-decision-log', ...decision, receiptDigest }, null, 2));
}

async function importReceiptFile(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const decision = await validateDecision(JSON.parse(await file.text()));
    const quote = await quoteStore.get(decision.quoteId);
    const version = quote?.versions.find((item) => item.version === decision.version);
    if (!quote || !version) throw new Error('This receipt belongs to a quote that is not in this log.');
    if (version.digest !== decision.digest) throw new Error('The receipt fingerprint does not match the saved quote version.');
    const prior = quote.currentVersion === decision.version ? quote.decision : quote.decisionHistory?.find((item) => item.version === decision.version);
    if (prior && await digestDecision(prior) !== await digestDecision(decision)) {
      throw new Error('This version already has a different client decision. The saved audit record was not replaced.');
    }
    if (quote.currentVersion === decision.version) quote.decision = decision;
    else if (!prior) quote.decisionHistory = [...(quote.decisionHistory ?? []), decision];
    quote.updatedAt = new Date().toISOString();
    await quoteStore.put(quote); await refreshQuotes(); navigate(`quote/${quote.id}`); setToast(`Client decision imported: ${decision.decision}.`);
  } catch (caught) { setToast(caught instanceof Error ? caught.message : 'The receipt could not be imported.'); }
  input.value = '';
}

async function deleteQuote(quote: Quote): Promise<void> {
  const snapshot = currentSnapshot(quote);
  if (!confirm(`Delete quote ${snapshot.number} for ${snapshot.clientName}? This cannot be undone unless you exported a backup.`)) return;
  await quoteStore.remove(quote.id); await refreshQuotes(); navigate('home'); setToast('Quote deleted from this device.');
}

function dataPage(): void {
  const unlocked = hasUnlimitedQuotes();
  const accessPanel = demoMode
    ? `<section class="settings-panel license-panel"><span class="station-code">DEMO STORAGE</span><h2>Sample data only</h2><p>These two sample quotes use the separate demo database. Reset the demo to restore them, or start for real to use your own empty quote log.</p><div class="button-row"><button class="button secondary" type="button" data-reset-demo>Reset demo</button><a class="button primary" href="/">Start for real</a></div></section>`
    : `<section class="settings-panel license-panel"><span class="station-code">ONE-TIME LICENSE</span><h2>${unlocked ? 'Unlimited is active' : 'Keep every quote moving'}</h2><p>${unlocked ? 'This device has a valid cached license. Thank you for supporting this focused tool.' : `The free edition handles ${FREE_LIMIT} active quotes. The app displays a $19 one-time option for unlimited quotes and future v1 updates.`}</p>${unlocked ? `<button class="button secondary" data-verify-license>Verify license now</button><button class="link-button danger-link" data-remove-license>Remove from this device</button>` : `<a class="button primary" href="${checkoutUrl}">Open $19 checkout</a><form id="license-form"><label>Have a license? Paste it here<input name="license" autocomplete="off" required></label><button class="button secondary" type="submit">Restore purchase</button></form>`}<p class="fine-print">Checkout is hosted by Sociobot. Dodo is the merchant of record. Refunds are handled there and revoke the license. <a href="/terms/">Terms</a> apply.</p><div id="license-status" role="status"></div></section>`;
  app.innerHTML = shell(`<header class="page-head"><div><span class="eyebrow">Ownership & access</span><h1>Data and license</h1><p>Back up the whole log, move decisions between devices, or remove everything.</p></div></header>
    <div class="settings-grid"><section class="settings-panel"><span class="station-code">YOUR DATA</span><h2>Portable by design</h2><p>${demoMode ? 'Sample quotes live in the demo browser database. Export a JSON backup or CSV overview to inspect the same controls.' : 'Quotes live in this browser’s IndexedDB. Export a JSON backup for restoration or a CSV overview for your records.'}</p>${storageError ? `<div class="notice" role="alert"><b>Local data needs recovery.</b><p>${escapeHtml(storageError)} Import a valid backup to replace it, or delete the invalid local data below.</p></div>` : ''}<div class="button-row"><button class="button primary" data-export-json ${storageError ? 'disabled' : ''}>${icon('download')} Export JSON</button><button class="button secondary" data-export-csv ${storageError ? 'disabled' : ''}>Export CSV</button><button class="button secondary" data-import-backup>Import backup</button></div><input id="backup-file" type="file" accept="application/json,.json" hidden><hr><h3>Delete local data</h3><p>${storageError ? 'Removes the unreadable local quote data from this device.' : `Removes all ${quotes.length} quote${quotes.length === 1 ? '' : 's'} from this device. Export first if you might need them.`}</p><button class="button danger" data-delete-all>${storageError ? 'Delete invalid local data' : 'Delete all quotes'}</button></section>${accessPanel}</div>`, 'data');
  document.querySelector('[data-export-json]')?.addEventListener('click', exportJson);
  document.querySelector('[data-export-csv]')?.addEventListener('click', exportCsv);
  document.querySelector('[data-import-backup]')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#backup-file')?.click());
  document.querySelector<HTMLInputElement>('#backup-file')?.addEventListener('change', (event) => void importBackup(event));
  document.querySelector('[data-delete-all]')?.addEventListener('click', () => void deleteAll());
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', (event) => void restoreLicense(event));
  document.querySelector('[data-verify-license]')?.addEventListener('click', () => void checkLicense(true));
  document.querySelector('[data-remove-license]')?.addEventListener('click', () => { clearLicense(); dataPage(); setToast('License removed from this device.'); });
  bindShared();
}

function exportJson(): void {
  const bundle: ExportBundle = { schema: 1, product: 'quote-decision-log', exportedAt: new Date().toISOString(), quotes };
  downloadText(`quote-decision-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(bundle, null, 2));
  setToast('JSON backup exported.');
}

function exportCsv(): void {
  const head = ['Quote', 'Client', 'Project', 'Amount', 'Currency', 'Expires', 'Version', 'Status', 'Reviewer', 'Decision by', 'Decision time'];
  const rows = quotes.map((quote) => { const snap = currentSnapshot(quote); return [snap.number, snap.clientName, snap.project, (snap.totalCents / 100).toFixed(2), snap.currency, snap.expiresOn, quote.currentVersion, quoteStatus(quote), quote.review?.reviewer ?? '', quote.decision?.clientName ?? '', quote.decision?.decidedAt ?? ''].map(csvEscape).join(','); });
  downloadText(`quote-decision-log-${new Date().toISOString().slice(0, 10)}.csv`, [head.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8');
  setToast('CSV overview exported.');
}

async function importBackup(event: Event): Promise<void> {
  const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (!file) return;
  try { const bundle = await validateBundle(JSON.parse(await file.text())); if (storageError) await quoteStore.clear(); for (const quote of bundle.quotes) await quoteStore.put(quote); storageError = ''; await refreshQuotes(); dataPage(); setToast(`${bundle.quotes.length} quote${bundle.quotes.length === 1 ? '' : 's'} imported.`); }
  catch (caught) { setToast(caught instanceof Error ? caught.message : 'The backup could not be imported.'); }
}

async function deleteAll(): Promise<void> {
  if (!quotes.length && !storageError) { setToast('There are no quotes to delete.'); return; }
  const prompt = storageError ? 'Delete all invalid local quote data from this device? This cannot be undone.' : `Delete all ${quotes.length} quotes from this device? This cannot be undone unless you exported a backup.`;
  if (!confirm(prompt)) return;
  await quoteStore.clear(); storageError = ''; await refreshQuotes(); dataPage(); setToast('All local quotes deleted.');
}

async function restoreLicense(event: SubmitEvent): Promise<void> {
  event.preventDefault(); const form = event.currentTarget as HTMLFormElement; if (!form.reportValidity()) return;
  saveLicense(String(new FormData(form).get('license'))); await checkLicense(true);
}

async function checkLicense(force = false): Promise<void> {
  const status = document.querySelector<HTMLDivElement>('#license-status'); if (status) status.textContent = 'Verifying license…';
  try {
    const result = await verifyLicense(force);
    if (result.valid) { dataPage(); setToast('License verified. Unlimited quotes are active.'); }
    else {
      dataPage();
      document.querySelector<HTMLDivElement>('#license-status')!.textContent = 'License no longer active. You can purchase a new unlock below.';
    }
  }
  catch { if (status) status.textContent = 'Could not verify while offline. Your last valid unlock remains available.'; }
}

function paywall(): void {
  if (demoMode) {
    app.innerHTML = shell(`<section class="empty compact"><span class="station-code">DEMO LIMIT · ${FREE_LIMIT}/${FREE_LIMIT}</span><h1>The sample log is full</h1><p>Reset the demo to restore the two sample quotes, or start for real to create your own quote log.</p><div class="button-row centered"><button class="button primary" type="button" data-reset-demo>Reset demo</button><a class="button secondary" href="/">Start for real</a></div></section>`, 'new');
    bindShared();
    return;
  }
  app.innerHTML = shell(`<section class="empty compact"><span class="station-code">FREE EDITION · ${FREE_LIMIT}/${FREE_LIMIT}</span><h1>Your free log is full</h1><p>You can still review, send, decide, export, and delete existing quotes. The app displays a $19 one-time option for unlimited quotes.</p><div class="button-row centered"><a class="button primary" href="${checkoutUrl}">Open $19 checkout</a><a class="button secondary" href="${appPath('data')}">Restore a license</a></div><a class="back-link" href="${appPath()}">← Return to quote log</a></section>`, 'new');
  bindShared();
}

async function copyText(value: string, message: string): Promise<void> {
  try { await navigator.clipboard.writeText(value); setToast(message); }
  catch { const field = document.querySelector<HTMLTextAreaElement>('#share-url'); field?.select(); setToast('Select the link and copy it manually.'); }
}

function bindShared(): void {
  updateNetworkState();
  document.querySelectorAll<HTMLButtonElement>('[data-reset-demo]').forEach((button) => {
    button.addEventListener('click', () => void resetDemo());
  });
}

function updateNetworkState(): void {
  const element = document.querySelector<HTMLElement>('#network-state');
  if (element) element.innerHTML = `<i></i>${navigator.onLine ? 'Online' : 'Offline'}`;
  const banner = document.querySelector<HTMLElement>('#offline-banner');
  if (banner) banner.hidden = navigator.onLine;
}

async function refreshQuotes(): Promise<void> {
  quotes = (await quoteStore.all()).map((quote, index) => validateQuote(quote, `Stored quote ${index + 1}`));
}

async function seedDemoData(): Promise<void> {
  if (!demoMode || quotes.length) return;
  const now = new Date().toISOString();
  const future = new Date();
  future.setDate(future.getDate() + 30);
  const later = new Date();
  later.setDate(later.getDate() + 45);
  const acceptedSnapshot: QuoteSnapshot = {
    number: 'QD-2047', clientName: 'Cedar & Kite', clientEmail: 'hello@cedarandkite.example', project: 'Product photography', currency: 'USD', totalCents: 210000,
    expiresOn: future.toISOString().slice(0, 10), scope: 'Plan a half-day studio shoot, deliver 24 edited product images, and provide web-ready exports.', terms: 'Two revision notes are included. Extra retouching is quoted separately.',
  };
  const readySnapshot: QuoteSnapshot = {
    number: 'QD-2048', clientName: 'Harrow & Vale', clientEmail: 'studio@harrowvale.example', project: 'Website launch', currency: 'USD', totalCents: 480000,
    expiresOn: later.toISOString().slice(0, 10), scope: 'Design and build a five-page launch site with a contact form, analytics-free hosting handoff, and editor training.', terms: 'Client supplies final copy and photography before build starts.',
  };
  const acceptedDigest = await digestSnapshot(acceptedSnapshot);
  const readyDigest = await digestSnapshot(readySnapshot);
  const decision: Decision = {
    quoteId: 'demo-cedar-kite', version: 1, digest: acceptedDigest, decision: 'accepted', clientName: 'Avery Cole', decidedAt: now,
    consentText: CONSENT_TEXT, note: 'Please schedule the shoot for the second week of next month.',
  };
  decision.receiptDigest = await digestDecision(decision);
  const checked = ['assumptions', 'price', 'scope'];
  const accepted: Quote = {
    id: 'demo-cedar-kite', createdAt: now, updatedAt: now, currentVersion: 1,
    versions: [{ version: 1, createdAt: now, digest: acceptedDigest, snapshot: acceptedSnapshot }],
    review: { version: 1, reviewer: 'Mira Chen', reviewedAt: now, checks: checked }, sentAt: now, decision,
  };
  const ready: Quote = {
    id: 'demo-harrow-vale', createdAt: now, updatedAt: now, currentVersion: 1,
    versions: [{ version: 1, createdAt: now, digest: readyDigest, snapshot: readySnapshot }],
    review: { version: 1, reviewer: 'Mira Chen', reviewedAt: now, checks: checked },
  };
  await quoteStore.put(accepted);
  await quoteStore.put(ready);
  await refreshQuotes();
}

async function resetDemo(): Promise<void> {
  if (!demoMode) return;
  await quoteStore.clear();
  await clientReceiptStore.clear();
  quotes = [];
  await seedDemoData();
  navigate('home');
  setToast('Demo reset with two sample quotes.');
}

function route(moveFocus = false): void {
  const hash = location.hash.slice(1) || 'home';
  // The global skip link points at the current main landmark. It is an anchor,
  // not an application route; rerendering here steals focus from keyboard users.
  if (hash === 'main' && document.querySelector('#main')) return;
  if (hash.startsWith('client/')) {
    setDocumentDetails('Client decision — Quote Decision', 'Review a shared quote and record a clear answer.');
    void clientPage(hash.slice(7));
    return;
  }
  // Keep links made by the first release usable, but move visitors to the
  // real URL immediately so titles, canonical URLs, and browser history agree.
  if (location.hash && (hash === 'home' || hash === 'new' || hash === 'data' || hash.startsWith('quote/') || hash.startsWith('edit/'))) {
    history.replaceState(null, '', appPath(hash as AppRoute));
  }
  const appRoute = currentRoute();
  if (appRoute === 'home') {
    setDocumentDetails(demoMode ? 'Demo — Quote Decision' : 'Quote Decision — review quotes before sending', demoMode ? 'Try Quote Decision with isolated sample quotes.' : 'Review quotes before they leave and preserve the client decision.');
    dashboard();
  } else if (appRoute === 'new') {
    setDocumentDetails('New quote — Quote Decision', 'Create a quote for review before it is sent.');
    quoteForm();
  } else if (appRoute === 'data') {
    setDocumentDetails('Data and license — Quote Decision', 'Export, import, or remove your local quote log.');
    dataPage();
  } else if (appRoute.startsWith('quote/')) {
    const quote = quotes.find((item) => item.id === appRoute.slice(6));
    if (quote) {
      setDocumentDetails(`${currentSnapshot(quote).number} — Quote Decision`, 'Review a saved quote and its decision record.');
      quoteDetail(quote);
    } else {
      setDocumentDetails('Quote log — Quote Decision', 'Review quotes before they leave and preserve the client decision.');
      dashboard();
    }
  } else if (appRoute.startsWith('edit/')) {
    const quote = quotes.find((item) => item.id === appRoute.slice(5));
    if (quote) {
      setDocumentDetails(`Edit ${currentSnapshot(quote).number} — Quote Decision`, 'Update a saved quote before review.');
      quoteForm(quote);
    } else dashboard();
  }
  if (moveFocus) requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('#main h1');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  });
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  let registration: ServiceWorkerRegistration | undefined;
  try {
    registration = await navigator.serviceWorker.register('/sw.js');
  } catch {
    // Some privacy tools deliberately block workers. The local app remains
    // usable without offline caching, so registration must fail silently.
    return;
  }
  if (!registration) return;
  let acceptingUpdate = false;
  if (registration.waiting) showUpdate(registration, () => { acceptingUpdate = true; });
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(registration, () => { acceptingUpdate = true; }); });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (acceptingUpdate) location.reload(); });
}

function showUpdate(registration: ServiceWorkerRegistration, beforeAccept: () => void): void {
  setToast('A fresh version is ready.', 'Update now');
  document.querySelector('[data-toast-action]')?.addEventListener('click', () => { beforeAccept(); registration.waiting?.postMessage({ type: 'SKIP_WAITING' }); });
}

async function boot(): Promise<void> {
  const returned = !demoMode && captureReturnedLicense();
  try { await refreshQuotes(); storageError = ''; }
  catch (caught) { storageError = caught instanceof Error ? caught.message : 'Unknown storage error.'; }
  if (!storageError) await seedDemoData();
  route();
  if (returned) { setToast('License saved. Verifying your unlimited unlock…'); void checkLicense(true); }
  else if (!demoMode && licenseToken() && navigator.onLine) void verifyLicense().then((result) => {
    if (!result.valid) {
      if (currentRoute() === 'data') dataPage();
      setToast('License no longer active. Free limits apply.');
    }
  }).catch(() => undefined);
  void registerServiceWorker();
}

window.addEventListener('hashchange', () => route());
window.addEventListener('popstate', () => route(true));
window.addEventListener('online', updateNetworkState);
window.addEventListener('offline', updateNetworkState);
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
  if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
  const target = new URL(anchor.href, location.href);
  if (target.origin !== location.origin || target.hash || target.search) return;
  const destination = routeForCurrentMode(target.pathname);
  if (!destination) return;
  event.preventDefault();
  navigate(destination);
});
void boot();

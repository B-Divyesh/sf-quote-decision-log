# Polish round 6 — review 6 closure

Polished reviewed candidate `051ee2d171ce1420eecda47da4d5e521d8305cb0`
and adversarial report `e82b054a2d18e5d2581e6a9a42e93affd8d4e0a4` through
repair commit `e014a7ec99526128e290aaa709600643b522fe46` on 2026-09-02 UTC.
The clean repair build is deployed at
<https://quote-decision-log.sociobot.in>.

## Evidence anchors

- **Clean clone:** `/tmp/quote-decision-polish6-clean.7Ut6pA/app` at the
  repair commit. All 19 exact claim commands passed independently; the full
  suite passed 12 unit/contract tests, 49 browser tests with 31 intended skips,
  and one mobile-performance test.
- **Live suite:** production-safe Playwright passed 47 tests with 30 intended
  skips. The update test that rewrites a local `dist/sw.js` was intentionally
  run against the clean build instead. Its v13 labels were independently
  confirmed at <https://quote-decision-log.sociobot.in/sw.js>.
- **Cold screenshots:** [home desktop](qa-evidence/polish-6-live/home/screenshot-desktop.png),
  [home mobile](qa-evidence/polish-6-live/home/screenshot-mobile.png), and
  [demo mobile](qa-evidence/polish-6-live/demo/screenshot-mobile.png).
- **Cold URL checks:** `verify-url.sh` reports are
  [home](qa-evidence/polish-6-live/home/verify.json) and
  [demo](qa-evidence/polish-6-live/demo/verify.json). Production routes `/`,
  `/demo`, `/new`, `/data`, `/demo/new`, `/demo/data`, `/privacy/`, `/terms/`,
  `/offline.html`, `/404.html`, `robots.txt`, `sitemap.xml`, and the manifest
  return 200; an unknown URL returns the designed 404.

## Finding map

| Finding | Change retained or made | Fresh evidence |
| --- | --- | --- |
| QD-001 | The unlimited action keeps the product-specific Sociobot checkout URL, with no embedded provider. | `@claim:unlimited-price` clean pass; live `/data` in the production-safe suite. |
| QD-002 | Receipt validation requires the exact consent text. | `@claim:decision-consent-record` and `@claim:receipt-import` clean passes; live `/demo`. |
| QD-003 | Backup validation completes before replacing saved quotes. | `rejects a structurally invalid backup without damaging the log` clean and live pass. |
| QD-004 | A valid receipt import redraws the named decision immediately. | `@claim:receipt-import` clean and live `/demo` pass. |
| QD-005 | Required values are trimmed and spaces-only input is rejected with guidance. | `rejects whitespace-only required quote fields with field guidance` clean and live pass. |
| QD-006 | Legal links remain at least 44 px on mobile. | `keeps data and legal links at the 44px mobile target baseline` clean and live pass. |
| QD-007 | Hashed assets retain immutable caching. | `static deployment policy` clean pass; all 20 production files match the clean build. |
| QD-008 | Static configuration retains CSP, Permissions-Policy, referrer, MIME, and nosniff policy. | `static deployment policy` clean pass; live `/` URL verification passed. |
| QD-009 | Field lengths and safe-money bounds prevent invalid persistence. | `never persists a quote or review that violates the stored schema` clean and live pass. |
| QD-010 | Imported consent stays tied to its exact version and fingerprint. | `@claim:receipt-import` and `@claim:quote-fingerprint` clean and live pass. |
| QD-011 | The runner retains its single recovery retry for constrained Chromium. | Clean full suite: 49 passed/31 skips; live isolated offline fallback rerun: 1 passed. |
| QD-012 | All 19 claims map to one tagged browser test. | `claim contract > maps every listed claim to exactly one tagged browser test`; all manifest commands passed separately. |
| QD-013 | `/demo` and `?demo=1` keep only isolated seeds, banner, reset, and destructive exit. | `@claim:demo-sample-data` clean and live `/demo` pass; [demo screenshot](qa-evidence/polish-6-live/demo/screenshot-mobile.png). |
| QD-014 | The skip link is first and route changes focus the h1. | `supports the core review checkpoint with keyboard controls` and history-focus test clean and live pass. |
| QD-015 | Mobile controls and legal links preserve 44 px targets. | Mobile target regression clean and live pass; [mobile home](qa-evidence/polish-6-live/home/screenshot-mobile.png). |
| QD-016 | Invalid license verification immediately returns the UI to the free state. | `rerenders paid state immediately after an invalid license verification` clean and live pass with stubbed response. |
| QD-017 | Real paths, titles, metadata, shared chrome, canonical URLs, and the designed 404 remain intact. | Route/metadata test clean and live pass; live unknown URL is HTTP 404. |
| QD-018 | Blocked service-worker registration fails softly. | `does not throw when service worker registration is blocked` clean and live pass. |
| QD-019 | Client receipts retain and delete in isolated client storage. | `@claim:client-decision-retention` and `@claim:delete-client-receipt` clean and live pass. |
| QD-020 | Client-link copy states that anybody with the bearer link can read the quote. | `@claim:client-link` clean and live `/demo` pass. |
| QD-021 | The focused mobile skip link remains 44 px high. | Mobile target regression clean and live pass. |
| F-1-1 | App, legal, offline, and 404 views share the same header and legal footer. | Route/metadata test clean and live `/privacy/`, `/terms/`, and `/404.html` pass. |
| F-1-2 | Consent and typed client name are registered as a claim. | `@claim:decision-consent-record` clean and live pass. |
| F-1-3 | Valid JSON backup import is registered and tested. | `@claim:backup-import` clean and live pass. |
| F-1-4 | Normal quote deletion remains isolated from demo records. | `@claim:delete-local-quotes` clean and live pass. |
| F-1-5 | A client can delete the saved local receipt. | `@claim:delete-client-receipt` clean and live pass. |
| F-1-6 | Price wording is limited to a displayed $19 one-time option and product handoff. | `@claim:unlimited-price` clean and live `/data` pass without opening billing. |
| F-1-7 | Privacy, Terms, and 404 retain complete route-specific social metadata. | Route/metadata test clean and live `/privacy/`, `/terms/`, and `/404.html` pass. |
| F-1-8 | The bearer link is not described as private and carries an access warning. | `@claim:client-link` clean and live pass. |
| F-1-9 | README opening explains local browser storage and offline use in plain language. | `.factory/copy-audit.md`; cold live home screenshot. |
| F-1-10 | README calls it a link to send to the client, not a browser fragment. | `.factory/copy-audit.md`; `@claim:client-link` pass. |
| F-1-11 | Feature copy uses “unchangeable ID,” retaining SHA-256 only as technical proof. | `.factory/copy-audit.md`; `@claim:quote-fingerprint` pass. |
| F-1-12 | Browser-suite documentation remains split into short sentences. | `.factory/copy-audit.md` has no flagged sentence. |
| F-1-13 | Deployment documentation remains plain and split into short sentences. | `.factory/copy-audit.md` has no flagged sentence. |
| F-2-1 | Receipt import has its own valid/invalid sandbox claim. | `@claim:receipt-import` clean and live `/demo` pass. |
| F-2-2 | User feature wording says data stays in this browser on this device. | `README.md`, `.factory/copy-audit.md`, and cold live home check. |
| F-3-1 | Start for real clears both demo databases before leaving demo. | `@claim:demo-sample-data` clean and live pass. |
| F-3-2 | Scope, value, and expiry are a registered persisted claim. | `@claim:quote-fields` clean and live `/demo/new` pass. |
| F-3-3 | Landing retains the named Privacy and limits section with non-goals. | Landing-copy/axe test clean and live pass; [home mobile](qa-evidence/polish-6-live/home/screenshot-mobile.png). |
| F-3-4 | Landing states five free quotes and $19 once for unlimited. | `@claim:free-five-quotes` and `@claim:unlimited-price` clean and live pass. |
| F-3-5 | README says each site address keeps its own browser data. | `.factory/copy-audit.md`; clean copy audit review. |
| F-4-1 | Sitemap inventories all stable app routes and the deployment test enforces it. | `static deployment policy > lists every stable public route in the sitemap and rewrites each stable app route exactly`; live route crawl. |
| F-5-1 | Desktop hero keeps all three facts above the 1440 × 768 fold. | `keeps every first-screen fact above the desktop fold` clean and live pass; [home desktop](qa-evidence/polish-6-live/home/screenshot-desktop.png). |
| F-6-1 | The update regression now reads the built worker labels, requires shipped v13 values, rewrites generated v13 replacements, and proves toast, activation, and old-cache retirement. | `offers and activates a waiting service-worker update` clean pass; live `/sw.js` confirms `qd-shell-v13` and `qd-assets-v13`. |

## Final quality and live evidence

- Clean `npm test`: 12 passed; typecheck and lint passed.
- Clean production build emitted `dist/`: JavaScript 17.04 kB gzip, CSS 6.29
  kB gzip; largest hero asset 48.00 kB.
- Clean full browser suite: 49 passed, 31 intended skips. Clean mobile
  performance: 1 passed.
- All 19 declared claim commands passed separately from the clean clone.
- Cold `verify-url.sh` checks passed on live home and demo with zero console
  errors, one h1, a main landmark, `lang=en`, complete image alternatives, and
  labelled buttons.
- Live axe checks are part of the production-safe Playwright suite and found no
  serious or critical issues. Live Lighthouse mobile `/demo` scored 100
  performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.1 s,
  CLS 0, TBT 20 ms. Report:
  [lighthouse](qa-evidence/polish-6-live/lighthouse-demo.json).
- Static Web Apps CLI deployed only `sociobot/sf-quote-decision-log`. All 20
  public production files equal the clean build by SHA-256.

No finding from reviews 1–6 remains unresolved.

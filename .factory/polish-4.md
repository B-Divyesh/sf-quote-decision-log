# Polish round 4 — zero-finding closure

Polished candidate `ce4230d5e005eb3e315a807cdae5bc019c5847d5`
through repair commit `b042fb2e3d28376e74624f9e56e6687f15852874` on
2026-09-02 UTC. Version 1.0.7 is deployed at
<https://quote-decision-log.sociobot.in>.

## Review 4 finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-4-1 | Added `/new`, `/data`, `/demo/new`, and `/demo/data` to `sitemap.xml`. Added exact `/index.html` rewrite entries for both demo subroutes. The deployment contract now compares the complete ordered sitemap inventory and requires one exact rewrite for every stable app route. | `static deployment policy > lists every stable public route in the sitemap and rewrites each stable app route exactly` passed in the clean clone. The deployed sitemap matched source byte-for-byte. Live `/`, `/demo`, `/new`, `/data`, `/demo/new`, `/demo/data`, `/privacy/`, and `/terms/` each returned 200. |

## Earlier finding map

Every earlier repair was checked again in the clean and deployed builds.

| Finding | Preserved change | Current evidence |
| --- | --- | --- |
| QD-001 | Checkout remains the Quote Decision Sociobot URL; no payment provider is embedded. | `@claim:unlimited-price` passed locally and live. |
| QD-002 | Receipt validation requires the exact consent text. | `@claim:decision-consent-record` and `@claim:receipt-import` passed locally and live. |
| QD-003 | A malformed backup is validated before stored quotes are replaced. | Clean and live full browser recovery tests passed. |
| QD-004 | A valid imported receipt rerenders the recorded client decision immediately. | `@claim:receipt-import` passed locally and live. |
| QD-005 | Required text fields trim input and reject spaces-only values with field guidance. | Clean and live form-validation tests passed. |
| QD-006 | Legal links retain 44 px touch targets. | Clean and live mobile target tests passed. |
| QD-007 | Hashed assets use one-year immutable caching. | Live `index-MbXs1IQ-.js` returned `public, max-age=31536000, immutable`. |
| QD-008 | CSP, permissions, referrer, MIME, and nosniff policies remain configured. | Deployment contract passed; live response headers were checked. |
| QD-009 | Text lengths and safe-money limits are enforced before persistence. | Nine data/schema tests and the full browser boundary tests passed. |
| QD-010 | Imported consent stays tied to the matching version and fingerprint. | `@claim:receipt-import` and `@claim:quote-fingerprint` passed locally and live. |
| QD-011 | The runner retains one retry for an intermittent browser-process crash. | Both complete round-4 browser runs passed without using the retry. |
| QD-012 | All 19 claim entries map to exactly one matching browser tag. | `claim contract > maps every listed claim to exactly one tagged browser test` passed. Every manifest command also passed separately. |
| QD-013 | `/demo` and `?demo=1` retain seeds, banner, reset, isolated storage, and destructive exit. | `@claim:demo-sample-data` passed locally and live; [live mobile demo](evidence/polish-4/live-demo/screenshot-mobile.png). |
| QD-014 | The skip link remains first and route changes focus the new h1. | Clean and live keyboard/history tests passed. |
| QD-015 | Mobile controls and legal links retain 44 px targets. | Clean and live mobile target tests passed; [live mobile home](evidence/polish-4/live-home/screenshot-mobile.png). |
| QD-016 | Invalid license verification rerenders the free state. | Clean and live license tests passed with the API response stubbed. |
| QD-017 | Real routes, unique titles, shared navigation, metadata, canonical URLs, and the designed 404 remain intact. | Clean and live route/metadata tests passed. The unknown live route returned 404. F-4-1's sitemap extension is now covered too. |
| QD-018 | Blocked service-worker registration fails softly. | Clean resilience test passed; both cold live verifier runs reported no console errors. |
| QD-019 | Client receipt retention and deletion remain isolated and persistent. | `@claim:client-decision-retention` and `@claim:delete-client-receipt` passed locally and live. |
| QD-020 | Share copy explains that anyone with the client link can read the quote. | `@claim:client-link` passed locally and live. |
| QD-021 | The focused mobile skip link remains at least 44 px high. | Clean and live mobile target tests passed. |
| F-1-1 | App, legal, fallback, and 404 pages keep the same four header links and legal footer links. | Clean and live shared-header tests passed. |
| F-1-2 | Explicit consent and the typed client name remain registered and tested. | `@claim:decision-consent-record` passed locally and live. |
| F-1-3 | Valid JSON backup import remains registered and functional. | `@claim:backup-import` passed locally and live. |
| F-1-4 | Deleting normal quotes remains isolated from demo data. | `@claim:delete-local-quotes` passed locally and live. |
| F-1-5 | A client can delete its saved local receipt. | `@claim:delete-client-receipt` passed locally and live. |
| F-1-6 | Price wording remains limited to a displayed $19 one-time option and the product-specific checkout handoff. | `@claim:unlimited-price` passed locally and live without following checkout. |
| F-1-7 | Privacy, Terms, and 404 retain complete route-specific social metadata. | Clean and live route/metadata tests passed. |
| F-1-8 | No bearer link is called private; the access warning stays visible. | `@claim:client-link` passed locally and live. |
| F-1-9 | The README opening explains browser storage and offline use plainly. | `.factory/copy-audit.md` contains no flagged sentence. |
| F-1-10 | Feature copy says the quote is in a link that can be sent to the client. | `.factory/copy-audit.md`; `@claim:client-link` passed. |
| F-1-11 | User-facing copy says “unchangeable ID”; SHA-256 remains only in technical proof. | `.factory/copy-audit.md`; `@claim:quote-fingerprint` passed. |
| F-1-12 | The browser-suite description remains split into short sentences. | `.factory/copy-audit.md` contains no sentence over 22 words. |
| F-1-13 | Deployment documentation remains split into short sentences. | `.factory/copy-audit.md` contains no sentence over 22 words. |
| F-2-1 | Receipt import remains a registered valid/invalid clean-demo outcome. | `@claim:receipt-import` passed locally and live. |
| F-2-2 | The user feature list says data stays in this browser on this device. | `README.md` and `.factory/copy-audit.md`. |
| F-3-1 | **Start for real** clears both demo databases before leaving. | `@claim:demo-sample-data` passed locally and live. |
| F-3-2 | Scope, value, and expiry remain registered persisted fields. | `@claim:quote-fields` passed locally and live. |
| F-3-3 | The landing page retains its plainly named **Privacy and limits** section. | Landing-copy test and live axe scan passed; [live mobile home](evidence/polish-4/live-home/screenshot-mobile.png). |
| F-3-4 | The landing page states five free quotes and $19 once for unlimited. | `@claim:free-five-quotes` and `@claim:unlimited-price` passed locally and live. |
| F-3-5 | The README says each site address keeps its own browser data. | `README.md` and `.factory/copy-audit.md`. |

## Round 4 evidence

- Clean clone: `/tmp/quote-decision-polish4-clean.gy28D6/app` at `b042fb2`.
- All 19 exact commands in `.factory/claims.json` passed separately.
- Clean `npm test`: 12 passed. Typecheck, lint, and production build passed.
- Clean full browser suite: 48 passed and 30 intentional cross-project skips.
- Clean mobile performance budget: 1 passed.
- Production-safe browser suite: 47 passed and 29 intentional skips. Only the
  test that deliberately rewrites local `dist/sw.js` was excluded on live.
- Local and live URL verifier checks on `/` and `/demo` found zero console
  errors, one h1, `lang=en`, a main landmark, complete image alternatives, and
  labelled buttons.
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  and 100 SEO; LCP 1.21 s, CLS 0, TBT 36 ms.
- Live Lighthouse: 100 in all four categories; LCP 0.98 s, CLS 0, TBT 0 ms.
  Reports: [local](evidence/polish-4/local-lighthouse.json) and
  [live](evidence/polish-4/live-lighthouse.json).
- The production build contains 17.04 kB gzip JavaScript and 6.29 kB gzip CSS.
- All 20 public deployment files matched local `dist/` byte-for-byte by
  SHA-256. Production runs service-worker cache `qd-shell-v9`.
- Production deployment ID:
  `042e929a-90d0-4290-97a5-3d1d1da1dbac`, resource
  `sf-quote-decision-log` in resource group `sociobot`.

No finding from reviews 1–4 remains open.

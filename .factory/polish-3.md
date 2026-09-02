# Polish round 3 — zero-finding closure

Polished candidate `382f44f33d5c775491ba6786dc9e190977cedfaa`
through product commit `0384c20d42382593b791f0a5f317c2a5a694155d` on
2026-09-02 UTC. The production build is deployed at
<https://quote-decision-log.sociobot.in>.

## Review 3 finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Every **Start for real** link now clears `demo:quote-decision-log` and `demo:quote-decision-client-receipts` before opening the normal log. Failure leaves the visitor in demo and explains how to retry. | `@claim:demo-sample-data` creates a real quote, a demo edit, and a demo receipt. It proves both demo stores are empty after exit, the real quote remains, and demo re-entry has only two seeds. Passed from the clean clone and live `/demo`; [live demo at 390 px](evidence/polish-3/live/demo-390.png). |
| F-3-2 | Registered `quote-fields` in `.factory/claims.json`. Its only tagged test saves exact scope, value, and expiry, reloads the real route, and checks both rendered and IndexedDB values. | `npm run test:e2e -- --grep @claim:quote-fields` passed from the clean clone and live `/demo/new`; [live quote detail](evidence/polish-3/live/quote-fields-390.png). |
| F-3-3 | Added a plainly named **Privacy and limits** landing section. It states device storage, bearer-link visibility, and the payment/editor/signature non-goals, with Privacy and Terms links. | `explains privacy, limits, and the complete price tier on the landing page` and live axe checks passed; [live landing page](evidence/polish-3/live/home-390.png); live `/`, `/privacy/`, and `/terms/` returned 200. |
| F-3-4 | Added the complete tier on the first-screen fact and a dedicated **Price** section: “Use five quotes free. Pay $19 once to remove the quote limit.” The action targets this product's Sociobot checkout. Removed the untested future-update promise. | `@claim:free-five-quotes`, `@claim:unlimited-price`, and the landing copy test passed locally and live without following billing; [live price section](evidence/polish-3/live/home-390.png). |
| F-3-5 | Replaced “Data is specific to the browser origin” with “Each site address keeps its own browser data.” | `README.md` and `.factory/copy-audit.md`; the sentence is eight words and contains no unexplained platform term. |

## Earlier finding recheck

| Finding | Preserved change | Current evidence |
| --- | --- | --- |
| F-1-1 | App, legal, and 404 pages retain the same Quote log, Data & license, Try demo, and Privacy header links; Terms remains in each footer. | `uses real app URLs, route titles, shared headers, social metadata, and the designed 404 page`; live `/`, `/privacy/`, `/terms/`, and `/404.html`. |
| F-1-2 | Explicit consent text and the typed client name remain in the receipt. | `@claim:decision-consent-record` passed from the clean clone. |
| F-1-3 | Valid JSON backup import remains registered and functional. | `@claim:backup-import` passed from the clean clone. |
| F-1-4 | Normal-log deletion remains isolated from demo storage. | `@claim:delete-local-quotes` passed from the clean clone. |
| F-1-5 | Client receipt deletion remains available and persistent after reload. | `@claim:delete-client-receipt` passed from the clean clone. |
| F-1-6 | Price wording remains limited to the displayed $19 one-time option and its product checkout handoff. | `@claim:unlimited-price` passed from the clean clone and live. |
| F-1-7 | Privacy, Terms, and 404 retain complete route-specific Open Graph and Twitter metadata. | Shared-route metadata test passed locally and live. |
| F-1-8 | Client-link copy does not call the bearer link private and warns that anyone with it can read the quote. | `@claim:client-link` passed; warning is also on live `/`. |
| F-1-9 | README still explains browser storage and offline use without PWA jargon. | `.factory/copy-audit.md`. |
| F-1-10 | README still calls this a link a client can receive, not a browser fragment. | `.factory/copy-audit.md`. |
| F-1-11 | User copy says “unchangeable ID”; SHA-256 stays in technical proof. | `@claim:quote-fingerprint` passed. |
| F-1-12 | Browser-suite documentation remains split into short sentences. | `.factory/copy-audit.md`. |
| F-1-13 | Deployment documentation remains split into short plain sentences. | `.factory/copy-audit.md`. |
| F-2-1 | Receipt import remains registered and rejects invalid consent without changing the quote. | `@claim:receipt-import` passed; the live isolated rerun passed 2/2 browser projects. |
| F-2-2 | The user-facing feature list says data stays in this browser on this device. | `README.md` and `.factory/copy-audit.md`. |
| QD-001 | Checkout remains product-specific and no payment provider is embedded. | `@claim:unlimited-price`; live href is `https://api.sociobot.in/api/v1/products/quote-decision-log/checkout`. |
| QD-002 | Imported receipts still require the exact consent text. | `@claim:receipt-import` and `@claim:decision-consent-record`. |
| QD-003 | Backup validation still happens before replacement. | Full clean browser recovery suite passed. |
| QD-004 | A matching imported receipt still rerenders its decision immediately. | `@claim:receipt-import` and isolated live rerun passed. |
| QD-005 | Required quote fields still trim and reject whitespace-only values. | Full clean browser suite passed. |
| QD-006 | Legal links retain 44 px mobile targets. | Mobile target test passed locally and live. |
| QD-007 | Hashed assets retain one-year immutable caching. | Live hashed JS returned `Cache-Control: public, max-age=31536000, immutable`. |
| QD-008 | CSP, permissions, referrer, and content-type headers remain configured. | `npm test` deployment contracts passed; live response headers were checked. |
| QD-009 | Text limits and safe-money bounds still guard persisted records. | Full clean browser boundary tests passed. |
| QD-010 | Receipt consent remains tied to the exact quote version and fingerprint. | `@claim:receipt-import` passed. |
| QD-011 | The runner retains one retry for the container's intermittent Chromium crash. | Final clean full suite passed with no failed test. |
| QD-012 | The registry now contains 18 claims with exactly one matching tag each. | All 18 exact manifest commands passed separately from the clean clone. |
| QD-013 | `/demo` and `?demo=1` retain seeded data, banner, reset, isolated namespaces, and now destructive exit. | Expanded `@claim:demo-sample-data` passed locally and live. |
| QD-014 | Skip-link order and route-heading focus remain correct. | Keyboard and history/focus tests passed locally and live. |
| QD-015 | Mobile controls and legal links retain 44 px targets. | Mobile target suite passed; live landing width was 390/390 px. |
| QD-016 | Invalid license verification still rerenders the free state. | Full clean browser suite passed with the billing response stubbed. |
| QD-017 | Real routes, unique titles, consistent navigation, metadata, and designed 404 remain intact. | Live route/metadata test passed; unknown path returned 404. |
| QD-018 | Service-worker registration still fails softly. | Full clean resilience and update tests passed. |
| QD-019 | Client receipt retention and deletion remain isolated and persistent. | `@claim:client-decision-retention` and `@claim:delete-client-receipt` passed. |
| QD-020 | Share text accurately explains the bearer link and its delivery. | `@claim:client-link` passed. |
| QD-021 | The focused mobile skip link remains at least 44 px high. | Mobile target suite passed locally and live. |

## Final evidence

- Clean clone: `/tmp/quote-decision-polish3-clean.ED7aBo/app` at
  `0384c20d42382593b791f0a5f317c2a5a694155d`.
- All 18 exact commands in `.factory/claims.json` passed separately.
- `npm test` passed 11/11. Typecheck, lint, and production build passed.
- Full clean browser suite: 45 passed, 29 intended project skips.
- Dedicated mobile performance test passed.
- Production-safe live browser suite: 40 passed and 27 intended skips. One
  Chromium process crash recovered on the configured retry; its isolated rerun
  passed 2/2 with no assertion failure.
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.6 s, CLS 0, TBT 0 ms.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.1 s, CLS 0, TBT 0 ms.
- Build output: 17.03 kB gzip JavaScript and 6.29 kB gzip CSS.
- Local and live URL verification found one h1, one main, `lang="en"`, image
  alternatives, labelled buttons, and no console errors. Live route and header
  checks passed; all same-origin public routes returned 200 and the designed
  unknown route returned 404.
- Production `index.html`, hashed JavaScript, hashed CSS, and `sw.js` matched
  local `dist/` byte-for-byte by SHA-256. The live worker is `qd-shell-v7`.

No finding or known product gap remains in the reviewed scope.

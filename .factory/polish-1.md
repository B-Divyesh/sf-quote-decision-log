# Polish round 1 — finding closure

Polished candidate `511beddd3cc2855a997729b35373fd906eb80e7e` against
review `56401ede2e2df906303aaf0f5dc7942a5c55a89a` on 2026-09-01 UTC.
All 13 findings are resolved in the deployed v1.0.3 release.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | App, Privacy, Terms, and 404 now use the same four primary links: Quote log, Data & license, Try demo, and Privacy. Terms remains in every footer. The mobile app footer is visible and keeps both legal links. | `uses real app URLs, route titles, shared headers, social metadata, and the designed 404 page`; `keeps data and legal links at the 44px mobile target baseline`; [live demo desktop](evidence/polish-1/demo-desktop.png), [live Privacy mobile](evidence/polish-1/privacy-mobile.png); live `/`, `/privacy/`, `/terms/`, and unknown route checked. |
| F-1-2 | Added `decision-consent-record`. Its clean client context records a decision and asserts the exact consent sentence and typed name in the downloaded receipt. | `@claim:decision-consent-record`; production claim run passed at `/demo`; [live share screen](evidence/polish-1/live/share-warning-mobile.png). |
| F-1-3 | Added `backup-import`. The test exports both demo quotes, deletes them, imports the valid backup, reloads, and checks both clients return. | `@claim:backup-import`; clean-clone and production claim runs passed; [live demo](evidence/polish-1/live/screenshot-desktop.png). |
| F-1-4 | Added `delete-local-quotes`. It deletes a real quote, reloads, checks normal IndexedDB is empty, and confirms both demo quotes are unchanged. | `@claim:delete-local-quotes`; clean-clone and production claim runs passed; [live demo mobile](evidence/polish-1/live/screenshot-mobile.png). |
| F-1-5 | Added `delete-client-receipt`. A separate client context records, deletes, reloads, checks the decision form returns, and checks the receipt database is empty. | `@claim:delete-client-receipt`; clean-clone and production claim runs passed; [live share screen](evidence/polish-1/live/share-warning-mobile.png). |
| F-1-6 | Narrowed the promise to “The app displays a $19 one-time option for unlimited quotes.” The test checks the exact copy and the product-specific hosted checkout URL without contacting billing. Buttons now say “Open $19 checkout.” | `@claim:unlimited-price`; local test asserts pilot URL and production test asserts `https://api.sociobot.in/api/v1/products/quote-decision-log/checkout`; live `/data` passed. |
| F-1-7 | Added route-specific Open Graph and complete Twitter title, description, and image metadata to Privacy, Terms, and 404. Added `og:url` across static and app routes. | Shared-header/metadata browser test checks all tags on `/new`, `/privacy/`, `/terms/`, and `/404.html`; live run passed; [live 404 mobile](evidence/polish-1/live/404-mobile.png). |
| F-1-8 | Replaced “private, portable decision link” with “a link that carries the reviewed quote.” The share screen now warns: “Anyone with this link can read the reviewed quote.” | `@claim:client-link` asserts the warning and fragment payload; local and production runs passed; [live warning](evidence/polish-1/live/share-warning-mobile.png). |
| F-1-9 | Replaced “local-first PWA” with a direct explanation that records stay in this browser and the app can work offline after the first visit. | [README](../README.md); [copy audit](copy-audit.md), 15 words, no banned terms. |
| F-1-10 | Replaced “private client-link fragment” with “a link you can send to the client.” | [README](../README.md); [copy audit](copy-audit.md), 13 words; live share warning above. |
| F-1-11 | Replaced unexplained SHA-256 feature copy with “an unchangeable ID for each saved quote version.” Technical fingerprint validation remains tested. | [README](../README.md); `@claim:quote-fingerprint`; clean-clone and production runs passed. |
| F-1-12 | Split the 26-word browser-suite sentence into two sentences of 10 and 15 words. | [README](../README.md); [copy audit](copy-audit.md). |
| F-1-13 | Split the deployment sentence into 8- and 7-word sentences and removed unnecessary implementation detail. | [README](../README.md); [copy audit](copy-audit.md). |

## Cross-cutting acceptance evidence

- One-click `/demo` and `?demo=1`, persistent banner, reset, Start for real,
  and separate storage remain covered by `@claim:demo-sample-data`.
- Every one of the 16 commands in `.factory/claims.json` passed separately from
  a clean clone. The two claim tests changed after that run were rerun from the
  final clean clone.
- Final clean clone `/tmp/tmp.evbfZeXNHo/quote-decision-log`: 11 unit/contract
  tests passed; typecheck, lint, and build passed; browser suite reported 40
  passed and 26 expected cross-project skips.
- The same 16 claim commands passed against
  <https://quote-decision-log.sociobot.in> after deployment.
- The live accessibility/routing subset reported 6 passed and 4 expected
  project skips. Axe found no serious or critical issues.
- Cold verification: [report](evidence/polish-1/live/verify.json) and
  [desktop screenshot](evidence/polish-1/live/screenshot-desktop.png). It found
  no console errors, one h1, a main landmark, `lang="en"`, and no missing image
  alt text or unlabeled buttons.
- Live status checks: `/`, `/demo`, `/data`, `/privacy/`, and `/terms/` returned
  200. `/not-a-real-quote-route` returned 404 with the designed page.
- Local Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100, LCP 1.7 s, CLS 0, TBT 0 ms. Full report:
  [lighthouse.json](evidence/polish-1/lighthouse.json).
- Production build: 16.70 kB initial JavaScript gzip and 6.05 kB CSS gzip.

## Scope and deployment

The build was uploaded only to the exact Azure Static Web App resource
`sf-quote-decision-log`. No shared service, database, key vault, DNS resource,
or unrelated app was read or changed. The hosted checkout was not opened; its
product-specific handoff URL is asserted without making a billing request.

No finding or known product gap remains in the reviewed scope.

# Copy audit — 2026-09-02

Whitespace-delimited counts include visible prose and facts. Headings, button
labels, commands, and URLs are excluded unless they form a sentence. No item
exceeds 22 words, and no banned marketing term appears.

## Landing page

| Words | Copy | Result |
| ---: | --- | --- |
| 6 | Review quotes before you send them. | Pass |
| 16 | For tiny agencies that need one checked quote and a clear client answer before work starts. | Pass |
| 8 | See two sample quotes; no data is saved. | Pass |
| 4 | Stored in this browser | Pass |
| 6 | Works offline after the first visit | Pass |
| 7 | Five quotes free · $19 once for unlimited | Pass |
| 3 | Review before sending. | Pass |
| 5 | Capture scope, value, and expiry. | Pass |
| 7 | A named teammate checks the exact version. | Pass |
| 8 | Share a link that carries the reviewed quote. | Pass |
| 5 | Import the client’s consent receipt. | Pass |
| 9 | Quote records stay in this browser on this device. | Pass |
| 9 | Anyone with a client link can read the quote. | Pass |
| 10 | This is not a payment, document-editing, or regulated electronic-signature service. | Pass |
| 4 | Use five quotes free. | Pass |
| 8 | Pay $19 once to remove the quote limit. | Pass |
| 8 | Quote review and client decisions for tiny agencies. | Pass |

## README

| Words | Copy | Result |
| ---: | --- | --- |
| 18 | Quote Decision helps tiny agencies review a quote before sending it and keep a clear client decision trail. | Pass |
| 15 | It keeps quote records in this browser and can work offline after the first visit. | Pass |
| 7 | Try the shipped sample workspace at <https://quote-decision-log.sociobot.in/demo>. | Pass |
| 11 | It starts with two realistic quotes in a separate demo database. | Pass |
| 20 | Use Reset demo to restore them or Start for real to discard demo changes and open your own quote log. | Pass |
| 10 | keeps quote data in this browser on this device; | Pass |
| 9 | shows a named review before a quote is send-ready; | Pass |
| 13 | puts the reviewed quote in a link you can send to the client; | Pass |
| 5 | exports portable JSON decision receipts; | Pass |
| 11 | retains a client’s own receipt on that device for later download; | Pass |
| 11 | exports the whole log as JSON and a summary as CSV; | Pass |
| 9 | shows an unchangeable ID for each saved quote version; | Pass |
| 6 | works offline after the first visit; | Pass |
| 11 | supports five free quotes and displays a $19 one-time unlimited option. | Pass |
| 14 | Quote Decision is not a payment tool, document editor, or regulated electronic signature service. | Pass |
| 12 | A decision receipt records explicit click consent and a typed name only. | Pass |
| 13 | Every visitor-facing product claim is listed with its exact browser test in `.factory/claims.json`. | Pass |
| 7 | The sample sandbox is described in `.factory/demo.md`. | Pass |
| 5 | Requires Node.js 20 or later. | Pass |
| 8 | Each site address keeps its own browser data. | Pass |
| 7 | The normal quote log uses `quote-decision-log` IndexedDB. | Pass |
| 13 | The demo uses `demo:quote-decision-log` and does not read or write the normal database. | Pass |
| 12 | Client receipts use the separate `quote-decision-client-receipts` database, with a separate demo namespace. | Pass |
| 10 | `npm run build` creates `dist/` with `dist/index.html` at its root. | Pass |
| 10 | The browser suite checks desktop and 390 px mobile layouts. | Pass |
| 15 | It also checks keyboard use, privacy, demo, offline, updates, recovery, and the main quote flow. | Pass |
| 10 | Quotes and client receipts remain in separate browser IndexedDB databases. | Pass |
| 10 | License tokens and their cached daily verification result use localStorage. | Pass |
| 11 | There are no analytics, advertising trackers, remote fonts, or runtime CDNs. | Pass |
| 18 | Client links contain the quote in the URL fragment, so the app server does not receive the fragment. | Pass |
| 9 | Anyone who has the link can read its contents. | Pass |
| 16 | Use Data and license to export JSON or CSV, import a backup, or delete local quotes. | Pass |
| 12 | A client can download or delete the local receipt from its link. | Pass |
| 9 | Read the complete privacy policy and terms before purchase. | Pass |
| 6 | Publish `dist/` to the static host. | Pass |
| 8 | `public/staticwebapp.config.json` configures application routes and the 404 page. | Pass |
| 7 | It also sets security and cache headers. | Pass |
| 7 | The service worker requires HTTPS in production. | Pass |
| 11 | The product-specific visual system and generated-art provenance are documented in `.factory/design.md`. | Pass |
| 11 | The social preview is derived from the same original dispatch-gate artwork. | Pass |
| 6 | Source art is retained in `assets/src/`. | Pass |
| 1 | MIT. | Pass |
| 2 | See LICENSE. | Pass |

## Offline fallback

| Words | Copy | Result |
| ---: | --- | --- |
| 6 | This page is not available offline. | Pass |
| 13 | Reconnect and try again, or open a quote page you visited while connected. | Pass |
| 8 | Quote review and client decisions for tiny agencies. | Pass |

## Terminology

| Concept | Product word |
| --- | --- |
| Commercial offer | quote |
| Internal checkpoint | review |
| Customer response | client decision |
| Portable proof file | decision receipt |
| Sample workspace | demo |
| Version identifier | fingerprint |
| Paid capacity | one-time unlimited option |

The access warning uses “Anyone with this link can read the reviewed quote.”
The word “private” is not used to describe the client link.

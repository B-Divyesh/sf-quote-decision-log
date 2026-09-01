# Polish round 2 — zero-finding closure

Polished release candidate `9f71c7d82eab27b1317ce8d3a933611ae364b035` through product commit `d96dc66f98f0904af2b71f0fe6900306ce2ce7cf` on 2026-09-01 UTC. Production was deployed from that product commit to <https://quote-decision-log.sociobot.in>.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| QD-001 | The buy action uses Quote Decision’s Sociobot checkout endpoint. | `@claim:unlimited-price`; live `/data` claim run passed. |
| QD-002 | Receipt validation requires consent text before storage. | `@claim:receipt-import` rejects the missing-consent file. |
| QD-003 | Backup validation rejects malformed data before it replaces the log. | Full browser suite recovery cases passed. |
| QD-004 | Receipt import refreshes the matching quote immediately. | `@claim:receipt-import` shows “Accepted by Ari Patel” immediately. |
| QD-005 | Required quote fields trim and reject whitespace-only values. | Full browser suite form-boundary cases passed. |
| QD-006 | Legal links meet the 44 px mobile target baseline. | Full browser accessibility/mobile suite passed. |
| QD-007 | Hashed static assets use immutable caching. | Existing deployment contract tests and clean build passed. |
| QD-008 | Static configuration supplies CSP, permissions, MIME, and security headers. | `npm test` deployment tests passed from the final clean clone. |
| QD-009 | Input length and safe-money bounds protect local records. | Full browser suite boundary cases passed. |
| QD-010 | Client receipt validation is tied to the exact quote version and fingerprint. | `@claim:receipt-import` validates a matching receipt and rejects altered consent evidence. |
| QD-011 | Browser runner now retries one transient Chromium process crash. | Final clean-clone `npm run test:e2e`: passed, no failed tests. |
| QD-012 | Claims registry and tagged sandbox tests are present. | Final clean clone ran all 17 exact registry commands successfully. |
| QD-013 | `/demo` and `?demo=1` seed isolated samples with a persistent reset/start banner. | Live `@claim:demo-sample-data`; [mobile demo](evidence/polish-2/live-demo-390.png). |
| QD-014 | The skip link is the first keyboard destination and route focus is managed. | Full browser accessibility suite passed. |
| QD-015 | Mobile controls and legal links retain 44 px targets. | Full browser mobile suite passed. |
| QD-016 | Invalid license verification rerenders the paid state immediately. | Full browser license-state test passed. |
| QD-017 | App, legal, and 404 routes have real URLs, route titles, shared navigation, metadata, and a designed 404. | Live home, legal, and 404 checks; [live 404](evidence/polish-2/live-not-found.png). |
| QD-018 | Service-worker registration fails softly. | Full browser/offline suite passed. |
| QD-019 | Client receipt retention survives reload and can be deleted. | `@claim:client-decision-retention` and `@claim:delete-client-receipt` passed from the final clean clone. |
| QD-020 | Share copy accurately describes the link and its access warning. | `@claim:client-link` passed from the final clean clone. |
| QD-021 | The mobile skip link is 44 px high. | Full browser mobile suite passed. |
| F-1-1 | Shared header and footer navigation is consistent on app, legal, and 404 routes. | Full route/metadata test; live legal screenshots. |
| F-1-2 | Explicit consent and typed client name are registered and tested. | `@claim:decision-consent-record` passed. |
| F-1-3 | Valid JSON backup import is registered and tested. | `@claim:backup-import` passed. |
| F-1-4 | Deleting normal quotes without touching demo data is registered and tested. | `@claim:delete-local-quotes` passed. |
| F-1-5 | Deleting a local client receipt is registered and tested. | `@claim:delete-client-receipt` passed. |
| F-1-6 | The paid statement is limited to a displayed $19 one-time option and its product-specific handoff. | `@claim:unlimited-price` passed. |
| F-1-7 | Legal and 404 pages expose complete route-specific social metadata. | Full route/metadata test; live [Privacy](evidence/polish-2/live-privacy.png), [Terms](evidence/polish-2/live-terms.png), and 404 checks. |
| F-1-8 | Share wording no longer calls a bearer link private and warns anyone with it can read it. | `@claim:client-link` passed. |
| F-1-9 | README opening uses plain browser-storage and offline wording. | `.factory/copy-audit.md`. |
| F-1-10 | README calls it a link to send to the client, not a fragment. | `.factory/copy-audit.md`. |
| F-1-11 | README calls the digest an unchangeable ID in feature copy. | `.factory/copy-audit.md`; `@claim:quote-fingerprint` passed. |
| F-1-12 | README browser-suite description is split into short sentences. | `.factory/copy-audit.md`. |
| F-1-13 | README deploy wording is split into plain short sentences. | `.factory/copy-audit.md`. |
| F-2-1 | Added `receipt-import` and a clean-demo test that imports a valid receipt, shows the named decision immediately, then rejects invalid consent evidence without changing it. | `npm run test:e2e -- --grep @claim:receipt-import` passed locally and live; [mobile demo](evidence/polish-2/live-demo-390.png). |
| F-2-2 | Rewrote the README feature-list item as “keeps quote data in this browser on this device.” | `README.md`; `.factory/copy-audit.md`. |

## Final evidence

- Final clean clone: `/tmp/quote-decision-final-clean.O1i2e7/app` at `d96dc66f98f0904af2b71f0fe6900306ce2ce7cf`.
- All 17 exact test commands in `.factory/claims.json` passed individually.
- `npm test` passed 11 tests; `npm run typecheck`, `npm run lint`, and `npm run build` passed. The build produced `dist/` with 16.70 kB gzip JS and 6.03 kB gzip CSS.
- Final clean-clone `npm run test:e2e` passed with no failed tests; the mobile performance test passed.
- Production deploy succeeded via `swa deploy ./dist --env production` to `sf-quote-decision-log`.
- Cold live checks found one `h1`, one `main`, `lang="en"`, correct titles, no horizontal overflow at 390 px, and no serious or critical axe findings on home, demo, Privacy, Terms, and 404. The browser’s 404 document request naturally reports its HTTP 404 in the network console; no application error or subresource error was present.

No finding remains open.

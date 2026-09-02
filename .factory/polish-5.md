# Polish round 5 — zero-finding closure

Polished candidate `a638e750b63a65c1e54fc0ed67bee3acac3f8e60` and review
`4fbb1134e19edd416b317afab900d28f9597282f` through repair commit
`b267f8ed9c32f4943b608541a5315311935c6d39` on 2026-09-02 UTC. Version
1.0.8 is deployed at <https://quote-decision-log.sociobot.in>.

## Review 5 finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-5-1 | Rebalanced the desktop hero to a wider copy column, reduced the display cap and vertical gaps, and made the hero height viewport-aware. The intermediate responsive breakpoints now stack before the two-column minimum can overflow. Added the exact 1440 × 768 fold regression. | `keeps every first-screen fact above the desktop fold` passed locally, in the clean clone, and live. On the cold live page, all three facts end at 645.61 px in a 768 px viewport. [Desktop screenshot](evidence/polish-5/live/home-1440x768.png), [mobile screenshot](evidence/polish-5/live/home-390x844.png), [measurements](evidence/polish-5/live/first-screen.json), live `/` returned 200. |

## Cumulative finding map

Every earlier review and polish record was reread. Each earlier condition was
rechecked in the final clean clone and the deployed build.

| Finding | Preserved change | Final evidence |
| --- | --- | --- |
| QD-001 | The purchase action uses Quote Decision's Sociobot checkout endpoint; no payment provider is embedded. | `@claim:unlimited-price` passed clean and live without opening checkout. |
| QD-002 | Imported receipts require the exact consent text. | `@claim:decision-consent-record` and `@claim:receipt-import` passed clean and live. |
| QD-003 | A malformed backup is validated before any stored quote is replaced. | `rejects a structurally invalid backup without damaging the log` passed clean and live. |
| QD-004 | Valid receipt import immediately redraws the matching client decision. | `@claim:receipt-import` passed clean and live. |
| QD-005 | Required quote fields trim input and reject whitespace-only values. | `rejects whitespace-only required quote fields with field guidance` passed clean and live. |
| QD-006 | Legal links retain 44 px mobile targets. | `keeps data and legal links at the 44px mobile target baseline` passed clean and live. |
| QD-007 | Hashed assets retain one-year immutable caching. | Live hashed JavaScript returned `public, max-age=31536000, immutable`; [headers](evidence/polish-5/live/asset-headers.txt). |
| QD-008 | CSP, permissions, referrer, HSTS, MIME, and nosniff policies remain configured. | Deployment contracts passed; live response headers are in [root-headers.txt](evidence/polish-5/live/root-headers.txt). |
| QD-009 | Text lengths and safe-money limits are enforced before persistence. | `never persists a quote or review that violates the stored schema` and nine data tests passed clean and live. |
| QD-010 | Imported consent remains tied to the exact quote version and fingerprint. | `@claim:receipt-import` and `@claim:quote-fingerprint` passed clean and live. |
| QD-011 | Playwright retains one retry for an intermittent browser-process crash. | The final clean and live suites completed with no failed test. |
| QD-012 | All 19 claims map to exactly one tagged browser test. | `claim contract > maps every listed claim to exactly one tagged browser test` passed; every manifest command passed individually. |
| QD-013 | `/demo` and `?demo=1` provide seeded data, a banner, reset, isolated storage, and destructive exit. | `@claim:demo-sample-data` passed clean and live. Cold `?demo=1` opened only `demo:quote-decision-log`; [live screenshot](evidence/polish-5/live/demo-query-390x844.png). |
| QD-014 | The skip link is first and route changes focus the new h1. | `supports the core review checkpoint with keyboard controls` and `updates the real URL and focuses each heading on forward and back navigation` passed clean and live. |
| QD-015 | Mobile controls and legal links keep 44 px targets. | `keeps data and legal links at the 44px mobile target baseline` passed clean and live. |
| QD-016 | Invalid license verification immediately redraws the free state. | `rerenders paid state immediately after an invalid license verification` passed clean and live with the response stubbed. |
| QD-017 | Real routes, route titles, shared navigation, metadata, canonicals, and the designed 404 remain intact. | `uses real app URLs, route titles, shared headers, social metadata, and the designed 404 page` passed clean and live. The stable route crawl returned 200 and the unknown route returned the designed 404. |
| QD-018 | Blocked service-worker registration fails without breaking the app. | `does not throw when service worker registration is blocked` passed clean and live. |
| QD-019 | Client receipt retention and deletion remain isolated and persistent. | `@claim:client-decision-retention` and `@claim:delete-client-receipt` passed clean and live. |
| QD-020 | Share text says anyone with the link can read the reviewed quote. | `@claim:client-link` passed clean and live. |
| QD-021 | The focused mobile skip link remains at least 44 px high. | `keeps data and legal links at the 44px mobile target baseline` passed clean and live. |
| F-1-1 | App, legal, fallback, and 404 pages keep the same four header links and legal footer. | Shared-header route test passed clean and live; verifier screenshots cover the current shell. |
| F-1-2 | Exact consent and typed client name stay registered and tested. | `@claim:decision-consent-record` passed clean and live. |
| F-1-3 | Valid JSON backup import remains registered and functional. | `@claim:backup-import` passed clean and live. |
| F-1-4 | Deleting normal quotes remains isolated from demo data. | `@claim:delete-local-quotes` passed clean and live. |
| F-1-5 | A client can delete its saved local receipt. | `@claim:delete-client-receipt` passed clean and live. |
| F-1-6 | Price wording is limited to the displayed $19 option and product checkout handoff. | `@claim:unlimited-price` passed clean and live. |
| F-1-7 | Privacy, Terms, and 404 retain complete route-specific social metadata. | Route/metadata test passed clean and live. |
| F-1-8 | No bearer link is called private; the access warning remains visible. | `@claim:client-link` passed clean and live. |
| F-1-9 | The README explains browser storage and offline use without PWA jargon. | `.factory/copy-audit.md` contains no flagged sentence. |
| F-1-10 | README calls this a link a client can receive, not a browser fragment. | `.factory/copy-audit.md`; `@claim:client-link` passed. |
| F-1-11 | User copy says “unchangeable ID”; SHA-256 remains technical proof. | `.factory/copy-audit.md`; `@claim:quote-fingerprint` passed. |
| F-1-12 | The browser-suite description remains split into short sentences. | `.factory/copy-audit.md` contains no sentence over 22 words. |
| F-1-13 | Deployment documentation remains split into short sentences. | `.factory/copy-audit.md` contains no sentence over 22 words. |
| F-2-1 | Receipt import remains a registered valid/invalid clean-demo outcome. | `@claim:receipt-import` passed clean and live. |
| F-2-2 | The user feature list says data stays in this browser on this device. | `README.md` and `.factory/copy-audit.md`. |
| F-3-1 | **Start for real** clears both demo databases before leaving. | `@claim:demo-sample-data` passed clean and live. |
| F-3-2 | Scope, value, and expiry remain registered persisted fields. | `@claim:quote-fields` passed clean and live. |
| F-3-3 | The landing page retains its plainly named **Privacy and limits** section. | `explains privacy, limits, and the complete price tier on the landing page` passed clean and live. |
| F-3-4 | The landing page states five free quotes and $19 once for unlimited. | `@claim:free-five-quotes` and `@claim:unlimited-price` passed clean and live. |
| F-3-5 | The README says each site address keeps its own browser data. | `README.md` and `.factory/copy-audit.md`. |
| F-4-1 | The sitemap lists all stable app routes and the deployment contract checks the complete inventory. | `static deployment policy > lists every stable public route in the sitemap and rewrites each stable app route exactly` passed; all eight indexed routes returned 200 live. |

## Final evidence

- Clean clone: `/tmp/quote-decision-polish5-clean.DRQyzQ/app` at `b267f8e`.
- All 19 exact commands from `.factory/claims.json` passed individually.
- Clean `npm test`: 12 passed. Typecheck, lint, and production build passed.
- Clean full browser suite: 49 passed and 31 intended cross-project skips.
- Dedicated mobile performance test: 1 passed.
- Production-safe live browser suite: 48 passed and 30 intended skips. Only
  the test that deliberately changes local `dist/sw.js` was excluded.
- Local and live URL verifier checks found HTTPS 200, one h1, `lang=en`, one
  main landmark, complete image alternatives, labelled buttons, and no console
  errors. [Live verifier](evidence/polish-5/live/verify/verify.json).
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  and 100 SEO; LCP 1.7 s, CLS 0, TBT 0 ms.
- Live Lighthouse: 100 in all four categories; LCP 1.3 s, CLS 0, TBT 0 ms.
- Production JavaScript is 17.04 kB gzip and CSS is 6.27 kB gzip.
- All 19 checked public deployment files matched local `dist/` byte-for-byte.
- Deployment ID: `0d5cea3c-20ed-42eb-aada-eb5929819844`; resource
  `sf-quote-decision-log` in resource group `sociobot`.

No finding from reviews 1–5 remains open.

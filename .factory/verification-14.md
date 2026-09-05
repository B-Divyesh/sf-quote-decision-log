# Quote review and client decision verification 14 — FAIL

Verified 5 September 2026 for work order
`quote-decision-log-verify-14`.

## Verdict

**FAIL.** The product works and the deployed files match the implementation,
but the public claims contract is incomplete. One release-blocking finding
contains seven public promises without a complete declared claim test.

- Finding count: **1**
- Untested claim count: **7**
- Implementation reviewed: `e014a7ec99526128e290aaa709600643b522fe46`
- Documentation base reviewed: `bde3d9cd792cb4f1b0bc6d42ababb12cac26a07f`
- Live URL: <https://quote-decision-log.sociobot.in>
- Product code changed by this verifier: none

`bde3d9c` changes only `.factory` reports and evidence after `e014a7e`. There
is no runtime, dependency, build, source, or public-file difference between
those commits.

## First screen before scrolling

Fresh desktop 1440×768 and phone 390×844 Chromium contexts showed the same
plain answer.

- Job: **Review quotes before you send them.**
- Audience: tiny agencies that need one checked quote and a clear client
  answer before work starts.
- First action: **Try it with sample data.** The adjacent text says it opens
  two sample quotes and saves no data.

The action and all three product facts fit before the bottom of both
viewports. The phone document width was 390 px, with no horizontal overflow.
No console or page error occurred.

## Demo and product behavior

The first action opened `/demo` in one click. It immediately showed:

- Cedar & Kite, Product photography, $2,100, accepted;
- Harrow & Vale, Website launch, $4,800, send-ready;
- the persistent label **Demo — sample data, nothing is saved**;
- **Reset demo** and **Start for real**.

The declared demo test added sample data and a sample receipt, left the demo,
proved both demo databases empty, preserved a real quote in the fresh browser,
and restored only the two seeds on re-entry. This proves that the QA flow did
not change any visitor's real data.

Fresh live and clean-build checks covered:

- create, save, reload, review, send, accept, decline, receipt export, and
  receipt import;
- exact consent text, typed client name, version fingerprint, and old-link
  retention;
- JSON and CSV export, valid backup recovery, invalid backup rejection, quote
  deletion, and client-receipt deletion;
- empty state, spaces-only fields, overlong names, unsafe money, zero value,
  five-quote limit, expired link, invalid stored data, and blocked service
  worker registration;
- keyboard-only creation and review, history navigation, route focus, mobile
  touch targets, 200% text scale, reduced motion, offline reload, offline
  fallback, and service-worker update activation.

A separate fresh 390×844 live client declined a quote and downloaded a valid
schema-2 receipt with a 64-character receipt digest. A fresh expired client
link showed the quote but no decision form. A fresh demo edit created version
2, changed its fingerprint, cleared approval to **Needs review**, and left the
old client link on version 1.

## Declared claim commands

`.factory/claims.json` contains 19 entries. Every exact `test` command was run
separately from the clean clone after `npm ci`; all 19 exited successfully.

| Claim | Result |
| --- | --- |
| `demo-sample-data` | Pass |
| `quote-fields` | Pass |
| `local-device-privacy` | Pass for its declared demo-only sandbox |
| `no-tracking-remote-resources` | Pass |
| `json-export` | Pass |
| `csv-export` | Pass |
| `quote-fingerprint` | Pass |
| `review-checkpoint` | Pass |
| `client-link` | Pass |
| `decision-receipt` | Pass |
| `decision-consent-record` | Pass |
| `receipt-import` | Pass |
| `client-decision-retention` | Pass |
| `backup-import` | Pass |
| `delete-local-quotes` | Pass |
| `delete-client-receipt` | Pass |
| `unlimited-price` | Pass |
| `free-five-quotes` | Pass |
| `offline-reload` | Pass |

Each command ran one matching test and one intended project skip. The clean
contract test also confirmed that each listed claim maps to exactly one tagged
browser test.

## Finding

### High — F-14-1: seven public promises are outside the claims contract

The claims contract says every statement a visitor can rely on must appear in
`.factory/claims.json` with one tagged observable test. The following public
promises are absent or not covered by the declared sandbox:

1. Editing a reviewed quote creates a new version, clears approval, retires
   the old link, and keeps earlier decisions only in history. This appears on
   the edit, share, and quote-detail screens. No claim test performs an edit.
2. An expired client link allows inspection but blocks a new decision. The
   `quote-fields` claim only proves that the expiry value is saved.
3. A client can accept **or decline** without an account. Decline works in the
   fresh live check, but no declared claim test chooses the decline path.
4. At the five-quote limit, existing review, send, decision, export, delete,
   accessibility, and safety features remain available. The `free-five-quotes`
   test stops after proving the limit screen.
5. A refund revokes the corresponding license. This is stated on Data and
   license and in Terms, but no claim entry or fixture-backed tagged test
   covers a revoked result.
6. A failed offline license check keeps the last valid unlock. The recovery
   message makes this promise, but no declared claim test covers that state.
7. License verification sends the token but does not send quotes. Privacy
   makes this specific promise. `local-device-privacy` only opens a demo quote
   and never exercises the cross-origin license request.

These gaps are visible in `src/main.ts` around the edit, dispatch, client,
license, and paywall screens, and in `public/privacy/index.html` and
`public/terms/index.html`. None of the 19 claim entries names these outcomes.
General untagged tests or this verifier's spot checks do not satisfy the
required one-claim/one-command contract.

Required repair: add narrowly worded claim entries and tagged sandbox tests,
or remove the promises. The tests can stay local: use demo quotes for edit,
expiry, decline, and the free limit; stub revoked/offline license responses;
and inspect the license request for token-only data. Then rerun every exact
claim command from a clean clone.

## Clean checkout and quality gates

Clean checkout:
`/tmp/quote-decision-verify14.psESsC/app` at
`bde3d9cd792cb4f1b0bc6d42ababb12cac26a07f`.

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 61 packages, 0 reported vulnerabilities |
| `npm test` | Pass; 12 tests |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:e2e` | Clean rerun: 49 passed, 31 intended skips |
| `npm run test:performance` | Pass; one mobile budget test |

One earlier aggregate run retried a local delete assertion once. The exact
claim had already passed, it passed again alone, and the complete clean rerun
then passed 49/49 applicable cases without a retry. One live mobile offline
test also needed its configured first retry; an immediate isolated live rerun
passed. Neither condition reproduced.

The build emits 17.04 kB gzip JavaScript and 6.29 kB gzip CSS. It has no font
download. The largest hero image is 48.00 kB. These are within the supplied
PWA budgets.

Fresh Lighthouse 12.8.2 on live `/demo` reported:

| Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 100 | 100 | 100 | 1.0 s | 0 | 0 ms |

## Live deployment, routes, and PWA

The clean build contains 20 publicly served files plus
`staticwebapp.config.json`. All 20 public files matched production
byte-for-byte. The deployment control file correctly returned the designed
HTTP 404 and was not counted as a public asset mismatch.

`/`, `/demo`, `/new`, `/data`, `/demo/new`, `/demo/data`, `/privacy/`,
`/terms/`, `/offline.html`, `/404.html`, the manifest, robots file, and
sitemap returned 200. A fresh unknown URL returned HTTP 404 with the designed
page and links back. Every collected same-origin page link returned 200.

The live worker contains `qd-shell-v13` and `qd-assets-v13`. The repaired local
update regression read those shipped labels, created a waiting worker, showed
the update action, activated the new worker, and removed the old cache. The
offline claim used its own 390×844 context at 200% text scale and kept the
offline notice, demo disclosure, and sample log visible.

## Accessibility, privacy, and site structure

- The URL verifier passed live home and demo: `lang=en`, one h1, one main,
  complete image alternatives, labelled buttons, and no console errors.
- Live axe scans in the production-safe suite found no serious or critical
  issue on empty, form, data, demo, client, legal, offline, and 404 screens.
- First Tab reaches the 44 px skip link. Route changes focus the new h1.
  Enter and Space complete the keyboard review checkpoint.
- Required mobile controls and legal links meet 44×44 px. Zoom is enabled.
  The 200% text and offline layout passed without hiding the demo disclosure.
- With reduced motion, the live page reported `scroll-behavior: auto`, one
  animation iteration, and 0.01 ms animation and transition durations.
- Demo, client, and export claim flows made same-origin GET requests only.
  No beacon, analytics, tracker, remote font, runtime CDN, cookie, client name,
  or URL fragment left the product origin in those tested flows.
- Titles, descriptions, canonicals, Open Graph/Twitter metadata, shared
  headers and footers, sitemap routes, focus handling, and the designed 404
  passed on the live build.

This is a static local-first PWA. It has no product backend, tenant store,
restart persistence, health endpoint, or product API rate allowance to test.
The product-specific Sociobot checkout link was checked without following it;
no purchase or external account change was made.

## Earlier finding disposition

All earlier verification, review, polish, and handoff files were read. The
following table records fresh disposition, including minor findings.

| Earlier finding | Current evidence |
| --- | --- |
| QD-001 | Product-specific Sociobot checkout href passed `unlimited-price`; the displayed claim is limited to the $19 option and handoff. |
| QD-002 | Exact consent text is required by `decision-consent-record` and invalid receipt checks. |
| QD-003 | Invalid backups are rejected before replacement; clean recovery test passed. |
| QD-004 | A valid imported receipt redraws the named decision immediately; `receipt-import` passed. |
| QD-005 | Spaces-only required fields show field guidance; live and clean tests passed. |
| QD-006 | Client and legal links meet the 44 px mobile target test. |
| QD-007 | Hashed assets carry immutable policy and matched production. |
| QD-008 | CSP, Permissions-Policy, HSTS, no-referrer, nosniff, and manifest MIME remain live. |
| QD-009, stored-schema boundary | Unsafe money and overlong records do not persist; unit and browser tests passed. |
| QD-009, offline disclosure overlap | Offline 200% mobile claim proved the disclosure is visible and topmost. |
| QD-010 | Receipt import stays tied to exact quote version and fingerprint. |
| QD-011 | Final clean full suite passed 49 tests with no retry. |
| QD-012 | All 19 listed claims map to one tag and passed, but F-14-1 finds additional public claims. |
| QD-013 | `/demo` and `?demo=1` keep isolated seeds, reset, and destructive exit. |
| QD-014 | Initial focus and first Tab behavior passed. |
| QD-015 | Mobile controls and legal links retain 44 px targets. |
| QD-016 | Invalid license verification redraws the free state in the browser test. |
| QD-017 | Real paths, titles, metadata, shared chrome, and 404 passed live. |
| QD-018 | Blocked service-worker registration fails softly with no page error. |
| QD-019 | Client receipt retention and deletion passed in isolated client storage. |
| QD-020 | Client-link copy warns that anyone with the link can read the quote. |
| QD-021 | The focused phone skip link remains at least 44 px high. |
| F-1-1 | App, legal, offline, and 404 pages share the required header and footer. |
| F-1-2 | Exact consent and typed name are registered and tested. |
| F-1-3 | Valid backup import is registered and tested. |
| F-1-4 | Real quote deletion is registered and stays isolated from demo data. |
| F-1-5 | Local client-receipt deletion is registered and tested. |
| F-1-6 | Price wording is narrow; the product handoff href is tested without a purchase. |
| F-1-7 | Legal and 404 social metadata are complete. |
| F-1-8 | The client link is not called private and carries the access warning. |
| F-1-9 | README explains browser storage and offline use in plain words. |
| F-1-10 | README calls it a client link, not a browser fragment. |
| F-1-11 | README uses “unchangeable ID”; SHA-256 remains in technical proof. |
| F-1-12 | Browser-suite documentation stays within the copy limit. |
| F-1-13 | Deployment documentation remains short and literal. |
| F-2-1 | Receipt import has a registered valid/invalid claim test. |
| F-2-2 | User-facing storage wording avoids IndexedDB jargon. |
| F-3-1 | Start for real clears both demo databases and preserves real data. |
| F-3-2 | Scope, value, and expiry persistence is registered and tested. |
| F-3-3 | The landing page includes Privacy and limits with clear non-goals. |
| F-3-4 | The landing page states five free quotes and $19 once for unlimited. |
| F-3-5 | README says each site address keeps its own browser data. |
| F-4-1 | Sitemap lists every stable public application route. |
| F-5-1 | All three facts end above 646 px in the 768 px desktop viewport. |
| F-6-1 | The update test reads and asserts the shipped v13 cache labels and passed. |

No earlier product defect reproduced. F-14-1 is a new claims-completeness
finding and is sufficient to keep the verdict at FAIL.

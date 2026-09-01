# Independent product verification 8 — PASS

## Verdict

**PASS.** Candidate `e250609449f2ea8c9b467d5f35fafc9fe38804b4` meets the researched brief and release contract at <https://quote-decision-log.sociobot.in>.

- Work order: `quote-decision-log-verify-8`
- Date: 2026-09-01 UTC
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2 / Chromium
- Product: local-first offline PWA
- Defects: critical 0, high 0, medium 0, low acceptance defects 0

No product code was changed. This report and the handoff update are the only working-tree changes made by this verifier.

## Mandatory first gate: claims — PASS

`.factory/claims.json` exists. After the clean-checkout `npm ci` prerequisite, every exact declared command was run individually from its documented demo entry point. All 17 passed (each command reports its intentionally skipped second browser project where applicable):

| Claim ID | Result |
| --- | --- |
| `demo-sample-data` | PASS |
| `local-device-privacy` | PASS |
| `json-export` | PASS |
| `csv-export` | PASS |
| `quote-fingerprint` | PASS |
| `review-checkpoint` | PASS |
| `client-link` | PASS |
| `decision-receipt` | PASS |
| `decision-consent-record` | PASS |
| `receipt-import` | PASS |
| `client-decision-retention` | PASS |
| `backup-import` | PASS |
| `delete-local-quotes` | PASS |
| `delete-client-receipt` | PASS |
| `unlimited-price` | PASS |
| `free-five-quotes` | PASS |
| `offline-reload` | PASS |

The landing page and README were also read against that registry; no unlisted visitor-facing product claim was found.

## Cold first-read and demo — PASS

Opened cold at the live root, the first screen says:

- What it does: “Review quotes before you send them.”
- For whom: “For tiny agencies that need one checked quote and a clear client answer before work starts.”
- What to click first: “Try it with sample data,” with “See two sample quotes; no data is saved.” immediately beside it.

The visible one-click action opened `/demo`, immediately showed two realistic quotes, and showed the persistent “DEMO — sample data, nothing is saved” banner with Reset demo and Start for real. The 390 px demo view had no horizontal overflow (`scrollWidth = clientWidth = 390`).

## Clean-checkout gates — PASS

| Command | Evidence |
| --- | --- |
| `npm ci` | PASS — 61 packages, 0 vulnerabilities |
| `npm test` | PASS — 11 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — produced `dist/` |
| `npm run test:e2e` | PASS — 70 configured desktop/mobile executions; only intentional project skips |
| `npm run test:performance` | PASS — mobile 390 px CPU-throttled CLS and blocking-time budget test |

The full `npm run test:e2e` suite was then run with `PLAYWRIGHT_BASE_URL=https://quote-decision-log.sociobot.in`; it also passed. This exercises normal quote creation, review checkpoint, send link, explicit client consent and typed name, receipt import/export, versions, expiry, backup/import/delete, malformed input recovery, keyboard flow, service-worker update, offline reload, desktop/mobile, and axe scans against deployment.

Build budgets are within contract: initial JS is 16.70 kB gzip, CSS is 6.03 kB gzip, and the largest shipped hero WebP is 47,998 bytes.

## Deployment identity, PWA, privacy, and platform checks — PASS

- Local HEAD was exactly the requested candidate before this documentation change.
- The live root HTML plus its hashed JS, CSS, and both generated hero assets matched local `dist/` byte-for-byte by SHA-256. A full comparison found all 20 publicly served `dist/` files identical. The only 21st entry, `staticwebapp.config.json`, is correctly consumed by Static Web Apps and returns the configured designed 404 instead of being served as a file.
- `/`, `/demo`, `/new`, `/data`, `/privacy`, `/terms`, manifest, offline page, robots, sitemap, and unknown-route 404 all returned the expected status.
- Home and demo loaded with no console or page errors. The page has `lang=en`, title, one H1, main landmark, skip link, and a visible first-Tab focus ring (`rgb(214, 168, 75) solid 3px`). Manual live axe found zero serious or critical violations.
- In a full demo/detail/data flow, every browser request was same-origin. No analytics, tracker, remote font, CDN, or client data transmission was observed. The live response has CSP, HSTS, `nosniff`, no-referrer policy, and a restrictive permissions policy.
- Hash-named JS/CSS/assets use `Cache-Control: public, max-age=31536000, immutable`; HTML and `sw.js` use no-cache. The live worker was active and controlling the page. Offline reload and the waiting-worker update toast passed in the deployed suite. Reduced motion was detected and the checked transition duration was effectively zero (`0.00001s`).
- The $19 checkout/verification integration points only at the documented Sociobot API. A harmless invalid-token probe was rate-limited after 30 requests from this client; request 31 returned `429` with `Retry-After: 3`. No product-specific server endpoint or sign-in flow exists.

## Known gaps / next steps

None in the reviewed scope. Factory deployment may proceed from this candidate.

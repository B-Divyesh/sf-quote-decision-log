# Quote Decision repair handoff

## Result

Release-blocking findings QD-001 through QD-008 from verifier commit
`4ede2063afa7ec2a12be6f42d30d97a6eaed0a8e` are repaired. The researched
brief, local-first PWA deployment class, five-quote free tier, visual system,
and previously passing quote/review/send/decision behavior are preserved.

Application repair commit:
`edbdb71175b24822def012570976aecc86cbe2c2`.

Production: <https://quote-decision-log.sociobot.in>

## Finding-by-finding repair

- **QD-001 — checkout unavailable:** registered the live Dodo digital product
  and immutable Sociobot factory mapping for `quote-decision-log`, USD 1900,
  returning to the production origin. The public catalog now lists the product;
  checkout returns HTTP 303 to Dodo and the hosted session returns HTTP 200.
- **QD-002 — receipt consent/integrity:** schema-2 receipts require the exact
  consent statement and a SHA-256 fingerprint over quote ID/version/digest,
  answer, signer, timestamp, consent, and note. Import rejects missing consent,
  changed fields, malformed metadata, and a conflicting replacement for an
  already-recorded version. Full backups remain backward-compatible with valid
  existing schema-1 decision records.
- **QD-003 — corrupt backup persisted:** backup validation now checks every
  quote, non-empty/unique version set, current-version reference, snapshot
  fields, SHA-256 version fingerprint, review, sent status, decision references,
  decision history, duplicate quote IDs, and timestamps before any write. Bad
  imports leave IndexedDB unchanged. Previously corrupt local data gets an
  explicit recovery screen with valid-backup replacement and confirmed delete.
- **QD-004 — stale receipt view:** successful receipt import explicitly renders
  the updated quote even when the route hash was already current.
- **QD-005 — whitespace records:** required quote text is trimmed, checked for
  non-space content, and paired with field-specific recovery text; reviewer and
  client decision names receive the same non-space check.
- **QD-006 — mobile legal targets:** client Privacy and Terms links are at least
  44 by 44 CSS pixels; the 390px regression measures both axes.
- **QD-007 — immutable assets:** `/assets/*` now returns
  `Cache-Control: public, max-age=31536000, immutable`; HTML and `sw.js` use
  `no-cache` so releases and service-worker updates are visible immediately.
- **QD-008 — policy/MIME:** the static host now sends CSP,
  Permissions-Policy, `Referrer-Policy: no-referrer`, and nosniff. The web
  manifest is served as `application/manifest+json`.

## Regression coverage

`src/data.test.ts` covers exact consent, edited receipt fields, empty-version
backup rejection, valid backup restoration, and snapshot-tamper rejection.
`src/deployment.test.ts` locks manifest MIME, immutable asset caching, CSP, and
Permissions-Policy. `tests/app.spec.ts` covers immediate receipt rendering,
missing-consent rejection without record replacement, corrupt-import
non-persistence, pre-existing corruption recovery, whitespace guidance, 44px
mobile legal links, same-origin/no-cookie client flow, keyboard operation, axe
checks, offline reload, and the waiting-worker update lifecycle.

## Verification evidence — 2026-08-28 UTC

Clean local gates:

```text
npm ci                 PASS — 61 packages, 0 vulnerabilities
npm test               PASS — 9/9
npm run typecheck      PASS — strict TypeScript
npm run lint           PASS — strict TypeScript unused/fallthrough checks
npm run build          PASS — dist/index.html emitted
npm run test:e2e       PASS — 17 passed, 5 intentional viewport skips
```

The PWA update test changed the served worker version, observed the in-app
“A fresh version is ready” action, activated it, removed the old cache, and
reloaded. The offline mobile test obtained service-worker control, disabled the
network, reloaded, showed the offline banner, and retained the app. Both were
also repeated twice in isolation. Keyboard-only creation and review reached
send-ready. Axe found zero serious/critical issues on empty, form, data,
privacy, terms, and client-decision screens.

Build budgets:

```text
JS                 44,502 bytes raw / 14.10 KB gzip (budget 200 KB)
CSS                21,734 bytes raw / 5.75 KB gzip (budget 50 KB)
mobile hero        25,958 bytes (budget 300 KB)
desktop hero       47,998 bytes
fonts              0 bytes
```

Three local Lighthouse 12.8.2 mobile runs scored performance 95/99/100,
accessibility 100/100/100, best practices 100/100/100, and SEO 100/100/100.
LCP was 1.6–1.7s, CLS 0, and TBT 250/110/10ms. The fresh production run scored
100 in all four categories with FCP 0.9s, LCP 1.3s, CLS 0, and TBT 70ms.

`verify-url.sh` against production returned HTTPS 200, a 999ms network-idle
load, no console/page errors, title, `lang=en`, one `h1`, `main`, zero missing
image alts, and zero unnamed buttons. Chromium reported no PWA installability
errors. At 390px there was zero horizontal overflow. Reduced motion produced a
0.01ms animation and `scroll-behavior: auto`.

Live workflow tests covered desktop and 390px create/review/send/client decision,
receipt import, malformed input, corrupt backup, recovery, keyboard, axe,
privacy, and offline behavior. One aggregate Chromium process crashed before
the offline case started; the isolated live offline rerun passed 2/2. Anonymous
workflow requests were same-origin, the URL-fragment quote never appeared in a
request, and the app origin set no cookies. Invalid license verification
returned HTTP 200 `{valid:false, reason:"invalid"}` with production-origin CORS.

## Deployment and identity

Azure Static Web Apps deployment ID:
`2431c966-20c4-4a4f-b440-0465c2d63828`.

All 16 public build artifacts were downloaded from their production paths and
matched `dist/` byte-for-byte. Representative SHA-256 values:

```text
index.html                    874d38930d4b3cdf39638f27d23bdcc215b060faf11f0cf3559d1bb069b1ebcd
assets/index-CcnmNfJC.js      da847471ab06e1ce6795aa211eb91a3de451fb63f55fa305d72fe00941564ff7
assets/index-CeIbHTDR.css     6462649af77f326ea97bce42ccb4475ca67623f21c90a761897c25a296407a62
sw.js                         f037cf1e1fe5faefd6f6c02bd4906fa3aa1cb36119dee9984b77250db734b980
manifest.webmanifest          04854a11f23935fe8996f3789303700f6a5e85c7c662ffdb69f94db6c04ff178
```

## Run and deploy

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
/opt/fleet/lib/deploy-static.sh quote-decision-log dist
```

Set `PLAYWRIGHT_BASE_URL=https://quote-decision-log.sociobot.in` to run browser
workflows against production without starting the local preview server.

## Known limits

- Receipt fingerprints are tamper-evident content checks, not identity
  authentication or regulated electronic signatures; the product and terms
  continue to state this explicitly.
- Cross-device receipt return remains manual by design. No package/consumer or
  server concurrency checks apply to this static browser PWA.
- A paid checkout session was opened through to the hosted HTTP 200 page; no
  real card charge was made during release verification.

# Quote Decision — independent verification handoff

## Result: FAIL

Candidate `8972f8af4ac359220981b050c13b98aed58bd425` was independently
verified on 2026-08-28 against
<https://quote-decision-log.sociobot.in>. All 16 fresh production-build files
match the live deployment byte-for-byte, so this is not a stale-deployment
result.

Full continuation evidence is in
[`.factory/verification-1.md`](verification-1.md); the first report remains in
[`.factory/verification.md`](verification.md).

## Release blockers

1. **HIGH — checkout unavailable:** the advertised $19 production checkout
   returns HTTP 404 `{"error":"enabled factory product","status":404}`.
2. **HIGH — consent/decision validation:** a matching-version receipt without
   `consentText` and with changed answer/signer fields is accepted and shown.
3. **HIGH — backup validation:** a quote with `versions: []` imports as
   successful, then the log raises `Cannot read properties of undefined
   (reading 'snapshot')`.

Also open: receipt import needs reload to update the view (medium), whitespace
required data is accepted (medium), mobile legal links are 15 px high (medium),
hashed assets use 30-second revalidation (low), and CSP, Permissions-Policy,
and manifest MIME need hardening (low).

## Verified passes

- Detached clean checkout: `npm ci`, 5/5 unit tests, strict TypeScript/Vite
  build, and Playwright 7 passed / 1 intentional duplicate skip.
- Representative create/review/version/send/client-decision/export/delete,
  expiry/free-limit boundaries, persistence, keyboard, focus, reduced motion,
  and invalid-input recovery.
- PWA installability, service-worker update path, offline reload, and IndexedDB
  persistence.
- Anonymous same-origin/no-cookie behavior, no tracking, and client payloads
  absent from requests.
- Axe serious/critical: 0. Fresh Lighthouse mobile: performance 100/99/99 and
  accessibility/best-practices/SEO 100; LCP 1.13–1.31 s, CLS 0. Bundles pass.

## Reverification

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Then recheck checkout registration, receipt consent validation, deep backup
validation/recovery, immediate receipt-view refresh, 390 px targets, production
headers/caching, and PWA offline/update behavior. Verification changed no
product code.

# Quote Decision — verification handoff

## Result: FAIL

Independent verification on 2026-08-28 tested candidate
`8972f8af4ac359220981b050c13b98aed58bd425` and production
<https://quote-decision-log.sociobot.in>. All 16 built artifacts match production
byte-for-byte, so the result is not caused by a stale deployment.

Full evidence and reproduction details are in
[`.factory/verification.md`](verification.md).

## What passed

- Clean `npm ci`, 5/5 unit tests, strict TypeScript production build, and
  Playwright: 7 passed / 1 intentional project skip.
- Core create/review/version/send/client-decision/export/delete workflow,
  refresh persistence, expiry boundary, five-quote boundary, invalid-field
  handling, keyboard-only operation, and reduced motion.
- PWA installability, controlled offline reload, and an isolated service-worker
  waiting/update/activation cycle.
- Anonymous privacy check: same-origin requests only, no cookies, no tracking;
  client URL fragments were absent from requests.
- Axe serious/critical: 0 on settled representative screens. Lighthouse mobile
  across three runs: performance 92/100/99, accessibility 100, best practices
  100, SEO 100; LCP 1.20–1.28 s, CLS 0. Bundles are within budget.

## Release-blocking findings

1. **HIGH — live checkout unavailable:** the advertised production Sociobot
   checkout returns HTTP 404 `{"error":"enabled factory product","status":404}`.
2. **HIGH — decision consent/integrity validation:** a receipt retaining the
   quote fingerprint but missing `consentText` and containing edited
   decision/signer fields is accepted and replaces the genuine decision.
3. **HIGH — unsafe backup validation:** a quote with an empty versions array is
   imported, after which the dashboard raises `Cannot read properties of
   undefined (reading 'snapshot')`.

Also recorded: valid receipt import needs a reload to appear (medium),
whitespace-only required text is accepted (medium), client legal links are only
15 px high at 390 px (medium), hashed assets have 30-second caching (low), and
CSP/Permissions-Policy plus the manifest MIME need hardening (low).

## Reverification

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Then verify production checkout registration, edited/missing-consent receipt
rejection, deep backup schema validation and recovery, immediate receipt-view
refresh, mobile target sizes, headers, and offline/update behavior. No product
code was changed during this verification; only this handoff and the verification
report were added/updated.

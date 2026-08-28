# Handoff\n\n(written by the worker at the end of each work order)
# Quote Decision — build handoff

## Shipped

- A complete Vite + TypeScript local-first quote workflow: create and version a
  quote, perform the required named review, mark the reviewed version sent,
  accept/decline on a dedicated client page, and download/import a verified
  decision receipt.
- SHA-256 fingerprints preserve the exact commercial snapshot. Editing creates
  a new version, clears send approval, and retains decisions from retired
  versions in visible history.
- IndexedDB persistence plus JSON backup/restore, CSV export, individual receipt
  export, specific delete confirmation, and an explicit invalid-link/storage
  error state.
- Installable offline PWA with 192/512/maskable icons, versioned shell caching,
  dynamic hashed-asset caching, offline navigation fallback, update toast, and
  visible offline status.
- Five-quote free edition and a $19 one-time unlimited unlock using the Sociobot
  checkout/verify contract. Returned licenses are stored under
  `sb_license:quote-decision-log`, stripped from the URL, verified at most daily,
  and restorable by paste. Export, accessibility, existing data, and decision
  safety are not gated.
- Original art-deco transit-poster identity, generated hero art and provenance,
  responsive 390px layout, reduced-motion treatment, standalone privacy and
  terms pages, README, and MIT license.

## Run and verify

```sh
npm install
npm test
npm run build
npm run test:e2e
```

Deployment command: `npm run build`

Deployment root: `dist/` (`dist/index.html` is present)

Verification on 2026-08-28:

- `npm test`: 5/5 unit tests passed.
- `npm run build`: passed. Initial assets: JS 37.76 KB / 12.21 KB gzip,
  CSS 21.33 KB / 5.66 KB gzip, mobile hero 25.96 KB, desktop hero 48.00 KB.
- `npm run test:e2e`: 7 passed, 1 intentionally skipped duplicate. Full
  lifecycle, client receipt download, no page errors, client/empty-state axe
  scans, and license return were exercised on desktop and Pixel 5 profiles.
  Offline navigation was exercised once in the mobile Chromium project.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, title and `lang` present, exactly one
  `h1`, main landmark present, zero missing alt attributes, zero unlabeled
  buttons, and zero console/page errors. Measured load was 738 ms locally.
- Lighthouse 12.8.2, mobile defaults: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.7 s, FCP 0.9 s, CLS 0, TBT 100 ms.

## Product notes

- Quote and decision content never goes to a Quote Decision backend. The client
  URL contains the immutable quote in its fragment, which browsers do not send
  to the host. Anyone who receives the URL can read it, so the UI and privacy
  policy tell users to choose an appropriate sharing channel.
- A remote client returns the downloaded JSON receipt to the agency manually;
  the agency imports it and the app verifies quote ID, version, and fingerprint.
  This is the honest local-first alternative to claiming hosted sync.
- The click-consent receipt is deliberately described as an audit record, not a
  regulated electronic signature.

## Known gaps / next steps

- The factory must register the paid product/price and confirm the production
  return URL in the Sociobot billing engine. No product ID or secret is embedded.
- Cross-device receipt return is manual by design. A future opt-in encrypted sync
  feature could remove that step, but it is outside this local-first v1 brief.
- Real pilot usage is needed to measure the stated 90% review-plus-decision goal.

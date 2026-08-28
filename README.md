# Quote Decision

Quote Decision is a local-first approval checkpoint and client decision trail
for tiny agencies. It keeps a quote’s scope, price, expiry, named internal
review, send status, and client accept/decline receipt together—without an
account or hosted document system.

Live product: <https://quote-decision-log.sociobot.in>

## What it does

- saves quotes and immutable SHA-256 version fingerprints in IndexedDB;
- requires a named reviewer to clear scope, price, and assumptions;
- creates a private client URL containing the reviewed version in the URL
  fragment (the quote is not uploaded by the app);
- records explicit accept/decline consent with a typed name and timestamp;
- downloads and verifies portable JSON decision receipts;
- exports/restores the complete JSON log and exports a CSV overview;
- installs as a PWA and continues working offline after first load;
- provides a useful five-quote free edition and a $19 one-time unlimited
  license through the Sociobot billing API.

Quote Decision does not claim that its click record is a regulated electronic
signature. It is not a payment tool or a quote document editor.

## Develop

Requires Node.js 20 or later.

```sh
npm install
npm run dev
```

The development server prints its local URL. Data is specific to that browser
origin.

## Verify

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

`npm run build` is the deployment command. It creates `dist/` with
`dist/index.html` at its root. End-to-end tests use the factory-pinned
Playwright 1.58.2 Chromium browser and cover desktop, 390px mobile,
accessibility, the complete quote lifecycle, and offline reload.

## Data and privacy

Quotes remain in the browser’s IndexedDB. License tokens and their daily cached
verification result use localStorage. There are no analytics, advertising
trackers, remote fonts, or runtime CDNs. Client links contain the quote in the
URL fragment; anyone with the link can read it, so send it through an
appropriate channel. Use the in-app Data and license screen for export, import,
and deletion.

Decision receipts use schema 2. They include the exact consent text and a
SHA-256 integrity fingerprint over the quote reference, answer, signer,
timestamp, consent, and note. Altered or legacy receipts without this evidence
are rejected; existing decisions in a valid schema-1 full backup remain
restorable for backward compatibility.

See [`public/privacy/index.html`](public/privacy/index.html) and
[`public/terms/index.html`](public/terms/index.html).

## Deployment

Publish the contents of `dist/` to the static host. Configure unknown routes to
fall back to `index.html`; `/privacy/` and `/terms/` are emitted as standalone
pages. The service worker is scoped to `/` and must be served over HTTPS in
production.

## Design and provenance

The product-specific visual system and generated-art provenance are documented
in [`.factory/design.md`](.factory/design.md). Source art is retained in
`assets/src/`; optimized WebP files ship in the app.

## License

MIT. See [LICENSE](LICENSE).

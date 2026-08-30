# Quote Decision — visual system

## Direction and rationale

**Art-deco transit poster, after-hours dispatch desk.** A quote moves through a
small number of consequential stations: draft, internal review, sent, and a
client decision. The interface borrows the confidence and legibility of a
1930s transit control room—parallel rails, stepped corners, stamped status
marks, route numbers—without imitating a historic brand. It feels deliberate
and operational rather than like another document editor. Decoration earns its
place by reinforcing sequence, provenance, and the “stop before you send” job.

This is an explicitly **single-mode, dark painted-paper treatment**. A dark/light
toggle would weaken the poster metaphor and add complexity to a focused
utility. Every surface is painted; the UI does not depend on browser theme.

## Tokens

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Background | `--ink-950` | `#101A1D` | page and installed-app splash |
| Raised surface | `--ink-900` | `#18262A` | work panels |
| Soft surface | `--ink-800` | `#223439` | inputs, secondary zones |
| Main text | `--paper` | `#F4E9CF` | body text (12.5:1 on background) |
| Muted text | `--paper-dim` | `#C9BEA6` | metadata (8.2:1 on background) |
| Brass accent | `--brass` | `#D6A84B` | routes, focus, primary actions |
| Accent contrast | `--brass-ink` | `#171B19` | text on brass |
| Route blue | `--route` | `#5FB2BA` | informational / sent state |
| Success | `--go` | `#76C58B` | accepted / reviewed |
| Warning | `--hold` | `#E1B55A` | expiry / pending |
| Danger | `--stop` | `#FF9B8F` | declined / destructive |
| Rule | `--rule` | `#496066` | borders and rails |

Focus is a 3px brass outline with a 3px dark offset. Status always includes a
label and symbol, never color alone.

## Typography

- Display: `Arial Narrow`, `Aptos Narrow`, `Roboto Condensed`, system sans;
  uppercase, slightly tracked. The condensed station-board voice creates the
  product identity without a font download.
- Body: `Inter`, `Aptos`, `Segoe UI`, system sans; readable at 16px minimum,
  1.55 leading.
- Scale: 14 metadata, 16 body, 20 section, 28 panel title, clamp(36–64) product
  title. Quote numbers and money use tabular figures.
- Long text is capped at 68 characters. Buttons and labels use sentence case;
  only display headlines and small station codes are uppercase.

## Spacing and layout

An 8px base rhythm: `4, 8, 12, 16, 24, 32, 48, 64`. The desktop shell is a
280px dispatch rail plus a flexible work area capped at 1180px. At 760px the
rail becomes a horizontal header, route steps simplify to labels, and forms
become one column. At 390px, secondary descriptions drop, action groups stack,
and every target remains at least 44px.

Panels use clipped/stepped corners, not generic rounded cards. Fine double
rules suggest printed borders. Independent quotes are list rows; forms are
grouped by proximity before lines.

## Interaction grammar

- The workflow is a transit line: current station is a filled medallion,
  completed stations carry a check, and the only primary action advances the
  quote to its next honest state.
- Review is a physical checkpoint: required checklist items and a named
  reviewer unlock “Mark send-ready.” Editing a reviewed quote creates a new
  version and clears the send-ready stamp.
- Client sharing exports an immutable URL payload. Its SHA-256 version digest
  is displayed on both agency and client views. The client’s consent, typed
  name, timestamp, decision, and digest become a portable receipt.
- Feedback appears beside the action and in a polite live region. Destructive
  actions name the quote and require confirmation.

## Motion

Motion is sparse and physical: panels enter 12px from their route origin over
180ms; station indicators fill over 160ms; toasts rise 8px over 180ms. Only
transform and opacity animate. Nothing loops. Under `prefers-reduced-motion`,
all movement becomes an instant opacity change and smooth scrolling is off.

## Asset plan and prompt sheet

One original hero illustration depicts a night dispatch terminal where three
geometric lanes converge at a brass approval gate, then continue to an accepted
ticket. It explains the product’s checkpoint rather than advertising fictional
features. UI icons and PWA marks are hand-authored geometric SVGs.

**Prompt sheet:** “Art-deco transit poster illustration, an abstract midnight
dispatch terminal, three clean rail lines converge through one prominent brass
checkpoint arch and continue toward a small green ticket-shaped destination,
geometric stepped architecture, screen-printed paper grain, flat vector-like
shapes, deep blue-black, warm cream, oxidized teal, muted brass, coral used
sparingly, crisp strong silhouette, no people, no perspective text. No text,
no letters, no numbers, no watermark, no logo, no brand, no gradients, no
photorealism, no extra symbols.”

## Asset provenance

- `src/assets/dispatch-gate.png` and optimized WebP derivatives: generated for
  this product with the factory Azure OpenAI image model (`factory-image`) on
  2026-08-28 from the prompt sheet above. Original, product-specific output;
  reviewed for text artifacts, brands, seams, and misleading UI. Prompt sidecar
  is stored in `assets/src/dispatch-gate.json`.
- `public/icons/icon.svg`, maskable/install PNGs, and UI glyphs: original
  geometric artwork authored in-repository for Quote Decision, MIT with the
  product.

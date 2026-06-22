# marzy-site

Marzy's design system + marketing site. Pure HTML/CSS/JS, no framework, no
build step. Web-native custom elements styled by a single token layer.

## Architecture

Every component is a light-DOM custom element (`<mz-*>`). Pages are written as a
tree of tags:

```html
<mz-card hover>
  <mz-spark></mz-spark>
  <h3>One model for everything</h3>
  <p>Connectors normalize every system into a single ontology.</p>
</mz-card>
```

- One JS file per component in [`/components`](./components/), registered via
  `customElements.define()`. Light DOM, no shadow roots, so the global
  stylesheet keeps applying.
- Variants are attributes: `<mz-btn variant="outline" arrow>`,
  `<mz-section bg="panel">`, `<mz-grid cols="3">`.
- Entry point is [`/components/index.js`](./components/index.js), pages just
  include `<script type="module" src="/components/index.js">`.
- Body stays at `opacity: 0` until components register (no FOUC).

## Design tokens

All color, type, spacing, radius, borders, and motion live in
[`/assets/tokens.css`](./assets/tokens.css) as CSS variables.
[`/assets/styles.css`](./assets/styles.css) only references tokens, change a
value in `tokens.css` and the whole system updates.

Language: ink + a single electric accent (**Volt**, `#1b43ff`); Space Grotesk
display · Inter body · Space Mono labels; light surfaces, crisp hairlines.

## Pages

- `index.html` and the rest of the repo root: the **marketing website** — ~22
  pages assembled entirely from `<mz-*>` components, no page-level custom styles.
  Home, product, pricing, security, about, customers, careers, contact, sign in,
  a blog (index + four posts), changelog, status, a 404, and the legal set
  (privacy, terms, cookies, DPA, sub-processors, acceptable use). Pages live at
  the site root so every link resolves from anywhere; assets and components are
  referenced root-absolute (`/assets/…`, `/components/index.js`).

  Navigation is data-driven: [`/components/site-map.js`](./components/site-map.js)
  is the single source of truth for the nav, footer, and the routes that feature
  components (CTA bands, pricing, hero) link to. Layout primitives — `<mz-stack>`
  (vertical rhythm), `<mz-stat>` (metric), and `<mz-doc>` (long-form document) —
  keep every page token- and component-driven.
- [`gallery.html`](./gallery.html), the design-system gallery: token reference
  (color, type, radius, controls) plus the same components shown across three
  environments — **application** (dashboard sidebar), **authentication**
  (sign in), and **marketing** (hero, cards, CTA).

## Develop locally

```sh
python3 -m http.server 8000
# marketing site:  http://localhost:8000/
# design gallery:  http://localhost:8000/gallery.html
```

## Deploy

```sh
wrangler deploy
```

Cloudflare Worker (Static Assets) defined in
[`wrangler.jsonc`](./wrangler.jsonc); HSTS applied in
[`worker.js`](./worker.js).

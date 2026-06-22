# marzy-site

A reusable design system and the websites built on it. Pure HTML/CSS/JS, no
framework, no build step. Web-native custom elements styled by a single token
layer.

## Layout

```
/
├─ core/                        # the reusable design system (no site knowledge)
│  ├─ components/               # one <mz-*> per file + index.js (registry)
│  │  └─ site-config.js         # reads window.MZ_SITE so chrome is per-site
│  └─ assets/                   # tokens.css · styles.css · favicon · logo
├─ sites/
│  ├─ marzy/                    # the Marzy marketing site
│  │  ├─ *.html
│  │  └─ site.config.js         # this site's nav / footer / brand / routes
│  └─ gallery/                  # the design-system gallery
│     ├─ index.html
│     └─ site.config.js
├─ index.html                   # hub — links to each site
├─ 404.html
└─ wrangler.jsonc · worker.js
```

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

- One JS file per component in [`/core/components`](./core/components/),
  registered via `customElements.define()`. Light DOM, no shadow roots, so the
  global stylesheet keeps applying.
- Variants are attributes: `<mz-btn variant="outline" arrow>`,
  `<mz-section bg="panel">`, `<mz-grid cols="3">`. Layout primitives keep pages
  free of custom styles: `<mz-stack gap>` (vertical rhythm), `<mz-stat>`
  (metric), `<mz-doc>` (long-form document), plus `center`/`align` attributes.
- The component registry is [`/core/components/index.js`](./core/components/index.js).
- Body stays at `opacity: 0` until components register (no FOUC).

## Design tokens

All color, type, spacing, radius, borders, and motion live in
[`/core/assets/tokens.css`](./core/assets/tokens.css) as CSS variables.
[`/core/assets/styles.css`](./core/assets/styles.css) only references tokens —
change a value in `tokens.css` and the whole system updates.

Language: ink + a single electric accent (**Volt**, `#1b43ff`); Space Grotesk
display · Inter body; light surfaces, crisp hairlines.

## Building a site on the system

Each site is a folder under [`/sites`](./sites/) that declares its own chrome
in a `site.config.js` and includes the shared core. The design system itself
knows nothing about any site — `topnav`, `footer`, the CTA bands, pricing, hero,
and trust components all read `window.MZ_SITE`.

1. Create `sites/<name>/site.config.js` setting `window.MZ_SITE` (brand, `nav`,
   `cta`, `footerCols`, `legal`, `routes`, `copyright`).
2. Each page loads the config (classic script) **before** the registry (module):

   ```html
   <link href="../../core/assets/tokens.css" rel="stylesheet" />
   <link href="../../core/assets/styles.css" rel="stylesheet" />
   <script src="site.config.js"></script>
   <script src="../../core/components/index.js" type="module"></script>
   ```

3. Build pages from `<mz-*>` tags. Links between sibling pages are bare
   filenames; core is referenced relatively (`../../core/…`) so everything
   resolves whether served at a domain root or under a project subpath.

Missing a component or need a tweak? Extend the core library — never add
page-level custom styles.

## Sites

- [`/sites/dashboard`](./sites/dashboard/) — a workspace dashboard mockup: the
  app shell (sidebar, status cards, activity feed).
- [`/sites/gallery`](./sites/gallery/) — the design-system gallery: token
  reference plus every component shown across the **application**,
  **authentication**, and **marketing** environments.

## Develop locally

```sh
python3 -m http.server 8000
# hub:            http://localhost:8000/
# dashboard:      http://localhost:8000/sites/dashboard/
# design gallery: http://localhost:8000/sites/gallery/
```

## Deploy

Hosted on **GitHub Pages** (project site, served under `/marzy-site/`) — all
asset and component paths are relative so they resolve under the subpath.

A Cloudflare Worker (Static Assets) is also defined in
[`wrangler.jsonc`](./wrangler.jsonc), with HSTS applied in
[`worker.js`](./worker.js); deploy with `npx wrangler deploy`.

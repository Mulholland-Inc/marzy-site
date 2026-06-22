// Per-site configuration for the shared chrome components (topnav, footer,
// CTA bands, pricing, hero, trust). The design system itself knows nothing
// about any specific site — each site declares its own nav, footer, brand, and
// routes by setting `window.MZ_SITE` in a classic <script> loaded BEFORE the
// component registry (see sites/<name>/site.config.js). Defaults keep every
// component rendering even when a site provides no config.
const C = (typeof window !== "undefined" && window.MZ_SITE) || {};

// Brand wordmark shown next to the spark in the nav/footer.
export const BRAND = C.brand || "Marzy";

// Where the logo points.
export const HOME = C.home || "index.html";

// Primary nav: [[href, label], …]
export const NAV = C.nav || [];

// The persistent call to action: [href, label]
export const CTA = C.cta || ["#", "Get a demo"];

// Footer columns: [[heading, [[href, label], …]], …]
export const FOOTER_COLS = C.footerCols || [];

// One-line tagline under the footer brand.
export const FOOTER_TAGLINE = C.footerTagline || "";

// Thin legal strip: [[href, label], …]
export const LEGAL = C.legal || [];

// Copyright line.
export const COPYRIGHT = C.copyright || "";

// Named routes feature components link to: { demo, contact, signin, trust, … }
export const ROUTES = C.routes || {};

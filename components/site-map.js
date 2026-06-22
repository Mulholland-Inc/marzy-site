// The site's navigation, in one place. Topnav and footer both read from here
// so every page's chrome stays consistent — add a page once and it links
// everywhere. Hrefs are relative filenames; every marketing page is a sibling
// in /site, so they resolve from any page.

// Primary nav (centered links in the floating top bar).
export const NAV = [
  ["product.html", "Product"],
  ["pricing.html", "Pricing"],
  ["security.html", "Security"],
  ["blog.html", "Blog"],
];

// The one persistent call to action.
export const CTA = ["contact.html", "Get a demo"];

// Where the logo points.
export const HOME = "index.html";

// Footer columns (brand sits to their left).
export const FOOTER_COLS = [
  [
    "Product",
    [
      ["product.html", "How it works"],
      ["pricing.html", "Pricing"],
      ["security.html", "Security"],
      ["changelog.html", "Changelog"],
    ],
  ],
  [
    "Company",
    [
      ["about.html", "About"],
      ["customers.html", "Customers"],
      ["careers.html", "Careers"],
      ["contact.html", "Contact"],
    ],
  ],
  [
    "Resources",
    [
      ["blog.html", "Blog"],
      ["status.html", "Status"],
      ["security.html", "Trust portal"],
      ["login.html", "Sign in"],
    ],
  ],
];

// Thin legal strip along the bottom.
export const LEGAL = [
  ["privacy.html", "Privacy"],
  ["terms.html", "Terms"],
  ["cookies.html", "Cookies"],
  ["dpa.html", "DPA"],
  ["subprocessors.html", "Sub-processors"],
  ["acceptable-use.html", "Acceptable use"],
];

// Named routes used by feature components (CTA bands, pricing, hero, trust)
// so no shared component ever ships a dead "#" link.
export const ROUTES = {
  demo: "contact.html",
  contact: "contact.html",
  signin: "login.html",
  trust: "security.html",
  product: "product.html",
  pricing: "pricing.html",
};

// Mulholland is the parent company; Marzy is the product.
export const COPYRIGHT = "© 2026 Mulholland, Inc. All rights reserved.";

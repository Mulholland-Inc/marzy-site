// Marzy marketing site — configuration for the shared chrome components.
// Loaded as a classic script in each page's <head>, before the component
// registry, so window.MZ_SITE is set before topnav/footer/CTA render.
// Pages are flat siblings in this folder, so links are bare filenames.
window.MZ_SITE = {
  brand: "Marzy",
  home: "index.html",
  footerTagline: "The back office, on autopilot.",
  copyright: "© 2026 Mulholland, Inc. All rights reserved.",

  // Primary nav (centered links in the floating top bar).
  nav: [
    ["product.html", "Product"],
    ["pricing.html", "Pricing"],
    ["security.html", "Security"],
    ["blog.html", "Blog"],
  ],

  // The one persistent call to action.
  cta: ["contact.html", "Get a demo"],

  // Footer columns (brand sits to their left).
  footerCols: [
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
  ],

  // Thin legal strip along the bottom.
  legal: [
    ["privacy.html", "Privacy"],
    ["terms.html", "Terms"],
    ["cookies.html", "Cookies"],
    ["dpa.html", "DPA"],
    ["subprocessors.html", "Sub-processors"],
    ["acceptable-use.html", "Acceptable use"],
  ],

  // Named routes feature components (CTA bands, pricing, hero, trust) link to,
  // so no shared component ships a dead "#" link.
  routes: {
    demo: "contact.html",
    contact: "contact.html",
    signin: "login.html",
    trust: "security.html",
    product: "product.html",
    pricing: "pricing.html",
  },
};

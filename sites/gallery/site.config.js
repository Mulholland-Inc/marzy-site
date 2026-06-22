// Design-system gallery — configuration for the chrome components it showcases.
// The gallery is a single page, so its demo nav/footer link into the Marzy
// marketing site (../marzy/…) rather than to dead anchors.
window.MZ_SITE = {
  brand: "Marzy",
  home: "../../index.html", // logo → hub
  footerTagline: "The back office, on autopilot.",
  copyright: "© 2026 Mulholland, Inc. All rights reserved.",
  nav: [
    ["../marzy/product.html", "Product"],
    ["../marzy/pricing.html", "Pricing"],
    ["../marzy/security.html", "Security"],
    ["../marzy/blog.html", "Blog"],
  ],
  cta: ["../marzy/contact.html", "Get a demo"],
  footerCols: [
    [
      "Product",
      [
        ["../marzy/product.html", "How it works"],
        ["../marzy/pricing.html", "Pricing"],
        ["../marzy/security.html", "Security"],
        ["../marzy/changelog.html", "Changelog"],
      ],
    ],
    [
      "Company",
      [
        ["../marzy/about.html", "About"],
        ["../marzy/customers.html", "Customers"],
        ["../marzy/careers.html", "Careers"],
        ["../marzy/contact.html", "Contact"],
      ],
    ],
    [
      "Resources",
      [
        ["../marzy/blog.html", "Blog"],
        ["../marzy/status.html", "Status"],
        ["../marzy/security.html", "Trust portal"],
        ["../marzy/login.html", "Sign in"],
      ],
    ],
  ],
  legal: [
    ["../marzy/privacy.html", "Privacy"],
    ["../marzy/terms.html", "Terms"],
    ["../marzy/cookies.html", "Cookies"],
    ["../marzy/dpa.html", "DPA"],
    ["../marzy/subprocessors.html", "Sub-processors"],
    ["../marzy/acceptable-use.html", "Acceptable use"],
  ],
  routes: {
    demo: "../marzy/contact.html",
    contact: "../marzy/contact.html",
    signin: "../marzy/login.html",
    trust: "../marzy/security.html",
    product: "../marzy/product.html",
    pricing: "../marzy/pricing.html",
  },
};

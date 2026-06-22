// Design-system gallery — configuration for the chrome components it showcases.
// The gallery is a single page, so its demo nav/footer point at the hub and the
// dashboard rather than to dead anchors.
window.MZ_SITE = {
  brand: "Marzy",
  home: "../../index.html", // logo → hub
  footerTagline: "The back office, on autopilot.",
  copyright: "© 2026 Mulholland, Inc. All rights reserved.",
  nav: [
    ["../dashboard/index.html", "Dashboard"],
    ["index.html", "Components"],
    ["../../index.html", "Home"],
  ],
  cta: ["../dashboard/index.html", "Open dashboard"],
  footerCols: [
    [
      "Explore",
      [
        ["../../index.html", "Home"],
        ["../dashboard/index.html", "Dashboard"],
        ["index.html", "Components"],
      ],
    ],
  ],
  legal: [],
  // Feature-component demos (CTA bands, pricing, trust) link here so nothing in
  // the gallery is a dead link.
  routes: {
    demo: "../dashboard/index.html",
    contact: "../dashboard/index.html",
    signin: "../dashboard/index.html",
    trust: "../../index.html",
    product: "../dashboard/index.html",
    pricing: "../../index.html",
  },
};

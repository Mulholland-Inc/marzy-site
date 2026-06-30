// Dashboard site config — read by the shared chrome/auth components via
// window.MZ_SITE. Routes the login screen's links.
window.MZ_SITE = {
  brand: "Marzy",
  home: "index.html",
  // One API origin for the whole fleet; the tenant is an argument the gateway
  // resolves, not a subdomain. Override with ?api=… while the gateway is stood up.
  api: "https://api.marzy.com",
  routes: {
    signin: "login.html",
    contact: "#",
  },
};

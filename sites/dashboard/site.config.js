// Dashboard site config — read by the shared chrome/auth components via
// window.MZ_SITE. Routes the login screen's links.
window.MZ_SITE = {
  brand: "Marzy",
  home: "index.html",
  // One API host for the whole fleet; the tenant is the gateway's path argument
  // (api.marzy.com/<tenant>/…), not a subdomain. `tenant` is the workspace this
  // deployment serves until per-user resolution exists. Override either with
  // ?api=… / ?tenant=… .
  api: "https://api.marzy.com",
  tenant: "mulholland",
  routes: {
    signin: "login.html",
    contact: "#",
  },
};

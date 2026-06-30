// Dashboard site config — read by the shared chrome/auth components via
// window.MZ_SITE. The app lives at the root: / = dashboard, /login = login.
window.MZ_SITE = {
  brand: "Marzy",
  home: "/",
  // One API host for the whole fleet; the tenant is the gateway's path argument
  // (api.marzy.com/<tenant>/…), not a subdomain. `tenant` is the workspace this
  // deployment serves until per-user resolution exists. Override either with
  // ?api=… / ?tenant=… .
  api: "https://api.marzy.com",
  tenant: "mulholland",
  routes: {
    signin: "/login",
    contact: "#",
  },
};

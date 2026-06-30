// Dashboard site config — read by the shared chrome/auth components via
// window.MZ_SITE. The app lives at the root: / = dashboard, /login = login.
window.MZ_SITE = {
  brand: "Marzy",
  home: "/",
  // One API host for the whole fleet; the tenant is the gateway's path argument
  // (api.marzy.com/<tenant>/…), not a subdomain. The active tenant now comes from
  // the WorkOS session (/auth/me); the switcher remembers later choices.
  api: "https://api.marzy.com",
  routes: {
    signin: "/login",
    contact: "#",
  },
};

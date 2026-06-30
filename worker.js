// Marzy site worker — serves the static app and proxies the Firebase sign-in
// handler so Google OAuth runs under marzy.com itself (authDomain = marzy.com →
// same-site popup, no firebaseapp.com in the user's face). No secrets here; the
// Go service holds the OAuth client secret and does every token exchange.

const HSTS = "max-age=31536000; includeSubDomains";
const AUTH_ORIGIN = "https://marzy-agent.firebaseapp.com"; // Firebase project hosting the GIP handler
const API_ORIGIN = "https://api.marzy.com"; // single API; the gateway resolves the tenant

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;

    // Firebase sign-in handler under our own domain (same-site popup).
    if (p.startsWith("/__/")) {
      return fetch(`${AUTH_ORIGIN}${p}${url.search}`, request);
    }

    // OAuth connector callback (Slack/Drive/Gusto/…) → the tenant's API behind the
    // gateway. state is "<nonce>.<tenant>"; the tenant becomes the path argument.
    // Pure routing, no secret here.
    if (p === "/connect/callback") {
      const state = url.searchParams.get("state") || "";
      const tenant = state.slice(state.lastIndexOf(".") + 1);
      if (!tenant || tenant === state) return new Response("missing tenant in state", { status: 400 });
      return Response.redirect(`${API_ORIGIN}/${tenant}/connect/callback${url.search}`, 302);
    }

    // Everyone lands in the app; the dashboard guards to the login screen.
    if (p === "/") {
      return Response.redirect(`${url.origin}/sites/dashboard`, 302);
    }

    const response = await env.ASSETS.fetch(request);
    const res = new Response(response.body, response);
    res.headers.set("Strict-Transport-Security", HSTS);
    return res;
  },
};

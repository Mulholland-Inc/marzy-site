// Marzy site worker (Cloudflare, TypeScript). Serves the static dashboard app.
// Sign-in and account linking (WorkOS + Pipes) are handled by the Go backend at
// api.marzy.com — the worker just serves assets. No secrets here.
//
// SPA fallback: the dashboard is a client-routed single page (/deal/123 etc.).
// Those paths have no asset, so an HTML navigation that 404s is served the app
// shell (index.html) and the client router resolves it. (Asset requests — js/css
// — still 404 normally, so a real missing file isn't masked.)

interface Env {
  ASSETS: Fetcher;
}

const HSTS = "max-age=31536000; includeSubDomains";

function withHsts(res: Response): Response {
  const out = new Response(res.body, res);
  out.headers.set("Strict-Transport-Security", HSTS);
  return out;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const res = await env.ASSETS.fetch(request);
    if (res.status === 404 && request.method === "GET" && (request.headers.get("accept") || "").includes("text/html")) {
      // The dashboard shell is served at "/" (html_handling 307-redirects
      // /index.html → /), so fetch the root for the SPA fallback.
      const shell = await env.ASSETS.fetch(new Request(new URL("/", request.url).toString(), request));
      if (shell.ok) return withHsts(shell);
    }
    return withHsts(res);
  },
};

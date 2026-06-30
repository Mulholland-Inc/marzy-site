// Marzy site worker (Cloudflare, TypeScript). Serves the static dashboard app.
// Sign-in and account linking (WorkOS + Pipes) are handled by the Go backend at
// api.marzy.com — the worker just serves assets. No secrets here.

interface Env {
  ASSETS: Fetcher;
}

const HSTS = "max-age=31536000; includeSubDomains";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    out.headers.set("Strict-Transport-Security", HSTS);
    return out;
  },
};

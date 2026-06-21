// Marzy site — serves static assets via the Workers Static Assets binding,
// with HSTS applied at the edge. No build step; pages are plain HTML.

const HSTS = "max-age=31536000; includeSubDomains";

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const res = new Response(response.body, response);
    res.headers.set("Strict-Transport-Security", HSTS);
    return res;
  },
};

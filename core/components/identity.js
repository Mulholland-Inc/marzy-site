// <mz-identity></mz-identity> — the member's linked identities, two kinds:
// sign-in identities (WorkOS identity linking: GitHub/Google/Microsoft — a
// "link" is a normal sign-in round-trip through the provider, attached to the
// account by verified email) and chat identities (Slack/Discord user ids from
// Pipes, shown read-only; connecting those lives on the Connections tab).
import { api, getUser, loadMe } from "../auth.js";

const API_HOST = (window.MZ_SITE && window.MZ_SITE.api) ||
  (/(localhost|127\.0\.0\.1)/.test(location.hostname) ? "http://localhost:8080" : "https://api.marzy.com");

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// The linkable sign-in providers (WorkOS OAuth slugs → labels).
const PROVIDERS = [
  ["GitHubOAuth", "GitHub"],
  ["GoogleOAuth", "Google"],
  ["MicrosoftOAuth", "Microsoft"],
];

class MzIdentity extends HTMLElement {
  connectedCallback() {
    this.classList.add("identity");
    this.innerHTML = `<div class="identity-body"><mz-empty heading="Loading identities">One moment.</mz-empty></div>`;
    this._body = this.querySelector(".identity-body");
    this._body.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-provider]");
      if (btn) location.assign(`${API_HOST}/auth/link?provider=${encodeURIComponent(btn.dataset.provider)}`);
    });
    this.load();
  }

  async load() {
    try {
      const r = await fetch(`${API_HOST}/auth/identities`, { credentials: "include" });
      this._identities = r.ok ? (await r.json()).identities || [] : [];
    } catch {
      this._identities = [];
    }
    // Chat identities ride the users projection (stamped by the Pipes
    // reconcile); best-effort — a viewer without a users row just sees dashes.
    try {
      const me = getUser() || (await loadMe());
      const rows = me?.email ? await api(`/objects/users?email=${encodeURIComponent(me.email)}`) : [];
      this._chat = rows?.[0] || {};
    } catch {
      this._chat = {};
    }
    this.render();
  }

  render() {
    const linked = new Map((this._identities || []).map((i) => [i.provider, i]));
    const signin = PROVIDERS.map(([slug, name]) => {
      const on = linked.has(slug);
      return `<div class="ios-row">
        <span class="ios-row-label">${esc(name)}</span>
        <span class="ios-row-value">${on ? "Linked" : `<button type="button" class="btn btn-primary btn-sm" data-provider="${slug}">Link</button>`}</span>
      </div>`;
    }).join("");
    const chatRow = (label, v) =>
      `<div class="ios-row"><span class="ios-row-label">${label}</span><span class="ios-row-value">${v ? "Linked" : "—"}</span></div>`;
    this._body.innerHTML = `
      <div class="pane-head"><span class="pane-eyebrow t-caption">Sign-in identities</span></div>
      <p class="t-meta">Link a provider to sign in with it. Linking is a quick sign-in round-trip; the identity attaches to your account by verified email.</p>
      <div class="ios-rows">${signin}</div>
      <div class="pane-head"><span class="pane-eyebrow t-caption">Chat identities</span></div>
      <p class="t-meta">Recognized by the workspace bot. Connect Slack or Discord on the Connections tab.</p>
      <div class="ios-rows">
        ${chatRow("Slack", this._chat?.slack_id)}
        ${chatRow("Discord", this._chat?.discord_id)}
      </div>`;
  }
}
customElements.define("mz-identity", MzIdentity);

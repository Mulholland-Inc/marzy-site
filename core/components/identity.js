// <mz-identity></mz-identity> — the accounts you can link to your workspace
// identity (WorkOS identity linking). "Link" is a quick sign-in round-trip
// through the provider; WorkOS attaches the credential to your account by
// verified email. Linking GitHub/Slack also lets the workspace map your
// activity there (issue assignment, chat recognition) to you.
import { getUser, loadMe } from "../auth.js";

const API_HOST = (window.MZ_SITE && window.MZ_SITE.api) ||
  (/(localhost|127\.0\.0\.1)/.test(location.hostname) ? "http://localhost:8080" : "https://api.marzy.com");

const LOGO = (domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;
const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Linkable providers: WorkOS OAuth slug, label, brand domain, why-line.
const PROVIDERS = [
  ["GitHubOAuth", "GitHub", "github.com", "Maps issues and PRs to you"],
  ["SlackOAuth", "Slack", "slack.com", "Lets the assistant recognize you in Slack"],
  ["GoogleOAuth", "Google", "google.com", "Sign in with Google"],
  ["MicrosoftOAuth", "Microsoft", "microsoft.com", "Sign in with Microsoft"],
];

class MzIdentity extends HTMLElement {
  connectedCallback() {
    this.classList.add("identity", "cnx");
    this.innerHTML = `<div class="identity-body cnx-sections"><mz-empty heading="Loading identities">One moment.</mz-empty></div>`;
    this._body = this.querySelector(".identity-body");
    this._body.addEventListener("click", (e) => {
      const link = e.target.closest("[data-provider]");
      if (link) location.assign(`${API_HOST}/auth/link?provider=${encodeURIComponent(link.dataset.provider)}`);
    });
    this._onFocus = () => this.load();
    window.addEventListener("focus", this._onFocus);
    this.load();
  }

  disconnectedCallback() {
    window.removeEventListener("focus", this._onFocus);
  }

  async load() {
    try {
      const r = await fetch(`${API_HOST}/auth/identities`, { credentials: "include" });
      this._identities = r.ok ? (await r.json()).identities || [] : [];
    } catch {
      this._identities = [];
    }
    // Make sure the session is resolved so /auth/identities has one.
    if (!getUser()) await loadMe();
    this.render();
  }

  render() {
    const linked = new Set((this._identities || []).map((i) => i.provider));
    const rows = PROVIDERS.map(([slug, name, domain, blurb]) => {
      const on = linked.has(slug);
      return `<div class="cnx-row${on ? " is-connected" : ""}">
        <img class="cnx-logo" src="${LOGO(domain)}" alt="" loading="lazy" />
        <div class="cnx-main">
          <div class="cnx-name">${esc(name)}</div>
          <div class="cnx-desc t-meta">${esc(blurb)} · ${on ? "Linked" : "Not linked"}</div>
        </div>
        ${on ? `<span class="t-meta">Linked</span>`
             : `<button type="button" class="btn btn-primary btn-sm" data-provider="${slug}">Link</button>`}
      </div>`;
    }).join("");
    this._body.innerHTML = `<section class="cnx-cat-sec"><div class="cnx-list">${rows}</div></section>`;
  }
}
customElements.define("mz-identity", MzIdentity);

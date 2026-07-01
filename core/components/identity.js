// <mz-identity></mz-identity> — every account linked to you, in one place:
//
// - Sign-in identities (WorkOS identity linking): GitHub, Google, Microsoft.
//   "Link" is a quick sign-in round-trip through the provider; WorkOS attaches
//   the credential to your account by verified email. Linking GitHub also lets
//   the workspace map your GitHub activity (issue assignment) to you.
// - Chat accounts (WorkOS Pipes): Slack and Discord. Connecting lets the
//   workspace bot recognize you and mention you.
import { api, getUser, loadMe } from "../auth.js";

const API_HOST = (window.MZ_SITE && window.MZ_SITE.api) ||
  (/(localhost|127\.0\.0\.1)/.test(location.hostname) ? "http://localhost:8080" : "https://api.marzy.com");

const LOGO = (domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;
const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// The linkable sign-in providers: WorkOS OAuth slug, label, brand domain, why.
const SIGNIN = [
  ["GitHubOAuth", "GitHub", "github.com", "Sign in with GitHub; maps issues and PRs to you"],
  ["GoogleOAuth", "Google", "google.com", "Sign in with Google"],
  ["MicrosoftOAuth", "Microsoft", "microsoft.com", "Sign in with Microsoft"],
];

// The chat accounts, connected through Pipes (same flow as the Connections tab).
const CHAT = [
  ["slack-user", "Slack", "slack.com", "slack_id", "Lets the workspace bot recognize you in Slack"],
  ["discord", "Discord", "discord.com", "discord_id", "Lets notifications mention you on Discord"],
];

class MzIdentity extends HTMLElement {
  connectedCallback() {
    this.classList.add("identity", "cnx");
    this.innerHTML = `<div class="identity-body cnx-sections"><mz-empty heading="Loading identities">One moment.</mz-empty></div>`;
    this._body = this.querySelector(".identity-body");
    this._body.addEventListener("click", (e) => {
      const link = e.target.closest("[data-provider]");
      if (link) {
        location.assign(`${API_HOST}/auth/link?provider=${encodeURIComponent(link.dataset.provider)}`);
        return;
      }
      const pipe = e.target.closest("[data-pipe]");
      if (pipe) this.connectPipe(pipe.dataset.pipe);
    });
    // Connecting happens in a new tab; re-check when the member returns.
    this._onFocus = () => this.load();
    window.addEventListener("focus", this._onFocus);
    this.load();
  }

  disconnectedCallback() {
    window.removeEventListener("focus", this._onFocus);
  }

  async connectPipe(slug) {
    try {
      const { url } = await api(`/pipes/connect?provider=${encodeURIComponent(slug)}`, { method: "POST" });
      if (url) window.open(url, "_blank", "noopener");
    } catch (err) {
      console.error("connect", slug, err);
    }
  }

  async load() {
    try {
      const r = await fetch(`${API_HOST}/auth/identities`, { credentials: "include" });
      this._identities = r.ok ? (await r.json()).identities || [] : [];
    } catch {
      this._identities = [];
    }
    // Chat ids ride the users projection (stamped by the identity reconcile).
    try {
      const me = getUser() || (await loadMe());
      const rows = me?.email ? await api(`/objects/users?email=${encodeURIComponent(me.email)}`) : [];
      this._me = rows?.[0] || {};
    } catch {
      this._me = {};
    }
    this.render();
  }

  render() {
    const row = (icon, name, blurb, linked, btn) => `<div class="cnx-row${linked ? " is-connected" : ""}">
        <img class="cnx-logo" src="${LOGO(icon)}" alt="" loading="lazy" />
        <div class="cnx-main">
          <div class="cnx-name">${esc(name)}</div>
          <div class="cnx-desc t-meta">${esc(blurb)} · ${linked ? "Linked" : "Not linked"}</div>
        </div>
        ${linked ? `<span class="t-meta">Linked</span>` : btn}
      </div>`;

    const linked = new Set((this._identities || []).map((i) => i.provider));
    const signin = SIGNIN.map(([slug, name, domain, blurb]) =>
      row(domain, name, blurb, linked.has(slug),
        `<button type="button" class="btn btn-primary btn-sm" data-provider="${slug}">Link</button>`)
    ).join("");
    const chat = CHAT.map(([slug, name, domain, field, blurb]) =>
      row(domain, name, blurb, !!this._me?.[field],
        `<button type="button" class="btn btn-primary btn-sm" data-pipe="${slug}">Connect</button>`)
    ).join("");

    this._body.innerHTML = `
      <section class="cnx-cat-sec">
        <h2 class="cnx-cat t-caption">Sign-in identities</h2>
        <p class="t-meta">Ways to sign in to this workspace. Linking is a quick round-trip through the provider; the account attaches by your verified email.</p>
        <div class="cnx-list">${signin}</div>
      </section>
      <section class="cnx-cat-sec">
        <h2 class="cnx-cat t-caption">Chat accounts</h2>
        <p class="t-meta">So the workspace assistant knows who you are in chat.</p>
        <div class="cnx-list">${chat}</div>
      </section>`;
  }
}
customElements.define("mz-identity", MzIdentity);

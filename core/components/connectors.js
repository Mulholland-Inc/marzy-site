// <mz-connectors></mz-connectors>, the integrations directory backed by WorkOS
// Pipes. It lists the providers configured for the workspace with this member's
// connection state (GET /pipes/providers) and a Connect/Reconnect button that
// opens the WorkOS OAuth flow in a new tab (POST /pipes/connect → { url }).
// Linking, token refresh and disconnect all live in WorkOS; we just show state
// and hand off the authorize URL, then re-check when the member returns.
import { icon } from "./icons.js";
import { api, activeTenant } from "../auth.js";

const API_HOST = (window.MZ_SITE && window.MZ_SITE.api) ||
  (/(localhost|127\.0\.0\.1)/.test(location.hostname) ? "http://localhost:8080" : "https://api.marzy.com");

// Full-colour brand logos via DuckDuckGo's favicon service; letter fallback.
const LOGO = (domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;
const mono = (n) => n.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase();
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Best-effort brand domain for a provider's logo (slug first, then name); the
// letter fallback covers anything not listed.
const DOMAINS = {
  gusto: "gusto.com",
  linkedin: "linkedin.com",
  slack: "slack.com",
  "slack-user": "slack.com",
  discord: "discord.com",
  "google-drive": "drive.google.com",
  gmail: "gmail.com",
  "google-calendar": "calendar.google.com",
};
const domainFor = (slug, name) => DOMAINS[slug] || `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;

const LABEL = { connected: "Reconnect", needs_reauthorization: "Reconnect", not_connected: "Connect" };
const STATUS = {
  connected: "Connected",
  needs_reauthorization: "Needs reauthorization",
  not_connected: "Not connected",
};

class MzConnectors extends HTMLElement {
  connectedCallback() {
    this.classList.add("cnx");
    this._q = "";
    this._items = [];
    // mode="workspace" → the company-level integrations (Integrations tab);
    // default → the member's own data sources (Connections tab).
    this._workspace = this.getAttribute("mode") === "workspace";

    this.innerHTML = this._workspace
      ? `<div class="cnx-sections"></div>`
      : `
      <div class="cnx-toolbar">
        <div class="search cnx-search">
          ${icon("search")}
          <input type="search" class="search-input" placeholder="Search connectors" aria-label="Search connectors" />
        </div>
      </div>
      <div class="cnx-sections"></div>`;

    this._sections = this.querySelector(".cnx-sections");

    this.querySelector(".search-input")?.addEventListener("input", (e) => {
      this._q = e.target.value;
      this.render();
    });
    this._sections.addEventListener("click", (e) => {
      const ws = e.target.closest("[data-ws]");
      if (ws) {
        if (ws.dataset.ws === "github" && this._github?.install_url) {
          window.open(this._github.install_url, "_blank", "noopener");
        } else if (ws.dataset.ws === "slack") {
          window.open(`${API_HOST}/auth/slack/install?tenant=${encodeURIComponent(activeTenant())}`, "_blank", "noopener");
        } else if (ws.dataset.ws === "discord") {
          window.open(`${API_HOST}/auth/discord/install?tenant=${encodeURIComponent(activeTenant())}`, "_blank", "noopener");
        }
        return;
      }
      const btn = e.target.closest("[data-slug]");
      if (btn) this.connect(btn.dataset.slug);
    });

    // Connecting happens in a new tab; re-check state when the member returns.
    this._onFocus = () => this.load();
    window.addEventListener("focus", this._onFocus);

    this.render(); // loading state
    this.load();
  }

  disconnectedCallback() {
    window.removeEventListener("focus", this._onFocus);
  }

  async load() {
    if (this._workspace) {
      // The company-level integrations: the shared GitHub App (installing it
      // on the org IS the link), the shared Slack app ("Add to Slack"), and
      // the Discord server link.
      this._github = await api("/github").catch(() => null);
      this._slack = await api("/secrets").catch(() => null); // admin-only; null hides state
      this._discord = await fetch(`${API_HOST}/auth/discord/status?tenant=${encodeURIComponent(activeTenant())}`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      this._error = null;
    } else {
      try {
        const { providers } = await api("/pipes/providers");
        this._items = providers || [];
        this._error = null;
      } catch (err) {
        this._error = err;
      }
    }
    this._loaded = true;
    this.render();
  }

  async connect(slug) {
    try {
      const { url } = await api(`/pipes/connect?provider=${encodeURIComponent(slug)}`, { method: "POST" });
      if (url) window.open(url, "_blank", "noopener");
    } catch (err) {
      console.error("connect", slug, err); // focus refresh re-reads state on return
    }
  }

  render() {
    if (!this._loaded) {
      this._sections.innerHTML = `<mz-empty heading="Loading connectors">One moment.</mz-empty>`;
      return;
    }
    if (this._error) {
      this._sections.innerHTML = `<mz-empty heading="Couldn't load connectors">Try again in a moment.</mz-empty>`;
      return;
    }

    if (this._workspace) {
      this.renderWorkspace();
      return;
    }
    const term = this._q.trim().toLowerCase();
    const match = (it) => !term || `${it.name} ${it.slug} ${it.type || ""}`.toLowerCase().includes(term);
    // slack-user/discord are identity-only providers (bot recognition, not
    // data) — they live on the Identity tab, listing them here reads as three
    // different Slacks/Discords.
    const IDENTITY_ONLY = new Set(["slack-user", "discord"]);
    const items = this._items.filter((it) => !IDENTITY_ONLY.has(it.slug)).filter(match);

    if (!items.length) {
      this._sections.innerHTML = this._items.length
        ? `<mz-empty heading="No connectors found">Try a different search.</mz-empty>`
        : `<mz-empty heading="No connectors yet">Connectors appear here once they're configured for the workspace.</mz-empty>`;
      return;
    }

    const row = (it) => {
      const state = it.state || "not_connected";
      const on = !!it.connected;
      const label = LABEL[state] || "Connect";
      const domain = domainFor(it.slug, it.name);
      return `<div class="cnx-row${on ? " is-connected" : ""}">
        <img class="cnx-logo" src="${LOGO(domain)}" alt="" loading="lazy"
          onerror="this.outerHTML='<span class=&quot;cnx-logo cnx-mono&quot;>${mono(it.name)}</span>'" />
        <div class="cnx-main">
          <div class="cnx-name">${esc(it.name)}</div>
          <div class="cnx-desc t-meta">${esc(STATUS[state] || state)}</div>
        </div>
        <button type="button" class="btn ${on ? "btn-ghost" : "btn-primary"} btn-sm" data-slug="${esc(it.slug)}">${label}</button>
      </div>`;
    };

    const memberHead = `<p class="t-meta">Data sources you connect as yourself, used by the assistant on your behalf. Company-level integrations live on the Integrations tab; sign-in identities on the Identity tab.</p>`;
    this._sections.innerHTML = `<section class="cnx-cat-sec">${memberHead}<div class="cnx-list">${items.map(row).join("")}</div></section>`;
  }

  // renderWorkspace draws the company-level integrations: one per workspace,
  // admin-installed, each with a plain line about what connecting does.
  renderWorkspace() {
    const wsRow = (key, name, domain, blurb, status, cta, ready) => `<div class="cnx-row${status.startsWith("Connected") ? " is-connected" : ""}">
        <img class="cnx-logo" src="${LOGO(domain)}" alt="" loading="lazy"
          onerror="this.outerHTML='<span class=&quot;cnx-logo cnx-mono&quot;>${mono(name)}</span>'" />
        <div class="cnx-main">
          <div class="cnx-name">${esc(name)}</div>
          <div class="cnx-desc t-meta">${esc(blurb)} · ${esc(status)}</div>
        </div>
        <button type="button" class="btn ${status.startsWith("Connected") ? "btn-ghost" : "btn-primary"} btn-sm" data-ws="${key}"${ready ? "" : " disabled"}>${esc(cta)}</button>
      </div>`;
    const workspace = [];
    const botSet = (this._slack?.secrets || []).some((x) => x.key === "slack_bot_token" && x.set);
    workspace.push(wsRow("slack", "Slack", "slack.com",
      "The workspace assistant in your Slack — mention or DM it",
      botSet ? "Connected" : "Not connected", botSet ? "Reinstall" : "Add to Slack", true));
    if (this._github?.configured) {
      const gh = this._github;
      workspace.push(wsRow("github", "GitHub", "github.com",
        "Pull requests and issues drive the task board",
        gh.installed ? `Connected — ${gh.org}` : "Not connected",
        gh.installed ? "Reinstall" : "Install", !!gh.install_url));
    }
    if (this._discord?.configured) {
      workspace.push(wsRow("discord", "Discord", "discord.com",
        "Slash commands in your server (try /tasks)",
        this._discord.linked ? "Connected" : "Not connected",
        this._discord.linked ? "Reconnect" : "Connect server", true));
    }
    this._sections.innerHTML = `<section class="cnx-cat-sec">
      <p class="t-meta">Company-level services, connected once for the whole workspace by an admin.</p>
      <div class="cnx-list">${workspace.join("")}</div></section>`;
  }
}
customElements.define("mz-connectors", MzConnectors);

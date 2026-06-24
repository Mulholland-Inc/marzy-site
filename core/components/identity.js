// <mz-identity></mz-identity> — link your accounts on external platforms via
// OIDC so Marzy can verify who it's talking to (e.g. when you message it on
// Slack). Each row shows the platform, the verified handle once linked, and a
// Link / Unlink action. Self-contained sample state.
import { icon } from "./icons.js";

// Full-colour brand logos via DuckDuckGo's favicon service; letter fallback.
const LOGO = (domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;
const mono = (n) => n.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase();
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// [name, domain, linked handle (or null), the handle you'd verify as]
const PLATFORMS = [
  ["Slack", "slack.com", "@marijn", "@marijn"],
  ["Discord", "discord.com", null, "marijn"],
  ["Google", "google.com", "marijn@mulholland.inc", "marijn@mulholland.inc"],
  ["Microsoft", "microsoft.com", null, "marijn@mulholland.inc"],
  ["GitHub", "github.com", "ietsnut", "ietsnut"],
  ["Apple", "apple.com", null, "marijn@icloud.com"],
];

class MzIdentity extends HTMLElement {
  connectedCallback() {
    this.classList.add("identity");
    this._accounts = PLATFORMS.map(([name, domain, handle, as]) => ({ name, domain, handle, as }));

    this.innerHTML = `
      <p class="identity-lead">Link your accounts on the platforms where you message Marzy. We verify it's really you with OIDC, so Marzy knows who it's talking to and can trust requests from you there.</p>
      <div class="identity-list"></div>`;

    this._list = this.querySelector(".identity-list");
    this._list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const a = this._accounts[Number(btn.dataset.i)];
      // mock OIDC: linking verifies you as your handle; unlinking clears it
      a.handle = btn.dataset.act === "link" ? a.as : null;
      this.render();
    });

    this.render();
  }

  render() {
    this._list.innerHTML = this._accounts
      .map((a, i) => {
        const linked = !!a.handle;
        const sub = linked
          ? `${esc(a.handle)} · <span class="idn-verified">verified via OIDC</span>`
          : "Not linked";
        return `<div class="idn-row">
          <img class="idn-logo" src="${LOGO(a.domain)}" alt="" loading="lazy"
            onerror="this.outerHTML='<span class=&quot;idn-logo idn-mono&quot;>${mono(a.name)}</span>'" />
          <div class="idn-main">
            <div class="idn-name">${a.name}</div>
            <div class="idn-sub t-meta">${sub}</div>
          </div>
          <button type="button" class="btn ${linked ? "btn-ghost" : "btn-primary"} btn-sm" data-i="${i}" data-act="${linked ? "unlink" : "link"}">${linked ? "Unlink" : "Link account"}</button>
        </div>`;
      })
      .join("");
  }
}
customElements.define("mz-identity", MzIdentity);

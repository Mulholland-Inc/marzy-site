// <mz-identity></mz-identity> — "Connected accounts": link your accounts on
// external platforms via OIDC so Marzy can verify who it's talking to (e.g.
// when you message it on Slack). A section header + a card of provider rows,
// each showing connection status and a Connect / Disconnect action.
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
      <header class="idn-head">
        <h2 class="idn-title">Connected accounts</h2>
        <p class="idn-desc">Link the platforms where you message Marzy. We verify it's really you with OIDC, so Marzy knows who it's talking to.</p>
      </header>
      <div class="idn-card"></div>`;

    this._card = this.querySelector(".idn-card");
    this._card.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const a = this._accounts[Number(btn.dataset.i)];
      a.handle = btn.dataset.act === "link" ? a.as : null;
      this.render();
    });

    this.render();
  }

  render() {
    this._card.innerHTML = this._accounts
      .map((a, i) => {
        const linked = !!a.handle;
        return `<div class="idn-row">
          <img class="idn-logo" src="${LOGO(a.domain)}" alt="" loading="lazy"
            onerror="this.outerHTML='<span class=&quot;idn-logo idn-mono&quot;>${mono(a.name)}</span>'" />
          <div class="idn-info">
            <div class="idn-name">${esc(a.name)}</div>
            <div class="idn-status t-meta">${linked ? `Connected as ${esc(a.handle)}` : "Not connected"}</div>
          </div>
          <div class="idn-actions">
            ${linked ? `<span class="idn-verified">${icon("circle-check")}Verified</span>` : ""}
            <button type="button" class="btn ${linked ? "btn-ghost" : "btn-primary"} btn-sm idn-btn" data-i="${i}" data-act="${linked ? "unlink" : "link"}">${linked ? "Disconnect" : "Connect"}</button>
          </div>
        </div>`;
      })
      .join("");
  }
}
customElements.define("mz-identity", MzIdentity);

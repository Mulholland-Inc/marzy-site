// <mz-workspace></mz-workspace>, a Slack-style tenant switcher for the top of the
// app sidebar: shows the active tenant + signed-in user, and a dropdown to switch
// tenants. Switching re-auths into that tenant's WorkOS organization (see core/auth.js).
import { icon } from "./icons.js";
import { popIn, popOut } from "./motion.js";
import { loadTenants, onUser, getUser, activeTenant, switchTo, signOutUser, api } from "../auth.js";

const CHEVRON = icon("chevron-down");
const CHECK = icon("check");
const SIGNOUT = icon("log-out");

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzWorkspace extends HTMLElement {
  connectedCallback() {
    this.classList.add("ws");
    this._tenants = [];
    this._email = (getUser() && getUser().email) || "";
    this.render();

    loadTenants().then((ts) => { this._tenants = ts || []; this.render(); });
    this._off = onUser((u) => { this._email = (u && u.email) || ""; this.render(); });

    this._onDoc = (e) => { if (!this.contains(e.target)) this.close(); };
    this._onKey = (e) => { if (e.key === "Escape") this.close(); };
    document.addEventListener("click", this._onDoc);
    document.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback() {
    if (this._off) this._off();
    document.removeEventListener("click", this._onDoc);
    document.removeEventListener("keydown", this._onKey);
  }

  current() {
    const active = activeTenant();
    return this._tenants.find((t) => t.tenant === active) || { name: active || "Marzy", tenant: active };
  }

  render() {
    const active = activeTenant();
    const cur = this.current();
    const label = cur.name || "Marzy";
    this.innerHTML = `
      <button type="button" class="ws-btn" aria-haspopup="true" aria-expanded="false">
        <span class="ws-av">${esc((label.charAt(0) || "M").toUpperCase())}</span>
        <span class="ws-meta"><b>${esc(label)}</b><span>${esc(this._email)}</span></span>
        <span class="ws-caret" aria-hidden="true">${CHEVRON}</span>
      </button>
      <div class="ws-menu" hidden role="menu">
        ${this._tenants
          .map((t) => {
            const on = t.tenant === active;
            return `<button type="button" class="ws-item${on ? " is-active" : ""}" data-tenant="${esc(t.tenant)}" data-tid="${esc(t.tenantId || "")}" role="menuitemradio" aria-checked="${on}">
              <span class="ws-av">${esc((t.name.charAt(0) || "?").toUpperCase())}</span>
              <span class="ws-item-meta"><b>${esc(t.name)}</b><span class="t-caption">${esc(t.tenant)}</span></span>
              ${on ? `<span class="ws-check" aria-hidden="true">${CHECK}</span>` : ""}
            </button>`;
          })
          .join("")}
        <div class="ws-menu-div"></div>
        <button type="button" class="ws-action" data-act="context"><span class="ws-action-ico" aria-hidden="true">${icon("sliders-horizontal")}</span>Your assistant context</button>
        <button type="button" class="ws-action" data-act="signout"><span class="ws-action-ico" aria-hidden="true">${SIGNOUT}</span>Sign out</button>
      </div>`;

    this._btn = this.querySelector(".ws-btn");
    this._menu = this.querySelector(".ws-menu");
    this._btn.addEventListener("click", () => this.toggle());
    this._menu.addEventListener("click", (e) => {
      const item = e.target.closest(".ws-item");
      if (item) { switchTo(item.dataset.tenant); return; }
      if (e.target.closest('[data-act="context"]')) { this.close(); this.openContext(); return; }
      if (e.target.closest('[data-act="signout"]')) { signOutUser(); return; }
    });
  }

  // A focused overlay to edit the signed-in member's personal assistant context
  // (PUT /prompts/user) — private to them, appended to the agent's prompt.
  async openContext() {
    const prompts = await api("/prompts").catch(() => ({}));
    const ov = document.createElement("div");
    ov.className = "ctx-overlay";
    ov.innerHTML = `<div class="ctx-card" role="dialog" aria-modal="true" aria-label="Your assistant context">
        <h3>Your assistant context</h3>
        <p class="t-meta">Personal notes the assistant uses when it helps you — your role, preferences, anything it should know. Only you see this.</p>
        <textarea class="input ctx-input" rows="6" placeholder="e.g. I'm in finance; default to numbers-first answers and flag anything over $10k.">${esc(prompts.user || "")}</textarea>
        <div class="ctx-bar"><span class="ctx-status t-meta" role="status"></span><button type="button" class="btn btn-ghost btn-sm" data-ctx="close">Close</button><button type="button" class="btn btn-primary btn-sm" data-ctx="save">Save</button></div>
      </div>`;
    document.body.appendChild(ov);
    const close = () => ov.remove();
    ov.addEventListener("click", (e) => {
      if (e.target === ov || e.target.closest('[data-ctx="close"]')) return close();
      if (e.target.closest('[data-ctx="save"]')) {
        const status = ov.querySelector(".ctx-status");
        status.textContent = "Saving…";
        api("/prompts/user", { method: "PUT", body: { body: ov.querySelector(".ctx-input").value } })
          .then(close)
          .catch(() => (status.textContent = "Couldn’t save."));
      }
    });
  }

  toggle() { this._menu.hidden ? this.open() : this.close(); }
  open() { this._menu.hidden = false; this._btn.setAttribute("aria-expanded", "true"); popIn(this._menu); }
  close() {
    if (!this._menu || this._menu.hidden) return;
    this._btn.setAttribute("aria-expanded", "false");
    popOut(this._menu).then(() => { if (this._menu) this._menu.hidden = true; });
  }
}
customElements.define("mz-workspace", MzWorkspace);

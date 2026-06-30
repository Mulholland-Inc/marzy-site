// <mz-roles></mz-roles> — the workspace's roles, read from WorkOS (GET /roles).
// A role rail on the left; the selected role's object access on the right. Roles
// are WorkOS environment/organization roles — created and edited in WorkOS, not
// here — so this view is read-only. Assignment happens on the Users page.
import { api } from "../auth.js";
import * as catalog from "../catalog.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Map a set of SQL privileges to a coarse access level.
const level = (privs) => {
  const p = privs || [];
  if (p.includes("DELETE") || p.includes("UPDATE") || p.includes("INSERT")) return "Edit";
  if (p.includes("SELECT")) return "Read";
  return "None";
};
const levelBadge = { Edit: "ok", Read: "neutral", None: "muted" };

class MzRoles extends HTMLElement {
  connectedCallback() {
    this.classList.add("roles");
    this._roles = [];
    this._i = 0;
    this.innerHTML = `
      <div class="roles-head">
        <div class="roles-tabs" role="tablist"></div>
        <span class="t-meta roles-note">Roles are managed in WorkOS</span>
      </div>
      <div class="roles-config"></div>`;
    this._tabs = this.querySelector(".roles-tabs");
    this._cfg = this.querySelector(".roles-config");
    this._tabs.addEventListener("click", (e) => {
      const item = e.target.closest(".tab");
      if (!item) return;
      this._i = Number(item.dataset.i);
      this.renderTabs();
      this.renderConfig();
    });
    this.load();
  }

  async load() {
    try {
      const { roles } = await api("/roles");
      this._roles = roles || [];
      this._error = false;
    } catch {
      this._error = true;
    }
    this.renderTabs();
    this.renderConfig();
  }

  role() {
    return this._roles[this._i];
  }

  renderTabs() {
    this._tabs.innerHTML = this._roles
      .map((r, i) => `<button type="button" class="tab${i === this._i ? " is-active" : ""}" data-i="${i}">${esc(r.name)}</button>`)
      .join("");
  }

  renderConfig() {
    const r = this.role();
    if (!r) {
      this._cfg.innerHTML = `<mz-empty heading="${this._error ? "Couldn’t load roles" : "No roles"}">${this._error ? "Try again in a moment." : "Roles appear here once configured in WorkOS."}</mz-empty>`;
      return;
    }
    const objTypes = new Set([...catalog.types().map((t) => t.name), ...catalog.domainInterfaces().map((i) => i.name)]);
    const access = Object.entries(r.access || {})
      .filter(([k]) => objTypes.has(k))
      .sort((a, b) => a[0].localeCompare(b[0]));
    this._cfg.innerHTML = `
      <div class="roles-meta">
        <h3>${esc(r.name)}</h3>
        <p class="t-meta">${esc(r.description || "")}</p>
      </div>
      <div class="roles-access">
        <h4 class="t-caption">Object access</h4>
        <div class="table-card"><div class="table-scroll"><table class="table">
          <thead><tr><th>Object</th><th>Access</th></tr></thead>
          <tbody>${
            access.length
              ? access
                  .map(([obj, privs]) => {
                    const l = level(privs);
                    return `<tr><td>${esc(catalog.label(obj))}</td><td><span class="badge badge-${levelBadge[l]}">${l}</span></td></tr>`;
                  })
                  .join("")
              : `<tr><td colspan="2" class="table-empty">No object grants for this role.</td></tr>`
          }</tbody>
        </table></div></div>
      </div>`;
  }
}
customElements.define("mz-roles", MzRoles);

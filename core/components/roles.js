// <mz-roles></mz-roles> — the workspace's roles, read from WorkOS (GET /roles).
// A role rail on the left; the selected role's per-object access on the right, in
// the familiar None/Read/Edit layout. Roles are WorkOS environment/organization
// roles — created and edited in WorkOS, not here — so this view is read-only, and
// assignment happens on the Users page.
import { api } from "../auth.js";
import * as catalog from "../catalog.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const LEVELS = ["None", "Read", "Edit"];
// Map a set of SQL privileges to a coarse access level.
const level = (privs) => {
  const p = privs || [];
  if (p.includes("DELETE") || p.includes("UPDATE") || p.includes("INSERT")) return "Edit";
  if (p.includes("SELECT")) return "Read";
  return "None";
};

class MzRoles extends HTMLElement {
  connectedCallback() {
    this.classList.add("roles");
    this._roles = [];
    this._i = 0;
    this.innerHTML = `
      <div class="roles-head">
        <div class="roles-tabs" role="tablist"></div>
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

  // The object types whose access a role can hold (concrete types + interfaces),
  // in a stable order.
  objectTypes() {
    return [...catalog.types().map((t) => t.name), ...catalog.domainInterfaces().map((i) => i.name)].sort((a, b) =>
      a.localeCompare(b)
    );
  }

  renderTabs() {
    this._tabs.innerHTML = this._roles
      .map((r, i) => `<button type="button" class="tab${i === this._i ? " is-active" : ""}" data-i="${i}">${esc(r.name)}</button>`)
      .join("");
  }

  renderConfig() {
    const r = this.role();
    if (!r) {
      this._cfg.innerHTML = `<mz-empty heading="${this._error ? "Couldn’t load roles" : "No roles"}">${
        this._error ? "Try again in a moment." : "Roles appear here once configured in WorkOS."
      }</mz-empty>`;
      return;
    }
    const access = r.access || {};
    const rows = this.objectTypes()
      .map((o) => {
        const lvl = level(access[o]);
        return `<div class="roles-row">
          <span class="roles-row-name">${esc(catalog.label(o))}</span>
          <div class="seg roles-access" role="group" aria-label="${esc(o)} access">
            ${LEVELS.map((l) => `<button type="button" class="roles-acc-opt${lvl === l ? " is-active" : ""}" disabled>${l}</button>`).join("")}
          </div>
        </div>`;
      })
      .join("");

    this._cfg.innerHTML = `
      <div class="roles-grid">
        <div class="roles-field">
          <label>Role</label>
          <div class="roles-static">${esc(r.name)}</div>
        </div>
        <div class="roles-field">
          <label>Description</label>
          <div class="roles-static">${esc(r.description || "—")}</div>
        </div>
      </div>

      <section class="roles-sec">
        <div class="roles-sec-head">
          <h3>Object access</h3>
          <p class="roles-sec-desc t-meta">Which records this role can see and change — defined by the workspace's schema.</p>
        </div>
        <div class="roles-rows">${rows}</div>
      </section>`;
  }
}
customElements.define("mz-roles", MzRoles);

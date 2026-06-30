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
      // Prompts are admin-only; non-admins just won't get the editable layer back.
      this._prompts = await api("/prompts").catch(() => ({}));
      this._error = false;
    } catch {
      this._error = true;
    }
    this.renderTabs();
    this.renderConfig();
  }

  // The actions a role may run: those with no role requirement, or that name it.
  roleActions(slug) {
    return catalog.actions().filter((a) => !(a.roles || []).length || (a.roles || []).includes(slug));
  }

  async savePrompt(slug, body) {
    const status = this.querySelector(".roles-prompt-status");
    if (status) status.textContent = "Saving…";
    try {
      await api("/prompts/role", { method: "PUT", body: { ref: slug, body } });
      if (this._prompts?.roles) this._prompts.roles[slug] = body;
      if (status) status.textContent = "Saved.";
    } catch {
      if (status) status.textContent = "Couldn’t save.";
    }
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
      </section>

      <section class="roles-sec">
        <div class="roles-sec-head">
          <h3>Actions</h3>
          <p class="roles-sec-desc t-meta">The capabilities this role can run — as buttons on an object and as chat tools.</p>
        </div>
        <div class="roles-rows">${this.actionsHTML(r)}</div>
      </section>

      ${this.promptHTML(r)}`;

    const ta = this._cfg.querySelector(".roles-prompt-input");
    if (ta) {
      const save = this._cfg.querySelector("[data-act='save-prompt']");
      save?.addEventListener("click", () => this.savePrompt(r.slug, ta.value));
    }
  }

  actionsHTML(r) {
    const acts = this.roleActions(r.slug);
    if (!acts.length) return `<p class="t-meta">No actions.</p>`;
    return acts
      .map(
        (a) =>
          `<div class="roles-row"><span class="roles-row-name">${esc(catalog.label(a.name))}</span><span class="t-meta">${
            a.on ? esc(catalog.label(a.on)) : "workspace"
          }</span></div>`
      )
      .join("");
  }

  // The per-role assistant instructions, appended to the agent's system prompt —
  // admin-only (the backend returns the roles layer only to admins).
  promptHTML(r) {
    if (!this._prompts?.roles) return "";
    const body = this._prompts.roles[r.slug] || "";
    return `<section class="roles-sec">
        <div class="roles-sec-head">
          <h3>Assistant instructions</h3>
          <p class="roles-sec-desc t-meta">Extra guidance the assistant follows for ${esc(r.name)} — added on top of the workspace and personal instructions.</p>
        </div>
        <textarea class="input roles-prompt-input" rows="4" placeholder="e.g. Prefer concise answers; always confirm before scheduling.">${esc(body)}</textarea>
        <div class="roles-prompt-bar"><button type="button" class="btn btn-primary btn-sm" data-act="save-prompt">Save</button><span class="roles-prompt-status t-meta" role="status"></span></div>
      </section>`;
  }
}
customElements.define("mz-roles", MzRoles);

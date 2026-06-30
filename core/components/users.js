// <mz-users></mz-users> — the workspace's people, backed by WorkOS organization
// memberships (GET /members) with roles from GET /roles. Invite by email, change
// a member's role inline, or remove them. WorkOS is the source of truth — there's
// no local users table.
import { icon } from "./icons.js";
import { api, whoami } from "../auth.js";
import { openContextEditor } from "./context-editor.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const initials = (name, email) =>
  String(name || email || "?")
    .split(/[\s@.]+/)
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
const STATUS_LABEL = { active: "Active", inactive: "Inactive", pending: "Invited" };

class MzUsers extends HTMLElement {
  connectedCallback() {
    this.classList.add("users");
    this._search = "";
    this._members = [];
    this._roles = [];
    this._admin = false;

    this.innerHTML = `
      <div class="users-toolbar">
        <div class="users-search">
          ${icon("search")}
          <input type="search" class="search-input" placeholder="Search people" aria-label="Search people" />
        </div>
        <form class="users-add">
          <input type="email" class="input users-add-email" placeholder="name@company.com" aria-label="Email to invite" />
          <span class="users-add-role-holder"></span>
          <button type="submit" class="btn btn-primary btn-sm">${icon("plus")}<span>Invite</span></button>
        </form>
      </div>
      <div class="table-card">
        <div class="table-scroll">
          <table class="table">
            <thead><tr><th>Member</th><th>Role</th><th>Status</th><th aria-label="Actions"></th></tr></thead>
            <tbody class="users-body"></tbody>
          </table>
        </div>
      </div>`;

    this._body = this.querySelector(".users-body");
    this.querySelector(".search-input").addEventListener("input", (e) => {
      this._search = e.target.value;
      this.render();
    });
    this.querySelector(".users-add").addEventListener("submit", (e) => {
      e.preventDefault();
      this.invite();
    });
    this._body.addEventListener("change", (e) => {
      const sel = e.target.closest("[data-role]");
      if (sel) this.setRole(sel.dataset.role, sel.value);
    });
    this._body.addEventListener("click", (e) => {
      const ctx = e.target.closest("[data-act='context']");
      if (ctx) { openContextEditor({ ref: ctx.dataset.email, name: ctx.dataset.name }); return; }
      const btn = e.target.closest("[data-act='remove']");
      if (btn) this.remove(btn.dataset.id);
    });

    this.load();
  }

  async load() {
    try {
      const [m, r, me] = await Promise.all([api("/members"), api("/roles"), whoami()]);
      this._members = m.members || [];
      this._roles = r.roles || [];
      this._admin = (me.roles || []).includes("admin");
      this._error = false;
    } catch {
      this._error = true;
    }
    // Inviting and removing members is admin-only (the backend enforces it too);
    // hide the invite form for everyone else.
    const form = this.querySelector(".users-add");
    if (form) form.hidden = !this._admin;
    // Re-create the invite-role select now that the roles are loaded, so the
    // mz-select picks up its <option>s at connect time (it reads them once).
    const holder = this.querySelector(".users-add-role-holder");
    if (holder) holder.innerHTML = `<mz-select class="users-role users-add-role" size="sm" aria-label="Role">${this.roleOptions()}</mz-select>`;
    this.render();
  }

  roleOptions(selected) {
    return this._roles.map((r) => `<option value="${esc(r.slug)}"${r.slug === selected ? " selected" : ""}>${esc(r.name)}</option>`).join("");
  }

  async invite() {
    const emailEl = this.querySelector(".users-add-email");
    const email = emailEl.value.trim();
    if (!email) return;
    const role = this.querySelector(".users-add-role").value;
    try {
      await api("/members/invite", { method: "POST", body: { email, role } });
      emailEl.value = "";
      this.load();
    } catch {}
  }

  async setRole(id, role) {
    try {
      await api(`/members/${encodeURIComponent(id)}`, { method: "PATCH", body: { role } });
    } catch {
      this.load();
    }
  }

  async remove(id) {
    try {
      await api(`/members/${encodeURIComponent(id)}`, { method: "DELETE" });
      this.load();
    } catch {}
  }

  render() {
    if (this._error) {
      this._body.innerHTML = `<tr><td colspan="4" class="table-empty">Couldn’t load members.</td></tr>`;
      return;
    }
    const term = this._search.trim().toLowerCase();
    const rows = term
      ? this._members.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(term))
      : this._members;
    if (!rows.length) {
      this._body.innerHTML = `<tr><td colspan="4" class="table-empty">${this._members.length ? "No people match your search." : "No members yet."}</td></tr>`;
      return;
    }
    const roleName = (slug) => this._roles.find((r) => r.slug === slug)?.name || slug;
    this._body.innerHTML = rows
      .map(
        (u) => `<tr>
          <td><div class="cell-user"><span class="avatar" aria-hidden="true">${initials(u.name, u.email)}</span><span class="cell-user-text"><b>${esc(u.name || u.email)}</b><small class="t-caption">${esc(u.email)}</small></span></div></td>
          <td>${
            this._admin
              ? `<mz-select class="users-role" size="sm" data-role="${esc(u.id)}" value="${esc(u.role)}" aria-label="Role for ${esc(u.name || u.email)}">${this.roleOptions(u.role)}</mz-select>`
              : `<span class="t-body">${esc(roleName(u.role))}</span>`
          }</td>
          <td>${
            u.status === "active"
              ? `<span class="status-ok" title="Active">${icon("check")}</span>`
              : `<span class="status-muted" title="${esc(STATUS_LABEL[u.status] || u.status)}">${icon("clock")}</span>`
          }</td>
          <td>${
            this._admin
              ? `<div class="row-actions"><button class="btn-icon" type="button" data-act="context" data-email="${esc(u.email)}" data-name="${esc(u.name || u.email)}" title="Assistant context" aria-label="Edit assistant context for ${esc(u.name || u.email)}">${icon("sliders-horizontal")}</button><button class="btn-icon" type="button" data-act="remove" data-id="${esc(u.id)}" title="Remove" aria-label="Remove ${esc(u.name || u.email)}">${icon("trash-2")}</button></div>`
              : ""
          }</td>
        </tr>`
      )
      .join("");
  }
}
customElements.define("mz-users", MzUsers);

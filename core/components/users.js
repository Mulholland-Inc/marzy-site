// <mz-users></mz-users> — the access-management page: who can get into this
// workspace, their role, and their status. Change a role inline, invite someone
// new, suspend/reactivate, or remove them. Self-contained over a sample list.
import { icon } from "./icons.js";

const ROLES = ["Admin", "Member", "Viewer"];

// status -> [label, badge variant]
const STATUS = {
  active: ["Active", "success"],
  invited: ["Invited", "neutral"],
  suspended: ["Suspended", "warning"],
};

const USERS = [
  { id: 1, name: "Dana Reyes", email: "dana@lazarco.com", role: "Admin", status: "active", last: "2026-06-24" },
  { id: 2, name: "Marcus Lin", email: "marcus@lazarco.com", role: "Member", status: "active", last: "2026-06-23" },
  { id: 3, name: "Priya Anand", email: "priya@lazarco.com", role: "Member", status: "active", last: "2026-06-22" },
  { id: 4, name: "Sam Okafor", email: "sam@lazarco.com", role: "Member", status: "active", last: "2026-06-20" },
  { id: 5, name: "Jordan Wu", email: "jordan@lazarco.com", role: "Viewer", status: "invited", last: null },
  { id: 6, name: "Alex Stone", email: "alex@lazarco.com", role: "Member", status: "suspended", last: "2026-05-12" },
];

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const initials = (name) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const fmtDate = (iso) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const roleSelect = (u) => `
  <div class="select-wrap users-role">
    <select class="input select" data-role="${u.id}" aria-label="Role for ${esc(u.name)}">
      ${ROLES.map((r) => `<option${r === u.role ? " selected" : ""}>${r}</option>`).join("")}
    </select>
    ${icon("chevron-down")}
  </div>`;

class MzUsers extends HTMLElement {
  connectedCallback() {
    this.classList.add("users");
    this._users = USERS.map((u) => ({ ...u }));
    this._seq = 100;
    this._inviting = false;

    this.innerHTML = `
      <header class="users-head">
        <div>
          <h2 class="users-title">Users</h2>
          <p class="users-sub">People with access to this workspace. Change a role to update their permissions.</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm users-add">${icon("plus")}<span>Invite user</span></button>
      </header>
      <form class="users-invite" hidden>
        <input type="email" class="input users-invite-email" placeholder="name@company.com" aria-label="Email to invite" />
        <div class="select-wrap users-role">
          <select class="input select users-invite-role" aria-label="Role">
            ${ROLES.map((r) => `<option${r === "Member" ? " selected" : ""}>${r}</option>`).join("")}
          </select>
          ${icon("chevron-down")}
        </div>
        <button type="submit" class="btn btn-primary btn-sm">Send invite</button>
        <button type="button" class="btn btn-ghost btn-sm users-invite-cancel">Cancel</button>
      </form>
      <div class="table-card">
        <table class="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last active</th>
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody class="users-body"></tbody>
        </table>
      </div>`;

    this._body = this.querySelector(".users-body");
    this._inviteForm = this.querySelector(".users-invite");

    this.querySelector(".users-add").addEventListener("click", () => this.toggleInvite(true));
    this.querySelector(".users-invite-cancel").addEventListener("click", () => this.toggleInvite(false));
    this._inviteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendInvite();
    });
    this._body.addEventListener("change", (e) => {
      const sel = e.target.closest("[data-role]");
      if (sel) this.byId(sel.dataset.role).role = sel.value;
    });
    this._body.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.act === "remove") this._users = this._users.filter((u) => String(u.id) !== id);
      if (btn.dataset.act === "suspend") this.byId(id).status = "suspended";
      if (btn.dataset.act === "activate") this.byId(id).status = "active";
      this.render();
    });

    this.render();
  }

  byId(id) {
    return this._users.find((u) => String(u.id) === String(id));
  }

  toggleInvite(on) {
    this._inviting = on;
    this._inviteForm.hidden = !on;
    if (on) this._inviteForm.querySelector(".users-invite-email").focus();
  }

  sendInvite() {
    const emailEl = this._inviteForm.querySelector(".users-invite-email");
    const email = emailEl.value.trim();
    if (!email) return;
    const role = this._inviteForm.querySelector(".users-invite-role").value;
    const name = email
      .split("@")[0]
      .split(/[.\-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    this._users.push({ id: ++this._seq, name, email, role, status: "invited", last: null });
    emailEl.value = "";
    this.toggleInvite(false);
    this.render();
  }

  render() {
    if (!this._users.length) {
      this._body.innerHTML = `<tr><td colspan="5" class="table-empty">No users yet.</td></tr>`;
      return;
    }
    this._body.innerHTML = this._users
      .map((u) => {
        const [label, variant] = STATUS[u.status];
        const suspendBtn =
          u.status === "suspended"
            ? `<button class="btn btn-outline btn-sm" type="button" data-act="activate" data-id="${u.id}">Reactivate</button>`
            : u.status === "active"
              ? `<button class="btn-icon" type="button" data-act="suspend" data-id="${u.id}" title="Suspend" aria-label="Suspend ${esc(u.name)}">${icon("circle-alert")}</button>`
              : "";
        return `<tr>
          <td><div class="cell-user"><span class="avatar" aria-hidden="true">${initials(u.name)}</span><span><b>${esc(u.name)}</b><small>${esc(u.email)}</small></span></div></td>
          <td>${roleSelect(u)}</td>
          <td><span class="badge badge-${variant}">${label}</span></td>
          <td class="cell-muted">${fmtDate(u.last)}</td>
          <td><div class="row-actions">${suspendBtn}<button class="btn-icon" type="button" data-act="remove" data-id="${u.id}" title="Remove" aria-label="Remove ${esc(u.name)}">${icon("trash-2")}</button></div></td>
        </tr>`;
      })
      .join("");
  }
}
customElements.define("mz-users", MzUsers);

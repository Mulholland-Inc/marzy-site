// <mz-users></mz-users> — the access-management page: who can get into this
// workspace, their role, and their status. Change a role inline, suspend/
// reactivate, or remove someone. Self-contained over a sample list.
import { icon } from "./icons.js";

const ROLES = ["Admin", "Member", "Viewer"];

const USERS = [
  { id: 1, name: "Dana Reyes", email: "dana@lazarco.com", role: "Admin", last: "2026-06-24" },
  { id: 2, name: "Marcus Lin", email: "marcus@lazarco.com", role: "Member", last: "2026-06-23" },
  { id: 3, name: "Priya Anand", email: "priya@lazarco.com", role: "Member", last: "2026-06-22" },
  { id: 4, name: "Sam Okafor", email: "sam@lazarco.com", role: "Member", last: "2026-06-20" },
  { id: 5, name: "Jordan Wu", email: "jordan@lazarco.com", role: "Viewer", last: "2026-06-18" },
  { id: 6, name: "Alex Stone", email: "alex@lazarco.com", role: "Member", last: "2026-05-12" },
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
    this._search = "";
    this._seq = 100;

    this.innerHTML = `
      <div class="users-toolbar">
        <div class="users-search">
          ${icon("search")}
          <input type="search" class="search-input" placeholder="Search people" aria-label="Search people" />
        </div>
        <form class="users-add">
          <input type="email" class="input users-add-email" placeholder="name@company.com" aria-label="Email to add" />
          <div class="select-wrap users-role">
            <select class="input select users-add-role" aria-label="Role">
              ${ROLES.map((r) => `<option${r === "Member" ? " selected" : ""}>${r}</option>`).join("")}
            </select>
            ${icon("chevron-down")}
          </div>
          <button type="submit" class="btn btn-primary btn-sm">${icon("plus")}<span>Add user</span></button>
        </form>
      </div>
      <div class="table-card">
        <table class="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Last active</th>
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody class="users-body"></tbody>
        </table>
      </div>`;

    this._body = this.querySelector(".users-body");

    this.querySelector(".search-input").addEventListener("input", (e) => {
      this._search = e.target.value;
      this.render();
    });
    this.querySelector(".users-add").addEventListener("submit", (e) => {
      e.preventDefault();
      this.addUser();
    });
    this._body.addEventListener("change", (e) => {
      const sel = e.target.closest("[data-role]");
      if (sel) this.byId(sel.dataset.role).role = sel.value;
    });
    this._body.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act='remove']");
      if (!btn) return;
      this._users = this._users.filter((u) => String(u.id) !== btn.dataset.id);
      this.render();
    });

    this.render();
  }

  byId(id) {
    return this._users.find((u) => String(u.id) === String(id));
  }

  addUser() {
    const emailEl = this.querySelector(".users-add-email");
    const email = emailEl.value.trim();
    if (!email) return;
    const role = this.querySelector(".users-add-role").value;
    const name = email
      .split("@")[0]
      .split(/[.\-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    this._users.push({ id: ++this._seq, name, email, role, last: null });
    emailEl.value = "";
    this.render();
  }

  render() {
    const term = this._search.trim().toLowerCase();
    const rows = term
      ? this._users.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(term))
      : this._users;
    if (!rows.length) {
      this._body.innerHTML = `<tr><td colspan="4" class="table-empty">No people match your search.</td></tr>`;
      return;
    }
    this._body.innerHTML = rows
      .map(
        (u) => `<tr>
          <td><div class="cell-user"><span class="avatar" aria-hidden="true">${initials(u.name)}</span><span class="cell-user-text"><b>${esc(u.name)}</b><small class="t-caption">${esc(u.email)}</small></span></div></td>
          <td>${roleSelect(u)}</td>
          <td class="cell-muted">${fmtDate(u.last)}</td>
          <td><div class="row-actions"><button class="btn-icon" type="button" data-act="remove" data-id="${u.id}" title="Remove" aria-label="Remove ${esc(u.name)}">${icon("trash-2")}</button></div></td>
        </tr>`
      )
      .join("");
  }
}
customElements.define("mz-users", MzUsers);

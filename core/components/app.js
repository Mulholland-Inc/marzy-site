// <mz-app></mz-app>, a full-screen dashboard application: a left sidebar, a
// scrollable main area, and a full-height detail pane on the right that appears
// only when an object is open. On mobile the sidebar becomes a hamburger drawer
// and the pane becomes an overlay. Object pages render an <mz-collection>; the
// app owns the pane and fills it from collections' mz-select / mz-new events.
import { SPARK } from "./spark.js";
import { STATUSES, RECORDS, PRIO, prioHTML, whoHTML } from "./data.js";

const ICON = {
  overview:
    '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  tasks:
    '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="5" height="15" rx="1.2"/><rect x="9.75" y="4.5" width="5" height="10" rx="1.2"/><rect x="16" y="4.5" width="5" height="13" rx="1.2"/></svg>',
  projects:
    '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  inbox:
    '<svg viewBox="0 0 24 24"><path d="M3.5 13 6 5.5h12L20.5 13v5.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/><path d="M3.5 13H8l1.5 2.5h5L16 13h4.5"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9h17M8 3v3M16 3v3"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24"><path d="M3 8h12"/><circle cx="18" cy="8" r="2.4"/><path d="M21 16H9"/><circle cx="6" cy="16" r="2.4"/></svg>',
};
const BURGER = '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
const PENCIL = '<svg viewBox="0 0 24 24"><path d="M5 19h3l9-9-3-3-9 9z"/><path d="m14 6 3 3"/></svg>';
const COPY = '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg>';
const TRASH = '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>';
const CHEV = '<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>';

const STATS = [
  ["14", "tasks awaiting review"],
  ["3 hrs", "avg time to filed"],
  ["6", "connected systems"],
  ["99.9%", "workflow uptime"],
];
const people = [...new Set(RECORDS.map((r) => r.assignee))];

const VIEWS = [
  {
    id: "overview",
    label: "Overview",
    render: () => `
      <mz-grid cols="4">
        ${STATS.map(([v, l]) => `<mz-card><mz-stat value="${v}" label="${l}"></mz-stat></mz-card>`).join("")}
      </mz-grid>
      <mz-grid cols="2" align="start">
        <mz-card>
          <h3>This week</h3>
          <mz-stack gap="5">
            <mz-progress value="68" label="June payroll"></mz-progress>
            <mz-progress value="42" label="Onboarding tasks"></mz-progress>
            <mz-progress value="91" label="Synced records"></mz-progress>
          </mz-stack>
        </mz-card>
        <mz-card>
          <h3>Recent activity</h3>
          <mz-activity></mz-activity>
        </mz-card>
      </mz-grid>`,
  },
  { id: "tasks", label: "Tasks", collection: { singular: "task", view: "board", views: "board,table,grid,gallery,todo,calendar" } },
  { id: "projects", label: "Projects", collection: { singular: "project", view: "grid", views: "grid,gallery,table,board" } },
  { id: "inbox", label: "Inbox", collection: { singular: "item", view: "todo", views: "todo,table" } },
  { id: "calendar", label: "Calendar", render: () => `<mz-calendar></mz-calendar>` },
  {
    id: "settings",
    label: "Settings",
    render: () => `
      <mz-tabs>
        <mz-tab-panel label="Workspace">
          <mz-grid cols="2" align="start">
            <mz-field label="Workspace name" placeholder="Lazarco Inc." for="s-name"></mz-field>
            <mz-field label="Billing email" type="email" placeholder="ops@lazarco.com" for="s-email"></mz-field>
            <mz-select label="Timezone">
              <option>Pacific (PT)</option><option>Mountain (MT)</option>
              <option>Central (CT)</option><option>Eastern (ET)</option>
            </mz-select>
            <mz-select label="Default view">
              <option>Board</option><option>Table</option><option>Grid</option>
            </mz-select>
          </mz-grid>
        </mz-tab-panel>
        <mz-tab-panel label="Automation">
          <mz-stack gap="3">
            <mz-switch label="Auto-run trusted workflows" checked></mz-switch>
            <mz-switch label="Require approval over the limit" checked></mz-switch>
            <mz-switch label="Email me when review is needed"></mz-switch>
          </mz-stack>
        </mz-tab-panel>
        <mz-tab-panel label="Members">
          <mz-stack gap="3">
            <mz-switch label="Allow members to invite others"></mz-switch>
            <mz-switch label="Require 2-factor authentication" checked></mz-switch>
            <mz-actions><mz-btn variant="outline" size="sm">Manage members</mz-btn></mz-actions>
          </mz-stack>
        </mz-tab-panel>
        <mz-tab-panel label="Plan &amp; billing">
          <mz-stack gap="3">
            <p>You're on the <b>Team</b> plan, billed monthly.</p>
            <mz-actions><mz-btn variant="outline" size="sm">Change plan</mz-btn></mz-actions>
          </mz-stack>
        </mz-tab-panel>
      </mz-tabs>`,
  },
];

class MzApp extends HTMLElement {
  connectedCallback() {
    this.classList.add("app");
    this._singular = "item";
    const nav = VIEWS.map(
      (v, i) =>
        `<button class="sidebar-item${i === 0 ? " is-active" : ""}" type="button" data-view="${v.id}">${ICON[v.id]}<span>${v.label}</span></button>`
    ).join("");
    this.innerHTML = `
      <aside class="sidebar">
        <mz-workspace></mz-workspace>
        <nav class="sidebar-nav" aria-label="Sidebar">${nav}</nav>
      </aside>
      <div class="app-main">
        <header class="app-bar">
          <button type="button" class="app-burger" aria-label="Menu">${BURGER}</button>
          <span class="app-bar-title"></span>
        </header>
        <div class="app-body" tabindex="-1"></div>
      </div>
      <aside class="app-pane" aria-label="Details" hidden></aside>
      <div class="app-scrim" hidden></div>`;

    this._body = this.querySelector(".app-body");
    this._nav = this.querySelector(".sidebar-nav");
    this._pane = this.querySelector(".app-pane");
    this._scrim = this.querySelector(".app-scrim");
    this._barTitle = this.querySelector(".app-bar-title");

    this._nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".sidebar-item");
      if (!btn) return;
      this._nav.querySelectorAll(".sidebar-item").forEach((b) => b.classList.toggle("is-active", b === btn));
      this.closeNav();
      this.show(btn.dataset.view);
    });
    this.querySelector(".app-burger").addEventListener("click", () => this.toggleNav());
    this._scrim.addEventListener("click", () => {
      this.closeNav();
      this.hidePane();
    });
    // collections + views bubble these up to the app, which owns the pane
    this.addEventListener("mz-select", (e) => this.openDetail(e.detail));
    this.addEventListener("mz-new", () => this.openCreate());
    this._pane.addEventListener("click", (e) => {
      if (e.target.closest(".pane-cancel")) this.hidePane();
    });

    this.show(VIEWS[0].id);
  }

  toggleNav() {
    this.classList.toggle("nav-open");
    this.syncScrim();
  }
  closeNav() {
    this.classList.remove("nav-open");
    this.syncScrim();
  }
  hidePane() {
    this._pane.hidden = true;
    this.classList.remove("pane-open");
    this.syncScrim();
  }
  showPane() {
    this._pane.hidden = false;
    this.classList.add("pane-open");
    this.syncScrim();
  }
  syncScrim() {
    this._scrim.hidden = !(this.classList.contains("nav-open") || this.classList.contains("pane-open"));
  }

  show(id) {
    const view = VIEWS.find((v) => v.id === id) || VIEWS[0];
    this._barTitle.textContent = view.label;
    const head = `<header class="app-head">
        <span class="app-head-title"><span class="app-head-icon" aria-hidden="true">${ICON[view.id]}</span>${view.label}</span>
      </header>`;
    this._singular = view.collection ? view.collection.singular : "item";
    this._body.innerHTML = view.collection
      ? head + `<mz-collection singular="${view.collection.singular}" view="${view.collection.view}" views="${view.collection.views}"></mz-collection>`
      : head + view.render();
    this._body.scrollTop = 0;
    this.hidePane(); // nothing open yet
  }

  openDetail(r) {
    this._pane.innerHTML = `
      <div class="pane-head"><span class="pane-eyebrow">${r.tag}</span></div>
      <h3 class="pane-title">${r.title}</h3>

      <div class="ios-section">
        <span class="ios-section-label">Details</span>
        <div class="ios-group">
          <div class="ios-row"><span class="ios-row-label">Status</span><span class="ios-row-value"><span class="badge badge-neutral">${r.status}</span></span></div>
          <div class="ios-row"><span class="ios-row-label">Priority</span><span class="ios-row-value">${prioHTML(r.priority)}</span></div>
          <div class="ios-row"><span class="ios-row-label">Assignee</span><span class="ios-row-value">${whoHTML(r.assignee)}</span></div>
          <div class="ios-row"><span class="ios-row-label">Due</span><span class="ios-row-value">${r.due}</span></div>
        </div>
        <span class="ios-footnote">Marzy keeps the full trail for this ${this._singular}: every action, its source, and the exact change — auditable end to end.</span>
      </div>

      <div class="ios-section">
        <div class="ios-group">
          <button type="button" class="ios-row ios-link"><span class="ios-ico">${PENCIL}</span><span class="ios-link-label">Edit ${this._singular}</span><span class="ios-chev" aria-hidden="true">${CHEV}</span></button>
          <button type="button" class="ios-row ios-link"><span class="ios-ico">${COPY}</span><span class="ios-link-label">Duplicate</span><span class="ios-chev" aria-hidden="true">${CHEV}</span></button>
          <button type="button" class="ios-row ios-link ios-danger"><span class="ios-ico">${TRASH}</span><span class="ios-link-label">Delete</span><span class="ios-chev" aria-hidden="true">${CHEV}</span></button>
        </div>
      </div>`;
    this.showPane();
  }

  openCreate() {
    this._pane.innerHTML = `
      <div class="pane-head"><span class="pane-eyebrow">New ${this._singular}</span></div>
      <form class="pane-form" onsubmit="return false">
        <mz-field label="Title" placeholder="Untitled ${this._singular}" for="nc-title"></mz-field>
        <mz-select label="Status">${STATUSES.map((s) => `<option>${s}</option>`).join("")}</mz-select>
        <mz-select label="Assignee">${people.map((p) => `<option>${p}</option>`).join("")}</mz-select>
        <mz-select label="Priority">${Object.values(PRIO).map((p) => `<option>${p}</option>`).join("")}</mz-select>
        <mz-field label="Due date" type="date" for="nc-due"></mz-field>
        <mz-field label="Notes" type="textarea" placeholder="Anything worth noting…" for="nc-notes"></mz-field>
        <mz-actions align="end">
          <mz-btn variant="ghost" class="pane-cancel">Cancel</mz-btn>
          <mz-btn variant="primary">Create ${this._singular}</mz-btn>
        </mz-actions>
      </form>`;
    this.showPane();
  }
}
customElements.define("mz-app", MzApp);

// <mz-app></mz-app>, a full-screen dashboard application: a left sidebar, a
// scrollable main area, and a full-height detail pane on the right that appears
// only when an object is open. On mobile the sidebar becomes a hamburger drawer
// and the pane becomes an overlay. Object pages render an <mz-collection>; the
// app owns the pane and fills it from collections' mz-select / mz-new events.
import { STATUSES, RECORDS, PRIO, prioHTML, whoHTML } from "./data.js";
import { icon } from "./icons.js";

const ICON = {
  overview: icon("layout-dashboard"),
  tasks: icon("square-kanban"),
  projects: icon("layout-grid"),
  inbox: icon("inbox"),
  calendar: icon("calendar"),
  connectors: icon("plug"),
  settings: icon("settings"),
};
const BURGER = icon("menu");
const PENCIL = icon("pencil");
const COPY = icon("copy");
const TRASH = icon("trash-2");

const people = [...new Set(RECORDS.map((r) => r.assignee))];

const VIEWS = [
  {
    id: "overview",
    label: "Overview",
    render: () => `
      <mz-grid cols="2" align="start">
        <mz-card>
          <h3>This week</h3>
          <mz-stack gap="5">
            <mz-progress value="68" label="June payroll"></mz-progress>
            <mz-progress value="42" label="Onboarding tasks"></mz-progress>
            <mz-progress value="91" label="Synced records"></mz-progress>
          </mz-stack>
        </mz-card>
        <mz-activity></mz-activity>
      </mz-grid>`,
  },
  { id: "tasks", label: "Tasks", collection: { singular: "task", view: "board", views: "board,table,grid,gallery,todo,calendar" } },
  { id: "projects", label: "Projects", collection: { singular: "project", view: "grid", views: "grid,gallery,table,board" } },
  { id: "inbox", label: "Inbox", render: () => `<mz-mailbox></mz-mailbox>` },
  { id: "calendar", label: "Calendar", render: () => `<mz-calendar></mz-calendar>` },
  { id: "connectors", label: "Connectors", render: () => `<mz-connectors></mz-connectors>` },
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
      <aside class="app-pane" aria-label="Details"></aside>
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
    // keep the element rendered (transform handles hide) so it can slide out
    this.classList.remove("pane-open");
    this.syncScrim();
  }
  showPane() {
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
        <nav class="crumbs" aria-label="Breadcrumb">
          <span class="crumb crumb-muted">Mulholland</span>
          <span class="crumb-sep" aria-hidden="true">${icon("chevron-right")}</span>
          <span class="crumb crumb-current"><span class="crumb-ico" aria-hidden="true">${ICON[view.id]}</span>${view.label}</span>
        </nav>
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
      <div class="pane-head">
        <span class="pane-eyebrow">${r.tag}</span>
        <div class="pane-tools">
          <button type="button" class="btn-icon" title="Edit ${this._singular}" aria-label="Edit">${PENCIL}</button>
          <button type="button" class="btn-icon" title="Duplicate" aria-label="Duplicate">${COPY}</button>
          <button type="button" class="btn-icon" title="Delete" aria-label="Delete">${TRASH}</button>
        </div>
      </div>
      <h3 class="pane-title">${r.title}</h3>

      <div class="ios-section">
        <div class="ios-group">
          <div class="ios-row"><span class="ios-row-label">Status</span><span class="ios-row-value"><span class="badge badge-neutral">${r.status}</span></span></div>
          <div class="ios-row"><span class="ios-row-label">Priority</span><span class="ios-row-value">${prioHTML(r.priority)}</span></div>
          <div class="ios-row"><span class="ios-row-label">Assignee</span><span class="ios-row-value">${whoHTML(r.assignee)}</span></div>
          <div class="ios-row"><span class="ios-row-label">Team</span><span class="ios-row-value">${r.tag}</span></div>
          <div class="ios-row"><span class="ios-row-label">Due</span><span class="ios-row-value">${r.due}</span></div>
        </div>
      </div>

      <div class="ios-section">
        <ol class="chain">
          <li class="chain-item">
            <span class="chain-dot"></span>
            <div class="chain-content">
              <div class="chain-head"><b>Status changed</b><time>2h ago</time></div>
              <div class="chain-card">
                <span class="chain-diff"><span class="chain-from">In progress</span>→<span class="chain-to">${r.status}</span></span>
                <span class="chain-who">${whoHTML("Marzy")}</span>
              </div>
            </div>
          </li>
          <li class="chain-item">
            <span class="chain-dot"></span>
            <div class="chain-content">
              <div class="chain-head"><b>Assignee changed</b><time>1d ago</time></div>
              <div class="chain-card">
                <span class="chain-diff"><span class="chain-from">Unassigned</span>→<span class="chain-to">${r.assignee}</span></span>
                <span class="chain-who">${whoHTML("Marzy")}</span>
              </div>
            </div>
          </li>
          <li class="chain-item">
            <span class="chain-dot"></span>
            <div class="chain-content">
              <div class="chain-head"><b>Priority changed</b><time>3d ago</time></div>
              <div class="chain-card">
                <span class="chain-diff"><span class="chain-from">Low</span>→<span class="chain-to">${PRIO[r.priority]}</span></span>
                <span class="chain-who">${whoHTML(r.assignee)}</span>
              </div>
            </div>
          </li>
          <li class="chain-item">
            <span class="chain-dot"></span>
            <div class="chain-content">
              <div class="chain-head"><b>Created</b><time>${r.due}</time></div>
              <div class="chain-card">
                <span class="chain-diff">${r.title}</span>
                <span class="chain-who">${whoHTML(r.assignee)}</span>
              </div>
            </div>
          </li>
        </ol>
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

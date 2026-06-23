// <mz-app></mz-app>, a full-screen dashboard application: a fixed sidebar with
// working navigation and a scrollable main area whose content switches per
// view. Object pages render an <mz-collection> (archive + create + detail pane);
// other pages render their own content.
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

const STATS = [
  ["14", "tasks awaiting review"],
  ["3 hrs", "avg time to filed"],
  ["6", "connected systems"],
  ["99.9%", "workflow uptime"],
];

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
  {
    id: "tasks",
    label: "Tasks",
    collection: { singular: "task", view: "board", views: "board,table,grid,gallery,todo,calendar" },
  },
  {
    id: "projects",
    label: "Projects",
    collection: { singular: "project", view: "grid", views: "grid,gallery,table,board" },
  },
  {
    id: "inbox",
    label: "Inbox",
    collection: { singular: "item", view: "todo", views: "todo,table" },
  },
  {
    id: "calendar",
    label: "Calendar",
    render: () => `<mz-calendar></mz-calendar>`,
  },
  {
    id: "settings",
    label: "Settings",
    render: () => `
      <mz-grid cols="2" align="start">
        <mz-card>
          <h3>Workspace</h3>
          <mz-stack gap="4">
            <mz-field label="Workspace name" placeholder="Lazarco Inc." for="s-name"></mz-field>
            <mz-field label="Billing email" type="email" placeholder="ops@lazarco.com" for="s-email"></mz-field>
            <mz-select label="Timezone">
              <option>Pacific (PT)</option><option>Mountain (MT)</option>
              <option>Central (CT)</option><option>Eastern (ET)</option>
            </mz-select>
          </mz-stack>
        </mz-card>
        <mz-card>
          <h3>Automation</h3>
          <mz-stack gap="3">
            <mz-switch label="Auto-run trusted workflows" checked></mz-switch>
            <mz-switch label="Require approval over the limit" checked></mz-switch>
            <mz-switch label="Email me when review is needed"></mz-switch>
          </mz-stack>
        </mz-card>
        <mz-card>
          <h3>Members</h3>
          <mz-stack gap="3">
            <mz-switch label="Allow members to invite others"></mz-switch>
            <mz-switch label="Require 2-factor authentication" checked></mz-switch>
            <mz-actions><mz-btn variant="outline" size="sm">Manage members</mz-btn></mz-actions>
          </mz-stack>
        </mz-card>
        <mz-card>
          <h3>Plan &amp; billing</h3>
          <mz-stack gap="3">
            <p>You're on the <b>Team</b> plan, billed monthly.</p>
            <mz-actions><mz-btn variant="outline" size="sm">Change plan</mz-btn></mz-actions>
          </mz-stack>
        </mz-card>
      </mz-grid>`,
  },
];

class MzApp extends HTMLElement {
  connectedCallback() {
    this.classList.add("app");
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
        <div class="app-body" tabindex="-1"></div>
      </div>`;

    this._body = this.querySelector(".app-body");
    this._nav = this.querySelector(".sidebar-nav");
    this._nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".sidebar-item");
      if (!btn) return;
      this._nav.querySelectorAll(".sidebar-item").forEach((b) => b.classList.toggle("is-active", b === btn));
      this.show(btn.dataset.view);
    });

    this.show(VIEWS[0].id);
  }

  show(id) {
    const view = VIEWS.find((v) => v.id === id) || VIEWS[0];
    const head = `<header class="app-head">
        <span class="app-head-title"><span class="app-head-icon" aria-hidden="true">${ICON[view.id]}</span>${view.label}</span>
      </header>`;
    const content = view.collection
      ? `<mz-collection singular="${view.collection.singular}" view="${view.collection.view}" views="${view.collection.views}"></mz-collection>`
      : view.render();
    this._body.innerHTML = head + content;
    this._body.scrollTop = 0;
  }
}
customElements.define("mz-app", MzApp);

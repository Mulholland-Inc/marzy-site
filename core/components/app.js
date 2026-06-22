// <mz-app></mz-app>, a full-screen dashboard application: a fixed sidebar with
// working navigation and a scrollable main area whose content switches per
// view. Views are composed from existing <mz-*> components.
import { SPARK } from "./spark.js";

const ICON = {
  overview:
    '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  tasks:
    '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9h17M9 4.5v15"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9h17M8 3v3M16 3v3"/></svg>',
  members:
    '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.6 19a5.4 5.4 0 0 1 10.8 0"/><path d="M16.5 5.4a3.2 3.2 0 0 1 0 5.9"/><path d="M17.8 13.2a5.4 5.4 0 0 1 2.6 4.6"/></svg>',
  connections:
    '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.3 10.9 15.7 7.1M8.3 13.1 15.7 16.9"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24"><path d="M3 8h12"/><circle cx="18" cy="8" r="2.4"/><path d="M21 16H9"/><circle cx="6" cy="16" r="2.4"/></svg>',
};

const STATS = [
  ["14", "tasks awaiting review"],
  ["3 hrs", "avg time to filed"],
  ["6", "connected systems"],
  ["99.9%", "workflow uptime"],
];

const CONNECTIONS = [
  ["Gusto", "Payroll & benefits", "success", "Connected"],
  ["QuickBooks", "Billing & ledger", "warning", "Token expiring"],
  ["Gmail", "Inbox", "success", "Connected"],
  ["Sikka", "Records sync", "success", "Connected"],
  ["Stripe", "Payments", "neutral", "Not connected"],
  ["Slack", "Notifications", "success", "Connected"],
];

const VIEWS = [
  {
    id: "overview",
    label: "Overview",
    title: "Overview",
    action: "New connection",
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
    title: "Tasks",
    action: "New task",
    render: () => `<mz-card><mz-kanban></mz-kanban></mz-card>`,
  },
  {
    id: "calendar",
    label: "Calendar",
    title: "Calendar",
    render: () => `<mz-calendar></mz-calendar>`,
  },
  {
    id: "members",
    label: "Members",
    title: "Members",
    action: "Invite member",
    render: () => `<mz-table></mz-table>`,
  },
  {
    id: "connections",
    label: "Connections",
    title: "Connections",
    action: "Add connection",
    render: () => `
      <mz-grid cols="3">
        ${CONNECTIONS.map(
          ([name, meta, variant, tag]) => `
          <mz-card hover>
            <mz-stack gap="3">
              <h3>${name}</h3>
              <p>${meta}</p>
              <mz-badge variant="${variant}">${tag}</mz-badge>
            </mz-stack>
          </mz-card>`
        ).join("")}
      </mz-grid>`,
  },
  {
    id: "settings",
    label: "Settings",
    title: "Settings",
    render: () => `
      <mz-card>
        <div style="max-width: 620px">
          <h3>Workspace</h3>
          <mz-stack gap="4">
            <mz-grid cols="2">
              <mz-field label="Workspace name" placeholder="Lazarco Inc." for="s-name"></mz-field>
              <mz-field label="Billing email" type="email" placeholder="ops@lazarco.com" for="s-email"></mz-field>
            </mz-grid>
            <mz-select label="Timezone">
              <option>Pacific (PT)</option>
              <option>Mountain (MT)</option>
              <option>Central (CT)</option>
              <option>Eastern (ET)</option>
            </mz-select>
            <mz-divider></mz-divider>
            <mz-switch label="Auto-run trusted workflows" checked></mz-switch>
            <mz-switch label="Require approval over the limit" checked></mz-switch>
            <mz-switch label="Email me when review is needed"></mz-switch>
            <mz-divider></mz-divider>
            <mz-actions align="end">
              <mz-btn variant="ghost">Cancel</mz-btn>
              <mz-btn variant="primary">Save changes</mz-btn>
            </mz-actions>
          </mz-stack>
        </div>
      </mz-card>`,
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
        <div class="sidebar-brand"><span class="brand-stripes" aria-hidden="true"><i></i><i></i><i></i></span><span class="logo"><span class="spark" aria-hidden="true">${SPARK}</span><span>Marzy</span></span></div>
        <nav class="sidebar-nav" aria-label="Sidebar">${nav}</nav>
        <div class="sidebar-spacer"></div>
        <div class="sidebar-user">
          <span class="sidebar-avatar" aria-hidden="true">H</span>
          <span class="sidebar-user-meta"><b>Houdini</b><span>mulholland.inc</span></span>
        </div>
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
    const action = view.action
      ? `<mz-actions align="end"><mz-btn variant="primary" size="sm">${view.action}</mz-btn></mz-actions>`
      : "";
    this._body.innerHTML = action + view.render();
    this._body.scrollTop = 0;
  }
}
customElements.define("mz-app", MzApp);

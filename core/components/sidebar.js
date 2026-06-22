// <mz-sidebar></mz-sidebar>, dashboard navigation rail (app environment).
import { SPARK } from "./spark.js";

const ICON = {
  overview:
    '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  objects:
    '<svg viewBox="0 0 24 24"><path d="M12 3.5 21 8l-9 4.5L3 8z"/><path d="M3 12l9 4.5L21 12"/><path d="M3 16l9 4.5L21 16"/></svg>',
  connections:
    '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.3 10.9 15.7 7.1M8.3 13.1 15.7 16.9"/></svg>',
  members:
    '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.6 19a5.4 5.4 0 0 1 10.8 0"/><path d="M16.5 5.4a3.2 3.2 0 0 1 0 5.9"/><path d="M17.8 13.2a5.4 5.4 0 0 1 2.6 4.6"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24"><path d="M3 8h12"/><circle cx="18" cy="8" r="2.4"/><path d="M21 16H9"/><circle cx="6" cy="16" r="2.4"/></svg>',
};

const ITEMS = [
  ["overview", "Overview", true],
  ["objects", "Objects", false],
  ["connections", "Connections", false],
  ["members", "Members", false],
  ["settings", "Settings", false],
];

class MzSidebar extends HTMLElement {
  connectedCallback() {
    this.classList.add("sidebar");
    const items = ITEMS.map(
      ([icon, label, active]) =>
        `<a class="sidebar-item${active ? " is-active" : ""}" href="#">${ICON[icon]}<span>${label}</span></a>`
    ).join("");
    this.innerHTML = `
      <div class="sidebar-brand"><span class="brand-stripes" aria-hidden="true"><i></i><i></i><i></i></span><span class="logo"><span class="spark" aria-hidden="true">${SPARK}</span><span>Marzy</span></span></div>
      <div class="sidebar-section">Workspace</div>
      <nav class="sidebar-nav" aria-label="Sidebar">${items}</nav>
      <div class="sidebar-spacer"></div>
      <div class="sidebar-user">
        <span class="sidebar-avatar" aria-hidden="true">H</span>
        <span class="sidebar-user-meta"><b>Houdini</b><span>mulholland.inc</span></span>
      </div>`;
  }
}
customElements.define("mz-sidebar", MzSidebar);

// <mz-sidebar></mz-sidebar>, dashboard navigation rail (app environment).
import { SPARK } from "./spark.js";
import { icon } from "./icons.js";

const ICON = {
  overview: icon("layout-dashboard"),
  objects: icon("layers"),
  connections: icon("share-2"),
  members: icon("users"),
  settings: icon("settings"),
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
      <div class="sidebar-brand"><span class="logo"><span class="spark" aria-hidden="true">${SPARK}</span><span>Marzy</span></span></div>
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

// <mz-collection view="board" views="board,table,grid,gallery,todo,calendar"
//                singular="task"></mz-collection>
// The WordPress-style archive: a view-switcher over the shared data, a "New"
// button that opens a create form in a right-hand pane, and a detail pane that
// opens when an object is selected from any view.
import { STATUSES, RECORDS, PRIO, prioHTML, whoHTML } from "./data.js";

const VIEW_TAG = {
  table: "mz-view-table",
  board: "mz-view-board",
  grid: "mz-view-grid",
  gallery: "mz-view-gallery",
  todo: "mz-view-todo",
  calendar: "mz-calendar",
};
const VIEW_LABEL = {
  table: "Table",
  board: "Board",
  grid: "Grid",
  gallery: "Gallery",
  todo: "To-do",
  calendar: "Calendar",
};
const VICON = {
  table: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="M3.5 9.5h17M3.5 14h17M9 9.5V19"/></svg>',
  board: '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="5" height="15" rx="1.2"/><rect x="9.75" y="4.5" width="5" height="10" rx="1.2"/><rect x="16" y="4.5" width="5" height="13" rx="1.2"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  gallery: '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 17 5-4 4 3 3-2.5 4 3.5"/></svg>',
  todo: '<svg viewBox="0 0 24 24"><path d="M4 6.5 6 8.5 9.5 5"/><path d="M4 13.5 6 15.5 9.5 12"/><path d="M13 7h7M13 14h7"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9h17M8 3v3M16 3v3"/></svg>',
};
const CLOSE = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>';

const people = [...new Set(RECORDS.map((r) => r.assignee))];

class MzCollection extends HTMLElement {
  connectedCallback() {
    this.classList.add("collection");
    this._singular = this.getAttribute("singular") || "item";
    this._views = (this.getAttribute("views") || "board,table,grid,todo").split(",").map((s) => s.trim());
    this._view = this.getAttribute("view") || this._views[0];

    const seg = this._views
      .map(
        (id) =>
          `<button type="button" class="seg-btn${id === this._view ? " is-active" : ""}" data-view="${id}" title="${VIEW_LABEL[id]}">${VICON[id] || ""}<span>${VIEW_LABEL[id]}</span></button>`
      )
      .join("");

    this.innerHTML = `
      <div class="collection-tools">
        <div class="seg viewseg" role="tablist">${seg}</div>
        <button type="button" class="btn btn-primary btn-sm collection-new">New ${this._singular}</button>
      </div>
      <div class="collection-body">
        <div class="collection-main"></div>
      </div>
      <aside class="collection-pane" aria-hidden="true"></aside>`;

    this._main = this.querySelector(".collection-main");
    this._pane = this.querySelector(".collection-pane");

    this.querySelector(".viewseg").addEventListener("click", (e) => {
      const btn = e.target.closest(".seg-btn");
      if (!btn) return;
      this._view = btn.dataset.view;
      this.querySelectorAll(".seg-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
      this.renderView();
    });
    this.querySelector(".collection-new").addEventListener("click", () => this.openCreate());
    // views bubble mz-select up to here
    this._main.addEventListener("mz-select", (e) => this.openDetail(e.detail));
    this._pane.addEventListener("click", (e) => {
      if (e.target.closest(".pane-close") || e.target.closest(".pane-cancel")) this.closePane();
    });
    this._onKey = (e) => {
      if (e.key === "Escape") this.closePane();
    };
    document.addEventListener("keydown", this._onKey);

    this.renderView();
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._onKey);
  }

  openPane() {
    this._pane.classList.add("is-open");
    this._pane.setAttribute("aria-hidden", "false");
  }

  renderView() {
    this._main.innerHTML = `<${VIEW_TAG[this._view]}></${VIEW_TAG[this._view]}>`;
  }

  openDetail(r) {
    this._pane.innerHTML = `
      <div class="pane-head">
        <span class="pane-eyebrow">${r.tag}</span>
        <button type="button" class="pane-close" aria-label="Close">${CLOSE}</button>
      </div>
      <h3 class="pane-title">${r.title}</h3>
      <dl class="pane-fields">
        <div class="pane-field"><dt>Status</dt><dd><span class="badge badge-neutral">${r.status}</span></dd></div>
        <div class="pane-field"><dt>Priority</dt><dd>${prioHTML(r.priority)}</dd></div>
        <div class="pane-field"><dt>Assignee</dt><dd>${whoHTML(r.assignee)}</dd></div>
        <div class="pane-field"><dt>Due</dt><dd>${r.due}</dd></div>
      </dl>
      <p class="pane-desc">Marzy keeps the full trail for this ${this._singular}: every action, its source, and the exact change — auditable end to end.</p>
      <div class="pane-actions">
        <mz-btn variant="outline" size="sm">Edit</mz-btn>
        <mz-btn variant="ghost" size="sm">Delete</mz-btn>
      </div>`;
    this.openPane();
  }

  openCreate() {
    this._pane.innerHTML = `
      <div class="pane-head">
        <span class="pane-eyebrow">New ${this._singular}</span>
        <button type="button" class="pane-close" aria-label="Close">${CLOSE}</button>
      </div>
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
    this.openPane();
  }

  closePane() {
    this._pane.classList.remove("is-open");
    this._pane.setAttribute("aria-hidden", "true");
  }
}
customElements.define("mz-collection", MzCollection);

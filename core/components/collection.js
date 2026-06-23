// <mz-collection view="board" views="board,table,grid,gallery,todo,calendar"
//                singular="task"></mz-collection>
// The archive: a view-switcher (with a sliding highlight) over the shared data.
// Selecting an object emits mz-select and "New" emits mz-new; <mz-app> owns the
// detail pane and responds to both.
import { icon } from "./icons.js";

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
  table: icon("table"),
  board: icon("square-kanban"),
  grid: icon("layout-grid"),
  gallery: icon("image"),
  todo: icon("list-todo"),
  calendar: icon("calendar"),
};

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
        <div class="seg viewseg" role="tablist"><span class="seg-thumb" aria-hidden="true"></span>${seg}</div>
        <button type="button" class="btn btn-primary btn-sm collection-new">New ${this._singular}</button>
      </div>
      <div class="collection-main"></div>`;

    this._main = this.querySelector(".collection-main");
    this._seg = this.querySelector(".viewseg");
    this._thumb = this.querySelector(".seg-thumb");

    this._seg.addEventListener("click", (e) => {
      const btn = e.target.closest(".seg-btn");
      if (!btn) return;
      this._view = btn.dataset.view;
      this.querySelectorAll(".seg-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
      this.moveThumb(btn);
      this.renderView();
    });
    this.querySelector(".collection-new").addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("mz-new", { bubbles: true }))
    );

    const settle = () => this.moveThumb(this._seg.querySelector(".seg-btn.is-active"));
    requestAnimationFrame(settle);
    if ("ResizeObserver" in window) {
      this._ro = new ResizeObserver(settle);
      this._ro.observe(this._seg);
    }

    this.renderView();
  }

  disconnectedCallback() {
    this._ro?.disconnect();
  }

  moveThumb(btn) {
    if (!btn || !this._thumb) return;
    this._thumb.style.left = `${btn.offsetLeft}px`;
    this._thumb.style.top = `${btn.offsetTop}px`;
    this._thumb.style.width = `${btn.offsetWidth}px`;
    this._thumb.style.height = `${btn.offsetHeight}px`;
    this._thumb.style.opacity = "1";
  }

  renderView() {
    this._main.innerHTML = `<${VIEW_TAG[this._view]}></${VIEW_TAG[this._view]}>`;
  }
}
customElements.define("mz-collection", MzCollection);

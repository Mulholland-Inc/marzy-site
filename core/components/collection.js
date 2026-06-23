// <mz-collection view="board" views="board,table,grid,gallery,todo,calendar"
//                singular="task"></mz-collection>
// The archive: a view-switcher (with a sliding highlight) over the shared data.
// Selecting an object emits mz-select and "New" emits mz-new; <mz-app> owns the
// detail pane and responds to both.
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

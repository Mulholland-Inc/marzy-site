// <mz-toolbar></mz-toolbar>, a reusable view toolbelt: search, filters, sort,
// display settings, and export. Maintains a query state and emits an `mz-query`
// event (bubbling) on every change; mz-collection applies it to the active view.
import { icon } from "./icons.js";
import { STATUSES, PRIORITIES, ASSIGNEES, SORTS, PRIO } from "./data.js";
import { popIn, popOut } from "./motion.js";

const CAP = (s) => s.charAt(0).toUpperCase() + s.slice(1);

class MzToolbar extends HTMLElement {
  connectedCallback() {
    this.classList.add("toolbar");
    this._q = { search: "", status: [], priority: [], assignee: [], sort: null, dir: "asc" };

    this.innerHTML = `
      <div class="tb-search">
        <span class="tb-search-ico" aria-hidden="true">${icon("search")}</span>
        <input class="tb-search-input" type="search" placeholder="Search…" aria-label="Search" />
      </div>
      <div class="tb-controls">
        ${this.control("filter", "list-filter", "Filter")}
        ${this.control("sort", "arrow-up-down", "Sort")}
        ${this.control("display", "sliders-horizontal", "Display")}
        ${this.control("export", "download", "Export")}
      </div>`;

    this._search = this.querySelector(".tb-search-input");
    this._search.addEventListener("input", () => {
      this._q.search = this._search.value;
      this.emit();
    });

    this.addEventListener("click", (e) => this.onClick(e));
    this._onDoc = (e) => {
      if (!this.contains(e.target)) this.closeAll();
    };
    this._onKey = (e) => {
      if (e.key === "Escape") this.closeAll();
    };
    document.addEventListener("click", this._onDoc);
    document.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onDoc);
    document.removeEventListener("keydown", this._onKey);
  }

  control(id, ic, label) {
    return `<div class="tb-group" data-group="${id}">
      <button type="button" class="tb-btn" data-pop="${id}" aria-haspopup="true" aria-expanded="false">
        <span class="tb-btn-ico" aria-hidden="true">${icon(ic)}</span><span>${label}</span>
      </button>
      <div class="tb-pop" data-for="${id}" hidden>${this.panel(id)}</div>
    </div>`;
  }

  panel(id) {
    if (id === "filter") {
      return (
        this.checkSection("Status", "status", STATUSES.map((s) => [s, s])) +
        this.checkSection("Priority", "priority", PRIORITIES.map((p) => [p, PRIO[p]])) +
        this.checkSection("Assignee", "assignee", ASSIGNEES.map((a) => [a, a])) +
        `<div class="tb-pop-foot"><button type="button" class="tb-clear">Clear filters</button></div>`
      );
    }
    if (id === "sort") {
      // two groups (field + order) → both labelled
      return (
        `<div class="tb-pop-head">Sort by</div>` +
        SORTS.map(
          ([key, lbl]) =>
            `<button type="button" class="tb-opt" data-sort="${key}"><span>${lbl}</span><span class="tb-opt-check" aria-hidden="true">${icon("check")}</span></button>`
        ).join("") +
        `<div class="tb-pop-head">Order</div>
         <button type="button" class="tb-opt" data-dir="asc"><span>Ascending</span><span class="tb-opt-check" aria-hidden="true">${icon("check")}</span></button>
         <button type="button" class="tb-opt" data-dir="desc"><span>Descending</span><span class="tb-opt-check" aria-hidden="true">${icon("check")}</span></button>`
      );
    }
    if (id === "display") {
      // single group → no type header
      return (
        `<label class="tb-switch"><span>Show completed</span><input type="checkbox" class="checkbox" checked data-display="completed" /></label>
         <label class="tb-switch"><span>Compact rows</span><input type="checkbox" class="checkbox" data-display="compact" /></label>
         <label class="tb-switch"><span>Show avatars</span><input type="checkbox" class="checkbox" checked data-display="avatars" /></label>`
      );
    }
    if (id === "export") {
      // single group → no type header
      return (
        `<button type="button" class="tb-opt" data-export="csv"><span>Export as CSV</span></button>
         <button type="button" class="tb-opt" data-export="pdf"><span>Export as PDF</span></button>
         <button type="button" class="tb-opt" data-export="print"><span>Print…</span></button>`
      );
    }
    return "";
  }

  checkSection(title, key, items) {
    return `<div class="tb-pop-head">${title}</div>${items
      .map(
        ([val, lbl]) =>
          `<label class="tb-check"><input type="checkbox" class="checkbox" data-key="${key}" value="${val}" /><span>${lbl}</span></label>`
      )
      .join("")}`;
  }

  onClick(e) {
    const trigger = e.target.closest(".tb-btn");
    if (trigger) {
      this.toggle(trigger.dataset.pop);
      return;
    }
    // filter checkboxes
    const chk = e.target.closest('.tb-check input[data-key]');
    if (chk) {
      const key = chk.dataset.key;
      const set = new Set(this._q[key]);
      chk.checked ? set.add(chk.value) : set.delete(chk.value);
      this._q[key] = [...set];
      this.refreshCounts();
      this.emit();
      return;
    }
    if (e.target.closest(".tb-clear")) {
      this._q.status = [];
      this._q.priority = [];
      this._q.assignee = [];
      this.querySelectorAll('.tb-check input').forEach((i) => (i.checked = false));
      this.refreshCounts();
      this.emit();
      return;
    }
    const sortOpt = e.target.closest("[data-sort]");
    if (sortOpt) {
      this._q.sort = this._q.sort === sortOpt.dataset.sort ? null : sortOpt.dataset.sort;
      this.markSort();
      this.emit();
      return;
    }
    const dirOpt = e.target.closest("[data-dir]");
    if (dirOpt) {
      this._q.dir = dirOpt.dataset.dir;
      this.markSort();
      this.emit();
      return;
    }
    // export → let the collection (which owns the rows) produce the file
    const exp = e.target.closest("[data-export]");
    if (exp) {
      this.dispatchEvent(new CustomEvent("mz-export", { detail: { format: exp.dataset.export }, bubbles: true }));
      this.closeAll();
    }
  }

  markSort() {
    this.querySelectorAll("[data-sort]").forEach((b) =>
      b.classList.toggle("is-on", b.dataset.sort === this._q.sort)
    );
    this.querySelectorAll("[data-dir]").forEach((b) =>
      b.classList.toggle("is-on", b.dataset.dir === this._q.dir)
    );
    this.setActive("sort", !!this._q.sort);
  }

  refreshCounts() {
    this.setActive("filter", this._q.status.length + this._q.priority.length + this._q.assignee.length > 0);
  }

  // subtly tint a control's button when it has an active selection
  setActive(id, on) {
    const btn = this.querySelector(`[data-group="${id}"] .tb-btn`);
    if (btn) btn.classList.toggle("is-on", on);
  }

  toggle(id) {
    const pop = this.querySelector(`.tb-pop[data-for="${id}"]`);
    const open = pop.hidden;
    this.closeAll();
    if (open) {
      pop.hidden = false;
      this.querySelector(`.tb-btn[data-pop="${id}"]`).setAttribute("aria-expanded", "true");
      popIn(pop);
    }
  }

  closeAll() {
    this.querySelectorAll(".tb-pop").forEach((p) => {
      if (p.hidden) return;
      popOut(p).then(() => (p.hidden = true));
    });
    this.querySelectorAll(".tb-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
  }

  emit() {
    this.dispatchEvent(new CustomEvent("mz-query", { bubbles: true, detail: { ...this._q } }));
  }
}
customElements.define("mz-toolbar", MzToolbar);

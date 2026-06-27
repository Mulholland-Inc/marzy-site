// <mz-view-workload></mz-view-workload>, a by-assignee perspective: one lane per
// person showing their items and a load count, busiest first. Renders from
// this._records (set via setData by mz-collection's toolbar query).
import { RECORDS, byId, emitSelect, initials } from "./data.js";

const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");

class MzViewWorkload extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.addEventListener("click", (e) => {
      const t = e.target.closest(".wl-item[data-id]");
      if (t) emitSelect(this, byId(t.dataset.id));
    });
    this.render();
  }
  setData(records) {
    this._records = records;
    this.render();
  }
  render() {
    const recs = this._records || RECORDS;
    if (!recs.length) {
      this.innerHTML = `<mz-empty heading="Nothing here">No items match the current filters.</mz-empty>`;
      return;
    }
    const groups = new Map();
    for (const r of recs) {
      if (!groups.has(r.assignee)) groups.set(r.assignee, []);
      groups.get(r.assignee).push(r);
    }
    const lanes = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
    this.innerHTML = `<div class="wl">${lanes
      .map(
        ([name, items]) => `<section class="wl-lane">
          <header class="wl-head">
            <span class="who-av">${initials(name)}</span>
            <span class="wl-name">${name}</span>
            <span class="wl-count">${items.length}</span>
          </header>
          <div class="wl-items">${items
            .map(
              (r) => `<button type="button" class="wl-item" data-id="${r.id}">
                <span class="prio-dot prio-${r.priority}"></span>
                <span class="wl-item-title">${r.title}</span>
                <span class="status-dot s-${slug(r.status)}"></span>
              </button>`
            )
            .join("")}</div>
        </section>`
      )
      .join("")}</div>`;
  }
}
customElements.define("mz-view-workload", MzViewWorkload);

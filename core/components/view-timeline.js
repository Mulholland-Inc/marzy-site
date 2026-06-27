// <mz-view-timeline></mz-view-timeline>, a schedule perspective: objects grouped
// by due date along a vertical timeline, earliest first. Renders from
// this._records (set via setData by mz-collection's toolbar query).
import { RECORDS, byId, emitSelect, avatarHTML } from "./data.js";

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
// "Jun 28" → a sortable number; undated items sink to the bottom.
const dueKey = (due) => {
  const m = String(due).match(/([A-Za-z]{3})\s+(\d{1,2})/);
  if (!m || !(m[1] in MONTHS)) return Number.MAX_SAFE_INTEGER;
  return MONTHS[m[1]] * 100 + Number(m[2]);
};

class MzViewTimeline extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.addEventListener("click", (e) => {
      const t = e.target.closest(".tl-task[data-id]");
      if (t) emitSelect(this, byId(t.dataset.id));
    });
    this.render();
  }
  setData(records) {
    this._records = records;
    this.render();
  }
  render() {
    const recs = (this._records || RECORDS).slice().sort((a, b) => dueKey(a.due) - dueKey(b.due));
    if (!recs.length) {
      this.innerHTML = `<mz-empty heading="Nothing here">No items match the current filters.</mz-empty>`;
      return;
    }
    // group consecutive records sharing a due date
    const groups = [];
    for (const r of recs) {
      const last = groups[groups.length - 1];
      if (last && last.due === r.due) last.items.push(r);
      else groups.push({ due: r.due, items: [r] });
    }
    this.innerHTML = `<ol class="tl">${groups
      .map(
        (g) => `<li class="tl-day">
          <span class="tl-dot"></span>
          <div class="tl-content">
            <div class="tl-date">${g.due || "No date"}</div>
            <div class="tl-tasks">${g.items
              .map(
                (r) => `<button type="button" class="tl-task" data-id="${r.id}">
                  <span class="prio-dot prio-${r.priority}"></span>
                  <span class="tl-task-title">${r.title}</span>
                  <span class="tl-task-tag">${r.tag}</span>
                  ${avatarHTML(r.assignee)}
                </button>`
              )
              .join("")}</div>
          </div>
        </li>`
      )
      .join("")}</ol>`;
  }
}
customElements.define("mz-view-timeline", MzViewTimeline);

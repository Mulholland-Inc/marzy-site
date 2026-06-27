// <mz-view-gantt></mz-view-gantt>, a project-timeline perspective: each object as
// a horizontal bar across a date axis. Records only carry a due date, so a start
// is synthesized as due − a priority-based duration. Renders from setData.
import { RECORDS, byId, emitSelect } from "./data.js";

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = 86400000;
const DUR = { high: 4, medium: 6, low: 8 }; // working days the bar spans, by priority
const toDate = (due) => {
  const m = String(due).match(/([A-Za-z]{3})\s+(\d{1,2})/);
  return m && m[1] in MONTHS ? new Date(2026, MONTHS[m[1]], Number(m[2])) : null;
};
const fmt = (d) => `${SHORT[d.getMonth()]} ${d.getDate()}`;

class MzViewGantt extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.addEventListener("click", (e) => {
      const b = e.target.closest(".gantt-bar[data-id]");
      if (b) emitSelect(this, byId(b.dataset.id));
    });
    this.render();
  }
  setData(records) {
    this._records = records;
    this.render();
  }
  render() {
    const recs = this._records || RECORDS;
    const tasks = recs
      .map((r) => {
        const end = toDate(r.due);
        if (!end) return null;
        return { r, start: new Date(end.getTime() - (DUR[r.priority] || 5) * DAY), end };
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);

    if (!tasks.length) {
      this.innerHTML = `<mz-empty heading="Nothing here">No items match the current filters.</mz-empty>`;
      return;
    }

    let min = Math.min(...tasks.map((t) => t.start.getTime())) - 2 * DAY;
    const max = Math.max(...tasks.map((t) => t.end.getTime())) + 2 * DAY;
    const span = max - min;
    const pct = (ms) => ((ms - min) / span) * 100;

    const ticks = [];
    for (let t = min + 2 * DAY; t <= max; t += 7 * DAY) ticks.push(t);
    const axis = ticks.map((t) => `<span class="gantt-tick" style="left:${pct(t)}%">${fmt(new Date(t))}</span>`).join("");
    const grid = ticks.map((t) => `<span class="gantt-line" style="left:${pct(t)}%"></span>`).join("");

    const rows = tasks
      .map(({ r, start, end }) => {
        const left = pct(start.getTime());
        const width = ((end - start) / span) * 100;
        const done = r.status === "Done";
        return `<div class="gantt-row">
          <div class="gantt-label" title="${r.title}">${r.title}</div>
          <div class="gantt-track">${grid}
            <button type="button" class="gantt-bar${done ? " is-done" : ""}" data-id="${r.id}" style="left:${left}%;width:${width}%" title="${r.title} · due ${r.due}">
              <span class="prio-dot prio-${r.priority}"></span><span class="gantt-bar-label">${r.title}</span>
            </button>
          </div>
        </div>`;
      })
      .join("");

    this.innerHTML = `<div class="gantt"><div class="gantt-scroll"><div class="gantt-inner">
      <div class="gantt-axis"><div class="gantt-label"></div><div class="gantt-track">${axis}</div></div>
      ${rows}
    </div></div></div>`;
  }
}
customElements.define("mz-view-gantt", MzViewGantt);

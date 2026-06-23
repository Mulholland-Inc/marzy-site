// <mz-view-table></mz-view-table>, the table perspective — a Notion-style
// database table. Renders from this._records (set via setData), default RECORDS.
import { RECORDS, byId, emitSelect, whoHTML } from "./data.js";
import { icon } from "./icons.js";

const TAG_CAT = { Finance: "finance", People: "people", Ops: "ops", Payroll: "payroll", Eng: "eng", Legal: "legal", Clinic: "clinic" };
const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");
const tagHTML = (t) => `<span class="tag"><span class="tag-dot cat-${TAG_CAT[t] || "legal"}"></span>${t}</span>`;
const statusHTML = (s) => `<span class="tag"><span class="status-dot s-${slug(s)}"></span>${s}</span>`;

const COLS = [
  ["Task", "align-left"],
  ["Team", "tag"],
  ["Status", "circle-dot"],
  ["Assignee", "user"],
  ["Due", "calendar"],
];

class MzViewTable extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.addEventListener("click", (e) => {
      if (e.target.closest("input")) return; // let checkboxes toggle
      const tr = e.target.closest("tr[data-id]");
      if (tr) emitSelect(this, byId(tr.dataset.id));
    });
    this.render();
  }
  setData(records) {
    this._records = records;
    this.render();
  }
  render() {
    const recs = this._records || RECORDS;
    this.innerHTML = `<div class="table-card"><div class="table-scroll"><table class="table table-db">
      <thead><tr>
        ${COLS.map(
          ([label, ic], i) =>
            i === 0
              ? `<th><span class="th th-first"><input type="checkbox" class="checkbox" aria-label="Select all" />${icon(ic)}${label}</span></th>`
              : `<th><span class="th">${icon(ic)}${label}</span></th>`
        ).join("")}
      </tr></thead>
      <tbody>${recs
        .map((r) => {
          const done = r.status === "Done";
          return `<tr data-id="${r.id}"${done ? ' class="is-muted"' : ""}>
          <td class="cell-title"><input type="checkbox" class="checkbox" aria-label="Select row"${done ? " checked" : ""} /><span class="cell-title-text">${r.title}</span></td>
          <td>${tagHTML(r.tag)}</td>
          <td>${statusHTML(r.status)}</td>
          <td>${whoHTML(r.assignee)}</td>
          <td class="cell-muted">${r.due}</td>
        </tr>`;
        })
        .join("")}</tbody>
    </table>${recs.length ? "" : '<div class="table-empty">No items match the current filters.</div>'}</div></div>`;
  }
}
customElements.define("mz-view-table", MzViewTable);

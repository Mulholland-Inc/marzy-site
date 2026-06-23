// <mz-view-table></mz-view-table>, the table perspective — a Notion-style
// database table: icon column headers, a leading checkbox column, colored-dot
// category cells, a status select, light grid lines, and muted "done" rows.
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
    this.innerHTML = `<div class="table-card"><div class="table-scroll"><table class="table table-db">
      <thead><tr>
        <th class="th-check"><input type="checkbox" class="checkbox" aria-label="Select all" /></th>
        ${COLS.map(([label, ic]) => `<th><span class="th">${icon(ic)}${label}</span></th>`).join("")}
      </tr></thead>
      <tbody>${RECORDS.map(
        (r) => `<tr data-id="${r.id}"${r.status === "Done" ? ' class="is-muted"' : ""}>
          <td class="td-check"><input type="checkbox" class="checkbox" aria-label="Select row"${r.status === "Done" ? " checked" : ""} /></td>
          <td class="cell-title">${r.title}</td>
          <td>${tagHTML(r.tag)}</td>
          <td>${statusHTML(r.status)}</td>
          <td>${whoHTML(r.assignee)}</td>
          <td class="cell-muted">${r.due}</td>
        </tr>`
      ).join("")}</tbody>
    </table></div></div>`;
    this.addEventListener("click", (e) => {
      if (e.target.closest("input")) return; // let checkboxes toggle
      const tr = e.target.closest("tr[data-id]");
      if (tr) emitSelect(this, byId(tr.dataset.id));
    });
  }
}
customElements.define("mz-view-table", MzViewTable);

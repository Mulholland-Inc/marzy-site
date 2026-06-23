// <mz-view-table></mz-view-table>, the table perspective over the shared data.
import { RECORDS, byId, emitSelect, prioHTML, whoHTML } from "./data.js";

class MzViewTable extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.innerHTML = `<div class="table-card"><div class="table-scroll"><table class="table">
      <thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due</th></tr></thead>
      <tbody>${RECORDS.map(
        (r) => `<tr data-id="${r.id}">
          <td class="cell-title">${r.title}</td>
          <td><span class="badge badge-neutral">${r.status}</span></td>
          <td>${prioHTML(r.priority)}</td>
          <td>${whoHTML(r.assignee)}</td>
          <td class="cell-muted">${r.due}</td>
        </tr>`
      ).join("")}</tbody>
    </table></div></div>`;
    this.addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-id]");
      if (tr) emitSelect(this, byId(tr.dataset.id));
    });
  }
}
customElements.define("mz-view-table", MzViewTable);

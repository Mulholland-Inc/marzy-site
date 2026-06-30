// <mz-view-table></mz-view-table>, the table perspective — a Notion-style
// database table over a real object type. Fed by setData(rows, { type, columns });
// a row click emits mz-select with that row, which <mz-app> opens in the pane.
import { display } from "../catalog.js";
import { icon } from "./icons.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzViewTable extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.addEventListener("click", (e) => {
      if (e.target.closest("input.checkbox")) return;
      const tr = e.target.closest("tr[data-id]");
      if (!tr) return;
      const row = (this._rows || []).find((r) => String(r.id) === tr.dataset.id);
      if (row) this.dispatchEvent(new CustomEvent("mz-select", { detail: row, bubbles: true }));
    });
    this.render();
  }

  setData(rows, ctx) {
    this._rows = rows || [];
    this._ctx = ctx || {};
    this.render();
  }

  render() {
    const cols = this._ctx?.columns;
    if (!cols) {
      this.innerHTML = "";
      return;
    }
    const rows = this._rows || [];
    const head = [cols.title, ...cols.cols];
    this.innerHTML = `<div class="table-card"><div class="table-scroll"><table class="table table-db">
      <thead><tr>
        ${head
          .map((c, i) =>
            i === 0
              ? `<th><span class="th th-first"><input type="checkbox" class="checkbox" aria-label="Select all" />${icon("align-left")}${esc(c.label)}</span></th>`
              : `<th><span class="th">${esc(c.label)}</span></th>`
          )
          .join("")}
      </tr></thead>
      <tbody>${rows
        .map(
          (r) => `<tr data-id="${esc(r.id)}">
          <td class="cell-title"><input type="checkbox" class="checkbox" aria-label="Select row" /><span class="cell-title-text">${esc(r[cols.title.name])}</span></td>
          ${cols.cols.map((c) => `<td class="cell-muted">${esc(display(r, c))}</td>`).join("")}
        </tr>`
        )
        .join("")}</tbody>
    </table>${rows.length ? "" : `<div class="table-empty">${this._ctx.error ? "Couldn’t load this collection." : "Nothing here yet."}</div>`}</div></div>`;
  }
}
customElements.define("mz-view-table", MzViewTable);

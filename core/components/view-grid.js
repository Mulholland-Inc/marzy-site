// <mz-view-grid></mz-view-grid>, a gallery of cards over a real object type.
// Fed by setData(rows, { type, columns }); a card click emits mz-select.
import { display } from "../catalog.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzViewGrid extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.addEventListener("click", (e) => {
      const card = e.target.closest(".vcard[data-id]");
      if (!card) return;
      const row = (this._rows || []).find((r) => String(r.id) === card.dataset.id);
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
    const rows = this._rows || [];
    if (!cols) {
      this.innerHTML = "";
      return;
    }
    this.innerHTML = rows.length
      ? `<div class="vgrid">${rows
          .map(
            (r) => `<div class="vcard" data-id="${esc(r.id)}">
        <div class="vcard-title">${esc(r[cols.title.name])}</div>
        <dl class="vcard-props">${cols.cols
          .slice(0, 4)
          .map((c) => {
            const v = display(r, c);
            return `<div class="vcard-row"><dt>${esc(c.label)}</dt><dd>${v ? esc(v) : "—"}</dd></div>`;
          })
          .join("")}</dl>
      </div>`
          )
          .join("")}</div>`
      : `<mz-empty heading="Nothing here yet">No ${esc(this._ctx.type || "items")} match the current filters.</mz-empty>`;
  }
}
customElements.define("mz-view-grid", MzViewGrid);

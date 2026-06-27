// <mz-view-grid></mz-view-grid>, a Notion-style gallery of cards over the shared
// data. Renders from this._records (set via setData by mz-collection's toolbar
// query), defaulting to all RECORDS.
import { RECORDS, byId, emitSelect, PRIO } from "./data.js";

class MzViewGrid extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.addEventListener("click", (e) => {
      const card = e.target.closest(".vcard[data-id]");
      if (card) emitSelect(this, byId(card.dataset.id));
    });
    this.render();
  }
  setData(records) {
    this._records = records;
    this.render();
  }
  render() {
    const recs = this._records || RECORDS;
    this.innerHTML = recs.length
      ? `<div class="vgrid">${recs
          .map(
            (r) => `<div class="vcard" data-id="${r.id}">
        <div class="vcard-title">${r.title}</div>
        <dl class="vcard-props">
          <div class="vcard-row"><dt>Status</dt><dd>${r.status}</dd></div>
          <div class="vcard-row"><dt>Assignee</dt><dd>${r.assignee}</dd></div>
          <div class="vcard-row"><dt>Priority</dt><dd>${PRIO[r.priority]}</dd></div>
          <div class="vcard-row"><dt>Due</dt><dd>${r.due}</dd></div>
        </dl>
      </div>`
          )
          .join("")}</div>`
      : `<mz-empty heading="Nothing here">No items match the current filters.</mz-empty>`;
  }
}
customElements.define("mz-view-grid", MzViewGrid);

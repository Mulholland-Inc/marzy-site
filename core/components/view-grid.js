// <mz-view-grid></mz-view-grid>, a Notion-style gallery of cards over the shared
// data. Renders from this._records (set via setData by mz-collection's toolbar
// query), defaulting to all RECORDS.
import { RECORDS, byId, emitSelect, prioHTML, whoHTML } from "./data.js";

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
        <div class="vcard-props">
          <span class="badge badge-neutral">${r.status}</span>
          <span class="vcard-tag">${r.tag}</span>
          ${prioHTML(r.priority)}
        </div>
        <div class="vcard-foot">${whoHTML(r.assignee)}<span class="vcard-due">${r.due}</span></div>
      </div>`
          )
          .join("")}</div>`
      : `<mz-empty heading="Nothing here">No items match the current filters.</mz-empty>`;
  }
}
customElements.define("mz-view-grid", MzViewGrid);

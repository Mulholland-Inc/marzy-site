// <mz-view-grid></mz-view-grid>, a card-grid perspective over the shared data.
import { RECORDS, byId, emitSelect, prioHTML, avatarHTML } from "./data.js";

class MzViewGrid extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.innerHTML = `<div class="grid grid-3">${RECORDS.map(
      (r) => `<div class="card card-hover vcard" data-id="${r.id}">
        <div class="vcard-top"><span class="vcard-tag">${r.tag}</span><span class="badge badge-neutral">${r.status}</span></div>
        <div class="vcard-title">${r.title}</div>
        <div class="vcard-meta">${prioHTML(r.priority)}${avatarHTML(r.assignee)}</div>
      </div>`
    ).join("")}</div>`;
    this.addEventListener("click", (e) => {
      const card = e.target.closest(".vcard[data-id]");
      if (card) emitSelect(this, byId(card.dataset.id));
    });
  }
}
customElements.define("mz-view-grid", MzViewGrid);

// <mz-view-board></mz-view-board>, a Trello-style board: one column per status.
// Renders from this._records (set via setData), default RECORDS.
import { RECORDS, STATUSES, byId, emitSelect, prioHTML, avatarHTML } from "./data.js";

class MzViewBoard extends HTMLElement {
  connectedCallback() {
    this.classList.add("view", "board");
    this.addEventListener("click", (e) => {
      const card = e.target.closest(".board-card[data-id]");
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
    this.innerHTML = STATUSES.map((status) => {
      const items = recs.filter((r) => r.status === status);
      return `<div class="board-col">
        <div class="board-col-head">${status}<span>${items.length}</span></div>
        <div class="board-list">${items
          .map(
            (r) => `<div class="board-card" data-id="${r.id}">
              <div class="board-card-title">${r.title}</div>
              <div class="board-card-meta">${prioHTML(r.priority)}${avatarHTML(r.assignee)}</div>
            </div>`
          )
          .join("")}<button class="board-add" type="button">+ Add</button></div>
      </div>`;
    }).join("");
  }
}
customElements.define("mz-view-board", MzViewBoard);

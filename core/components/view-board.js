// <mz-view-board></mz-view-board>, a Trello-style board: one column per status,
// cards grouped into them. Scrolls horizontally inside the page width.
import { RECORDS, STATUSES, byId, emitSelect, prioHTML, avatarHTML } from "./data.js";

class MzViewBoard extends HTMLElement {
  connectedCallback() {
    this.classList.add("view", "board");
    this.innerHTML = STATUSES.map((status) => {
      const items = RECORDS.filter((r) => r.status === status);
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
    this.addEventListener("click", (e) => {
      const card = e.target.closest(".board-card[data-id]");
      if (card) emitSelect(this, byId(card.dataset.id));
    });
  }
}
customElements.define("mz-view-board", MzViewBoard);

// <mz-view-todo></mz-view-todo>, a to-do/checklist perspective. Renders from
// this._records (set via setData), default RECORDS.
import { RECORDS, byId, emitSelect, prioHTML, avatarHTML } from "./data.js";

class MzViewTodo extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.addEventListener("click", (e) => {
      if (e.target.closest(".todo-check")) {
        const row = e.target.closest(".todo-item");
        row.classList.toggle("is-done", e.target.checked);
        return;
      }
      const t = e.target.closest(".todo-title");
      if (t) emitSelect(this, byId(t.closest(".todo-item").dataset.id));
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
      ? `<div class="todo">${recs
          .map(
            (r) => `<div class="todo-item${r.status === "Done" ? " is-done" : ""}" data-id="${r.id}">
        <input type="checkbox" class="checkbox todo-check" ${r.status === "Done" ? "checked" : ""} aria-label="Done" />
        <button type="button" class="todo-title">${r.title}</button>
        ${prioHTML(r.priority)}
        ${avatarHTML(r.assignee)}
      </div>`
          )
          .join("")}</div>`
      : `<mz-empty heading="Nothing here">No items match the current filters.</mz-empty>`;
  }
}
customElements.define("mz-view-todo", MzViewTodo);

// <mz-view-todo></mz-view-todo>, a to-do/checklist perspective. The checkbox
// toggles done; clicking the title opens the object.
import { RECORDS, byId, emitSelect, prioHTML, avatarHTML } from "./data.js";

class MzViewTodo extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.innerHTML = `<div class="todo">${RECORDS.map(
      (r) => `<div class="todo-item${r.status === "Done" ? " is-done" : ""}" data-id="${r.id}">
        <input type="checkbox" class="checkbox todo-check" ${r.status === "Done" ? "checked" : ""} aria-label="Done" />
        <button type="button" class="todo-title">${r.title}</button>
        ${prioHTML(r.priority)}
        ${avatarHTML(r.assignee)}
      </div>`
    ).join("")}</div>`;
    this.addEventListener("click", (e) => {
      if (e.target.closest(".todo-check")) {
        const row = e.target.closest(".todo-item");
        row.classList.toggle("is-done", e.target.checked);
        return;
      }
      const t = e.target.closest(".todo-title");
      if (t) emitSelect(this, byId(t.closest(".todo-item").dataset.id));
    });
  }
}
customElements.define("mz-view-todo", MzViewTodo);

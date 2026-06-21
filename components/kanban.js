// <mz-kanban></mz-kanban> — board with columns and cards (sample).
const COLS = [
  ["Backlog", [["Reconcile Q2 invoices", "Finance"], ["Onboard new hire", "HR"], ["Renew QuickBooks token", "Ops"]]],
  ["In progress", [["June payroll run", "Payroll"], ["Sikka sync fix", "Eng"]]],
  ["Review", [["Pay instructions — batch 14", "Review"]]],
  ["Done", [["May payroll filed", "Payroll"], ["Connect Gusto", "Ops"]]],
];
class MzKanban extends HTMLElement {
  connectedCallback() {
    this.classList.add("kanban");
    this.innerHTML = COLS.map(
      ([name, cards]) => `<div class="kanban-col">
        <div class="kanban-col-head">${name}</div>
        <div class="kanban-list">${cards
          .map(([t, tag]) => `<div class="kanban-card"><div class="kanban-card-title">${t}</div><span class="kanban-tag">${tag}</span></div>`)
          .join("")}</div>
      </div>`
    ).join("");
  }
}
customElements.define("mz-kanban", MzKanban);

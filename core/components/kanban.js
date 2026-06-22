// <mz-kanban></mz-kanban>, board with columns and cards (sample). Each card
// shows a title, a priority indicator, and an assignee.
// Card tuple: [title, priority ("high"|"medium"|"low"), assignee]
const COLS = [
  ["Backlog", [
    ["Reconcile Q2 invoices", "high", "Dana Reyes"],
    ["Onboard new hire", "low", "Marcus Lin"],
    ["Renew QuickBooks token", "medium", "Priya Anand"],
  ]],
  ["In progress", [
    ["June payroll run", "high", "Dana Reyes"],
    ["Sikka sync fix", "medium", "Sam Okafor"],
  ]],
  ["Review", [
    ["Pay instructions, batch 14", "high", "Priya Anand"],
  ]],
  ["Done", [
    ["May payroll filed", "low", "Dana Reyes"],
    ["Connect Gusto", "medium", "Marcus Lin"],
  ]],
];

const PRIO = { high: "High", medium: "Medium", low: "Low" };
const initials = (name) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

class MzKanban extends HTMLElement {
  connectedCallback() {
    this.classList.add("kanban");
    this.innerHTML = COLS.map(
      ([name, cards]) => `<div class="kanban-col">
        <div class="kanban-col-head">${name}<span>${cards.length}</span></div>
        <div class="kanban-list">${cards
          .map(
            ([title, prio, assignee]) => `<div class="kanban-card">
              <div class="kanban-card-title">${title}</div>
              <div class="kanban-card-meta">
                <span class="kanban-prio"><span class="kanban-prio-dot kanban-prio-${prio}"></span>${PRIO[prio]}</span>
                <span class="kanban-assignee"><span class="kanban-av" aria-hidden="true">${initials(assignee)}</span>${assignee}</span>
              </div>
            </div>`
          )
          .join("")}</div>
      </div>`
    ).join("");
  }
}
customElements.define("mz-kanban", MzKanban);

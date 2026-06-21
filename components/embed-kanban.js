// <mz-embed-kanban></mz-embed-kanban>, a compact display-only mini board for
// embedding in Slack / MCP surfaces. No inputs.
import { SPARK } from "./spark.js";

const COLS = [
  ["To do", [["Reconcile Q2 invoices", "warn"], ["Renew QuickBooks token", "mute"]]],
  ["Doing", [["June payroll run", "volt"]]],
  ["Done", [["May payroll filed", "ok"], ["Connect Gusto", "ok"]]],
];

class MzEmbedKanban extends HTMLElement {
  connectedCallback() {
    this.classList.add("embed", "embed-kanban");
    const cols = COLS.map(
      ([name, cards]) =>
        `<div class="ek-col"><div class="ek-col-head">${name}<span>${cards.length}</span></div>${cards
          .map(([t, c]) => `<div class="ek-card"><span class="ek-dot ek-dot-${c}"></span>${t}</div>`)
          .join("")}</div>`
    ).join("");
    this.innerHTML = `
      <div class="embed-head"><span class="embed-mark">${SPARK}</span><span class="embed-title">Finance board</span><span class="embed-meta">5 tasks</span></div>
      <div class="embed-kanban-cols">${cols}</div>`;
  }
}
customElements.define("mz-embed-kanban", MzEmbedKanban);

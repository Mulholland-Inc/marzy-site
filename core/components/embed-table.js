// <mz-embed-table></mz-embed-table>, a compact display-only table card for
// embedding in Slack / MCP surfaces. No inputs.
import { SPARK } from "./spark.js";

const ROWS = [
  ["Amara Okonkwo", "Operations", "$6,400", "success", "Paid"],
  ["Priya Nair", "Finance", "$7,100", "neutral", "Pending"],
  ["Diego Marín", "Warehouse", "$4,200", "success", "Paid"],
  ["Lena Hofer", "Support", "$3,600", "warning", "On leave"],
];

class MzEmbedTable extends HTMLElement {
  connectedCallback() {
    this.classList.add("embed", "embed-table");
    const rows = ROWS.map(
      ([name, role, pay, variant, label]) =>
        `<tr><td><b>${name}</b></td><td class="muted">${role}</td><td class="num">${pay}</td><td><span class="badge badge-${variant}">${label}</span></td></tr>`
    ).join("");
    this.innerHTML = `
      <div class="embed-head"><span class="embed-mark">${SPARK}</span><span class="embed-title">June payroll</span><span class="embed-meta">14 people</span></div>
      <table class="embed-tbl"><thead><tr><th>Employee</th><th>Role</th><th class="num">Pay</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
}
customElements.define("mz-embed-table", MzEmbedTable);

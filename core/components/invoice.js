// <mz-invoice></mz-invoice>, invoice document (sample).
import { SPARK } from "./spark.js";
const LINES = [
  ["Back-office automation, Team plan", "1", "$499.00", "$499.00"],
  ["Additional connectors (3)", "3", "$40.00", "$120.00"],
  ["Onboarding & setup", "1", "$750.00", "$750.00"],
];
const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2 });
class MzInvoice extends HTMLElement {
  connectedCallback() {
    this.classList.add("document");
    const subtotal = 1369;
    const tax = +(subtotal * 0.0875).toFixed(2);
    const total = subtotal + tax;
    const rows = LINES.map(
      ([desc, qty, rate, amt]) =>
        `<tr><td>${desc}</td><td class="num">${qty}</td><td class="num">${rate}</td><td class="num">${amt}</td></tr>`
    ).join("");
    this.innerHTML = `
      <div class="invoice-top">
        <div>
          <span class="logo"><span class="spark" aria-hidden="true">${SPARK}</span><span>Marzy</span></span>
          <p class="invoice-from">Marzy, Inc.<br />2261 Market St #4988<br />San Francisco, CA 94114</p>
        </div>
        <div class="invoice-meta">
          <div class="invoice-title">Invoice</div>
          <p><b>#INV-2026-0142</b><br />Issued Jun 15, 2026<br />Due Jul 15, 2026</p>
        </div>
      </div>
      <div class="invoice-parties">
        <div><div class="invoice-label">Billed to</div><p><b>Lazarco Inc.</b><br />Attn: Dana Reyes<br />1400 Industrial Rd<br />Reno, NV 89502</p></div>
        <div><div class="invoice-label">Payment</div><p><b>Net 30</b><br />ACH / wire on file<br />billing@marzy.com</p></div>
      </div>
      <table class="inv-table">
        <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="invoice-totals">
        <div class="row"><span>Subtotal</span><b>${money(subtotal)}</b></div>
        <div class="row"><span>Tax (8.75%)</span><b>${money(tax)}</b></div>
        <div class="row total"><span>Total due</span><b>${money(total)}</b></div>
      </div>
      <p class="invoice-note">Thank you. Questions about this invoice? Email billing@marzy.com.</p>`;
  }
}
customElements.define("mz-invoice", MzInvoice);

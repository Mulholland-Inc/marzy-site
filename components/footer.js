// <mz-footer></mz-footer>, marketing footer. Columns + a thin legal strip,
// all read from the shared site-map so links stay in sync across pages.
import { SPARK } from "./spark.js";
import { FOOTER_COLS, LEGAL, HOME, COPYRIGHT } from "./site-map.js";

class MzFooter extends HTMLElement {
  connectedCallback() {
    this.classList.add("footer");
    const cols = FOOTER_COLS.map(
      ([heading, links]) => `
          <nav class="footer-col" aria-label="${heading}">
            <p class="footer-h">${heading}</p>
            ${links.map(([h, t]) => `<a href="${h}">${t}</a>`).join("\n            ")}
          </nav>`
    ).join("");
    const legal = LEGAL.map(([h, t]) => `<a href="${h}">${t}</a>`).join("");
    this.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="logo" href="${HOME}"><span class="spark" aria-hidden="true">${SPARK}</span><span>Marzy</span></a>
            <p class="footer-tag">The back office, on autopilot.</p>
          </div>${cols}
        </div>
        <div class="footer-bottom">
          <span class="footer-copy">${COPYRIGHT}</span>
          <nav class="footer-legal" aria-label="Legal">${legal}</nav>
        </div>
      </div>`;
  }
}
customElements.define("mz-footer", MzFooter);

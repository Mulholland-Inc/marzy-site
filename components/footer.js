// <mz-footer></mz-footer>, marketing footer.
import { SPARK } from "./spark.js";
class MzFooter extends HTMLElement {
  connectedCallback() {
    this.classList.add("footer");
    this.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="logo"><span class="spark" aria-hidden="true">${SPARK}</span><span>Marzy</span></span>
            <p class="footer-tag">The back office, on autopilot.</p>
          </div>
          <nav class="footer-col" aria-label="Product">
            <p class="footer-h">Product</p>
            <a href="#">How it works</a>
            <a href="#">Security</a>
            <a href="#">Pricing</a>
          </nav>
          <nav class="footer-col" aria-label="Company">
            <p class="footer-h">Company</p>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </nav>
          <nav class="footer-col" aria-label="Legal">
            <p class="footer-h">Legal</p>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </nav>
        </div>
      </div>`;
  }
}
customElements.define("mz-footer", MzFooter);

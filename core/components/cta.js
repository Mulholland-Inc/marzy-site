// <mz-cta heading="…" sub="…"></mz-cta>, dark call-to-action band (marketing).
import { ROUTES } from "./site-config.js";
class MzCta extends HTMLElement {
  connectedCallback() {
    this.classList.add("ctaband");
    const heading = this.getAttribute("heading") || "Stop running the back office.";
    const sub =
      this.getAttribute("sub") ||
      "Let Marzy run it. See your own workflows automated in a 30-minute demo.";
    this.innerHTML = `
      <div class="ctaband-copy">
        <h2>${heading}</h2>
        <p>${sub}</p>
      </div>
      <div class="ctaband-actions">
        <a class="btn btn-primary" href="${ROUTES.demo}">Get a demo</a>
        <a class="btn ctaband-ghost" href="${ROUTES.contact}">Talk to us</a>
      </div>`;
  }
}
customElements.define("mz-cta", MzCta);

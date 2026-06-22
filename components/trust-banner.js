// <mz-trust-banner></mz-trust-banner>, a dark compliance banner: the standards
// set as big type with a short trust line.
import { ROUTES } from "./site-map.js";
class MzTrustBanner extends HTMLElement {
  connectedCallback() {
    this.classList.add("trustbanner");
    const dot = '<span class="trustbanner-dot">·</span>';
    this.innerHTML = `
      <h2 class="trustbanner-title">SOC 2 ${dot} HIPAA ${dot} ISO 27001</h2>
      <p class="trustbanner-sub">Independently audited, encrypted end to end, and always yours.</p>
      <div class="actions"><a class="btn btn-primary" href="${ROUTES.trust}">Visit trust portal</a></div>`;
  }
}
customElements.define("mz-trust-banner", MzTrustBanner);

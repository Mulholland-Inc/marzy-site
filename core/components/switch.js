// <mz-switch label="Auto-run trusted flows" checked></mz-switch>
import { flipKnob } from "./motion.js";
class MzSwitch extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || this.textContent.trim();
    const checked = this.hasAttribute("checked");
    this.innerHTML = `<div class="switch-row"><span>${label}</span><button type="button" class="switch" role="switch" aria-checked="${checked}" aria-label="${label}"><span class="switch-knob"></span></button></div>`;
    const btn = this.querySelector(".switch");
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-checked") !== "true";
      btn.setAttribute("aria-checked", on ? "true" : "false");
      flipKnob(btn, on);
    });
  }
}
customElements.define("mz-switch", MzSwitch);

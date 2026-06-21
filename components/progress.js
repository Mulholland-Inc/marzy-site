// <mz-progress value="68" label="June payroll"></mz-progress>
class MzProgress extends HTMLElement {
  connectedCallback() {
    const value = Math.max(0, Math.min(100, Number(this.getAttribute("value") || 0)));
    const label = this.getAttribute("label") || "";
    this.innerHTML =
      `${label ? `<div class="progress-row"><span>${label}</span><b>${value}%</b></div>` : ""}<div class="progress"><div class="progress-bar" style="width:${value}%"></div></div>`;
  }
}
customElements.define("mz-progress", MzProgress);

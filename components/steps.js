// <mz-steps steps="Connect,Map,Automate,Scale" current="2"></mz-steps>
// A horizontal process stepper. Steps before `current` are done, the rest
// upcoming. Display only.
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>';

class MzSteps extends HTMLElement {
  connectedCallback() {
    this.classList.add("steps");
    const labels = (this.getAttribute("steps") || "Connect,Map,Automate,Scale")
      .split(",")
      .map((s) => s.trim());
    const current = parseInt(this.getAttribute("current") || "2", 10);
    this.innerHTML = labels
      .map((label, i) => {
        const state = i < current ? "is-done" : i === current ? "is-current" : "";
        const mark = i < current ? CHECK : i + 1;
        return `<div class="step ${state}"><span class="step-dot">${mark}</span><span class="step-label">${label}</span></div>`;
      })
      .join("");
  }
}
customElements.define("mz-steps", MzSteps);

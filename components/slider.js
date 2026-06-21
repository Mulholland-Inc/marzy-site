// <mz-slider label="Max concurrency" min="0" max="100" value="40" suffix="%"></mz-slider>
class MzSlider extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const min = Number(this.getAttribute("min") ?? 0);
    const max = Number(this.getAttribute("max") ?? 100);
    const value = Number(this.getAttribute("value") ?? min);
    const suffix = this.getAttribute("suffix") || "";
    this.innerHTML =
      `${label ? `<div class="slider-row"><span>${label}</span><b data-out>${value}${suffix}</b></div>` : ""}<input class="slider" type="range" min="${min}" max="${max}" value="${value}" />`;
    const input = this.querySelector(".slider");
    const out = this.querySelector("[data-out]");
    const paint = () => {
      const pct = ((input.value - min) / (max - min)) * 100;
      input.style.setProperty(
        "--track-bg",
        `linear-gradient(var(--color-volt),var(--color-volt)) 0/${pct}% 100% no-repeat, var(--color-surface-2)`
      );
      if (out) out.textContent = `${input.value}${suffix}`;
    };
    input.addEventListener("input", paint);
    paint();
  }
}
customElements.define("mz-slider", MzSlider);

// <mz-logos></mz-logos>, "trusted by" logo cloud (marketing). Wordmarks stand
// in for real logos.
const LOGOS = ["Lazarco", "Northwind", "Meridian Health", "Sikka", "Brightpath", "Vanta"];

class MzLogos extends HTMLElement {
  connectedCallback() {
    this.classList.add("logos");
    this.innerHTML = `
      <span class="logos-cap">Trusted by back offices at</span>
      <div class="logos-row">${LOGOS.map((l) => `<span class="logos-item">${l}</span>`).join("")}</div>`;
  }
}
customElements.define("mz-logos", MzLogos);

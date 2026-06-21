// <mz-grid cols="2|3|4">...</mz-grid>
class MzGrid extends HTMLElement {
  connectedCallback() {
    this.classList.add("grid", `grid-${this.getAttribute("cols") || "3"}`);
  }
}
customElements.define("mz-grid", MzGrid);

// <mz-grid cols="2|3|4" align="center|start|end">...</mz-grid>
// align sets vertical alignment of cells (default: stretch).
class MzGrid extends HTMLElement {
  connectedCallback() {
    this.classList.add("grid", `grid-${this.getAttribute("cols") || "3"}`);
    const align = this.getAttribute("align");
    if (align) this.classList.add(`grid-v${align}`);
  }
}
customElements.define("mz-grid", MzGrid);

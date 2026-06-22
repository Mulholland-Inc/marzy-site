// <mz-container width="wide|narrow|default">...</mz-container>
class MzContainer extends HTMLElement {
  connectedCallback() {
    const w = this.getAttribute("width");
    this.classList.add(
      w === "wide" ? "container-wide" : w === "narrow" ? "container-narrow" : "container"
    );
  }
}
customElements.define("mz-container", MzContainer);

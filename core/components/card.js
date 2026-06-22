// <mz-card hover>...</mz-card>
class MzCard extends HTMLElement {
  connectedCallback() {
    this.classList.add("card");
    if (this.hasAttribute("hover")) this.classList.add("card-hover");
  }
}
customElements.define("mz-card", MzCard);

// <mz-actions>...buttons/links...</mz-actions>
class MzActions extends HTMLElement {
  connectedCallback() {
    this.classList.add("actions");
  }
}
customElements.define("mz-actions", MzActions);

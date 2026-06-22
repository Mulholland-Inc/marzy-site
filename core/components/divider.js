// <mz-divider></mz-divider>
class MzDivider extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<hr class="divider" />`;
  }
}
customElements.define("mz-divider", MzDivider);

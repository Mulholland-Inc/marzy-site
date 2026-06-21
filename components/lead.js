// <mz-lead>large intro paragraph</mz-lead>
class MzLead extends HTMLElement {
  connectedCallback() {
    this.classList.add("lead");
  }
}
customElements.define("mz-lead", MzLead);

// <mz-muted>secondary text</mz-muted>
class MzMuted extends HTMLElement {
  connectedCallback() {
    this.classList.add("muted");
  }
}
customElements.define("mz-muted", MzMuted);

// <mz-meta>mono caption / metadata line</mz-meta>
class MzMeta extends HTMLElement {
  connectedCallback() {
    this.classList.add("meta");
  }
}
customElements.define("mz-meta", MzMeta);

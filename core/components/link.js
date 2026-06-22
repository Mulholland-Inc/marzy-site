// <mz-link href="...">label</mz-link>
class MzLink extends HTMLElement {
  connectedCallback() {
    const href = this.getAttribute("href") || "#";
    this.innerHTML = `<a class="link" href="${href}">${this.innerHTML}</a>`;
  }
}
customElements.define("mz-link", MzLink);

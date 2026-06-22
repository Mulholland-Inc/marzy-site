// <mz-actions align="center|end">...buttons/links...</mz-actions>
class MzActions extends HTMLElement {
  connectedCallback() {
    this.classList.add("actions");
    const align = this.getAttribute("align");
    if (align === "center") this.classList.add("actions-center");
    else if (align === "end") this.classList.add("actions-end");
  }
}
customElements.define("mz-actions", MzActions);

// <mz-stack gap="6" center>…</mz-stack>
// Vertical rhythm primitive: stacks its children with a token-sized gap so
// pages never need inline styles for spacing. gap maps to the space scale
// (2,3,4,5,6,8,10,12); default 5. center centers the column and its text.
class MzStack extends HTMLElement {
  connectedCallback() {
    this.classList.add("stack");
    const gap = this.getAttribute("gap");
    if (gap) this.classList.add(`stack-${gap}`);
    if (this.hasAttribute("center")) this.classList.add("stack-center");
  }
}
customElements.define("mz-stack", MzStack);

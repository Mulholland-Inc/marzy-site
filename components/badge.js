// <mz-badge variant="success|warning|danger|neutral|info">Label</mz-badge>
class MzBadge extends HTMLElement {
  connectedCallback() {
    this.classList.add("badge", `badge-${this.getAttribute("variant") || "neutral"}`);
  }
}
customElements.define("mz-badge", MzBadge);

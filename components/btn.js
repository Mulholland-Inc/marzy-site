// <mz-btn variant="primary|outline|ghost" arrow href="..." type="submit">Label</mz-btn>
// Renders an <a> when href is present, otherwise a <button>.
class MzBtn extends HTMLElement {
  connectedCallback() {
    const variant = this.getAttribute("variant") || "primary";
    const href = this.getAttribute("href");
    const type = this.getAttribute("type") || "button";
    const classes = ["btn", `btn-${variant}`];
    if (this.hasAttribute("arrow")) classes.push("btn-arrow");
    const tag = href ? "a" : "button";
    const attr = href ? ` href="${href}"` : ` type="${type}"`;
    this.innerHTML = `<${tag} class="${classes.join(" ")}"${attr}>${this.innerHTML}</${tag}>`;
  }
}
customElements.define("mz-btn", MzBtn);

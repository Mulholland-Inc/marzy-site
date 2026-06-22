// <mz-field label="Email" type="email|textarea|…" placeholder="…" for="id" hint="…"></mz-field>
class MzField extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const type = this.getAttribute("type") || "text";
    const ph = this.getAttribute("placeholder") || "";
    const id = this.getAttribute("for") || "";
    const hint = this.getAttribute("hint") || "";
    this.classList.add("field");
    const labelHtml = label
      ? `<label class="field-label"${id ? ` for="${id}"` : ""}>${label}</label>`
      : "";
    const control =
      type === "textarea"
        ? `<textarea class="input" rows="3"${id ? ` id="${id}"` : ""}${ph ? ` placeholder="${ph}"` : ""}></textarea>`
        : `<input class="input" type="${type}"${id ? ` id="${id}"` : ""}${ph ? ` placeholder="${ph}"` : ""} />`;
    const hintHtml = hint ? `<span class="field-hint">${hint}</span>` : "";
    this.innerHTML = `${labelHtml}${control}${hintHtml}`;
  }
}
customElements.define("mz-field", MzField);

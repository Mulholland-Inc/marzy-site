// <mz-field label="Email" type="email" placeholder="..." for="id"></mz-field>
class MzField extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const type = this.getAttribute("type") || "text";
    const ph = this.getAttribute("placeholder") || "";
    const id = this.getAttribute("for") || "";
    this.classList.add("field");
    const labelHtml = label
      ? `<label class="field-label"${id ? ` for="${id}"` : ""}>${label}</label>`
      : "";
    this.innerHTML =
      `${labelHtml}<input class="input" type="${type}"${id ? ` id="${id}"` : ""}${ph ? ` placeholder="${ph}"` : ""} />`;
  }
}
customElements.define("mz-field", MzField);

// <mz-radio-group label="Run mode" name="mode" options="Manual, Review, Auto" value="Review"></mz-radio-group>
let RID = 0;
class MzRadioGroup extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const name = this.getAttribute("name") || `mz-radio-${RID++}`;
    const value = this.getAttribute("value") || "";
    const options = (this.getAttribute("options") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    this.classList.add("field");
    const rows = options
      .map(
        (o) =>
          `<label class="radio-row"><input type="radio" name="${name}" value="${o}"${o === value ? " checked" : ""} /><span>${o}</span></label>`
      )
      .join("");
    this.innerHTML = `${label ? `<span class="field-label">${label}</span>` : ""}<div class="radio-group">${rows}</div>`;
  }
}
customElements.define("mz-radio-group", MzRadioGroup);

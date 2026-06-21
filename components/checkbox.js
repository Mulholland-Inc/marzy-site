// <mz-checkbox label="Weekly summary" checked></mz-checkbox>
class MzCheckbox extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || this.textContent.trim();
    const checked = this.hasAttribute("checked");
    this.innerHTML = `<label class="check-row"><input type="checkbox"${checked ? " checked" : ""} /><span>${label}</span></label>`;
  }
}
customElements.define("mz-checkbox", MzCheckbox);

// <mz-select label="Role"><option>Operations</option>…</mz-select>
class MzSelect extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const options = this.innerHTML;
    this.classList.add("field");
    const chev = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
    this.innerHTML =
      `${label ? `<span class="field-label">${label}</span>` : ""}<div class="select-wrap"><select class="input select">${options}</select>${chev}</div>`;
  }
}
customElements.define("mz-select", MzSelect);

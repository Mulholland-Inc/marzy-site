// <mz-select label="Role"><option>Operations</option>…</mz-select>
import { icon } from "./icons.js";
class MzSelect extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const options = this.innerHTML;
    this.classList.add("field");
    const chev = icon("chevron-down");
    this.innerHTML =
      `${label ? `<span class="field-label">${label}</span>` : ""}<div class="select-wrap"><select class="input select">${options}</select>${chev}</div>`;
  }
}
customElements.define("mz-select", MzSelect);

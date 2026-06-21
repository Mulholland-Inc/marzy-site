// <mz-datepicker label="Pay date" value="2026-06-15"></mz-datepicker>
const CAL =
  '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"/></svg>';
class MzDatepicker extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const value = this.getAttribute("value") || "";
    this.classList.add("field");
    this.innerHTML =
      `${label ? `<span class="field-label">${label}</span>` : ""}<div class="datepicker-wrap"><input class="input datepicker" type="date"${value ? ` value="${value}"` : ""} />${CAL}</div>`;
  }
}
customElements.define("mz-datepicker", MzDatepicker);

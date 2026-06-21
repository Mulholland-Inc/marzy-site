// <mz-accordion>
//   <mz-accordion-item q="Question?">Answer…</mz-accordion-item>
// </mz-accordion>
class MzAccordion extends HTMLElement {
  connectedCallback() {
    this.classList.add("accordion");
  }
}
class MzAccordionItem extends HTMLElement {
  connectedCallback() {
    const q = this.getAttribute("q") || "";
    const a = this.innerHTML;
    this.classList.add("acc-item");
    this.innerHTML = `<button type="button" class="acc-q">${q}<span class="acc-icon" aria-hidden="true"></span></button><div class="acc-a">${a}</div>`;
    this.querySelector(".acc-q").addEventListener("click", () => this.classList.toggle("is-open"));
  }
}
customElements.define("mz-accordion", MzAccordion);
customElements.define("mz-accordion-item", MzAccordionItem);

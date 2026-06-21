// <mz-empty heading="No connections yet" cta="Add a connection">Body…</mz-empty>
import { SPARK } from "./spark.js";
class MzEmpty extends HTMLElement {
  connectedCallback() {
    const heading = this.getAttribute("heading") || "";
    const cta = this.getAttribute("cta") || "";
    const body = this.innerHTML;
    this.classList.add("empty");
    this.innerHTML =
      `<span class="spark" aria-hidden="true">${SPARK}</span>${heading ? `<h3>${heading}</h3>` : ""}<p>${body}</p>${cta ? `<button class="btn btn-primary" type="button">${cta}</button>` : ""}`;
  }
}
customElements.define("mz-empty", MzEmpty);

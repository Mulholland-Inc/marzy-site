// <mz-alert variant="info|success|warning|danger"><b>Title</b><p>Body</p></mz-alert>
import { icon } from "./icons.js";
const A_ICON = {
  info: icon("info"),
  success: icon("circle-check"),
  warning: icon("triangle-alert"),
  danger: icon("circle-alert"),
};
class MzAlert extends HTMLElement {
  connectedCallback() {
    const v = this.getAttribute("variant") || "info";
    this.classList.add("alert", `alert-${v}`);
    this.innerHTML = `${A_ICON[v] || A_ICON.info}<div>${this.innerHTML}</div>`;
  }
}
customElements.define("mz-alert", MzAlert);

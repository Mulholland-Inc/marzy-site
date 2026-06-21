// <mz-bars values="6,9,7,12,10,14,11" label="…" caption="…"></mz-bars>
// A compact, display-only bar chart. The latest bar is accented.
class MzBars extends HTMLElement {
  connectedCallback() {
    this.classList.add("bars");
    const label = this.getAttribute("label") || "Weekly runs";
    const caption = this.getAttribute("caption") || "Last 7 weeks";
    const vals = (this.getAttribute("values") || "6,9,7,12,10,14,11")
      .split(",")
      .map((n) => parseFloat(n.trim()))
      .filter((n) => !isNaN(n));
    const max = Math.max(...vals, 1);
    const bars = vals
      .map(
        (v, i) =>
          `<span class="bar${i === vals.length - 1 ? " is-last" : ""}" style="height:${Math.max(6, (v / max) * 100)}%" title="${v}"></span>`
      )
      .join("");
    this.innerHTML = `
      <div class="bars-head"><span class="bars-label">${label}</span><span class="bars-value">${vals[vals.length - 1] ?? ""}</span></div>
      <div class="bars-chart">${bars}</div>
      <div class="bars-caption">${caption}</div>`;
  }
}
customElements.define("mz-bars", MzBars);

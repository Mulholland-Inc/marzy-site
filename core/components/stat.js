// <mz-stat value="40+" label="connected systems"></mz-stat>
// A single metric: big display figure over a muted label. Drop several into a
// <mz-grid> for a stats band.
class MzStat extends HTMLElement {
  connectedCallback() {
    this.classList.add("stat");
    const value = this.getAttribute("value") || "";
    const label = this.getAttribute("label") || this.innerHTML;
    this.innerHTML = `<span class="stat-value">${value}</span><span class="stat-label t-meta">${label}</span>`;
  }
}
customElements.define("mz-stat", MzStat);

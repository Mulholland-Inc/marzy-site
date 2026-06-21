// <mz-stat label="…" value="…" delta="+12%" trend="up|down|flat" caption="…">
// A KPI / metric card with a trend delta.
class MzStat extends HTMLElement {
  connectedCallback() {
    this.classList.add("stat");
    const label = this.getAttribute("label") || "Workflows run";
    const value = this.getAttribute("value") || "1,284";
    const delta = this.getAttribute("delta") || "+12%";
    const trend = this.getAttribute("trend") || "up";
    const caption = this.getAttribute("caption") || "vs. last month";
    const arrow = trend === "down" ? "↓" : trend === "flat" ? "→" : "↑";
    this.innerHTML = `
      <div class="stat-label">${label}</div>
      <div class="stat-row">
        <span class="stat-value">${value}</span>
        <span class="stat-delta stat-${trend}">${arrow} ${delta}</span>
      </div>
      <div class="stat-caption">${caption}</div>`;
  }
}
customElements.define("mz-stat", MzStat);

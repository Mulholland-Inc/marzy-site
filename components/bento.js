// <mz-bento></mz-bento> — dashboard widget grid (app).
const BARS = [38, 52, 47, 63, 58, 71, 90];
const FEED = [
  ["Pay run drafted — June payroll", "2m ago"],
  ["QuickBooks synced — 142 records", "1h ago"],
  ["New connection — Gusto", "3h ago"],
  ["Review cleared — 4 items", "Yesterday"],
];
class MzBento extends HTMLElement {
  connectedCallback() {
    this.classList.add("bento");
    const bars = BARS.map((h) => `<span style="height:${h}%"></span>`).join("");
    const feed = FEED.map(([t, time]) => `<div class="activity-item"><span>${t}</span><time>${time}</time></div>`).join("");
    this.innerHTML = `
      <div class="stat"><div class="stat-label">Workflows run</div><div class="stat-value">1,284</div></div>
      <div class="stat"><div class="stat-label">Hours saved</div><div class="stat-value">312</div></div>
      <div class="stat"><div class="stat-label">Awaiting review</div><div class="stat-value">7</div></div>
      <div class="card col-2"><h3>Workflows this week</h3><div class="bento-chart">${bars}</div></div>
      <div class="card"><h3>Recent activity</h3><div class="activity">${feed}</div></div>`;
  }
}
customElements.define("mz-bento", MzBento);

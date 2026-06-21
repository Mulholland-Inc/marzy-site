// <mz-activity></mz-activity> — recent-activity feed card (app).
const FEED = [
  ["Pay run drafted — June payroll", "2m ago"],
  ["QuickBooks synced — 142 records", "1h ago"],
  ["New connection — Gusto", "3h ago"],
  ["Review cleared — 4 items", "Yesterday"],
];
class MzActivity extends HTMLElement {
  connectedCallback() {
    this.classList.add("card");
    const feed = FEED.map(
      ([t, time]) => `<div class="activity-item"><span>${t}</span><time>${time}</time></div>`
    ).join("");
    this.innerHTML = `<h3>Recent activity</h3><div class="activity">${feed}</div>`;
  }
}
customElements.define("mz-activity", MzActivity);

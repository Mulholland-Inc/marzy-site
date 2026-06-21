// <mz-dashboard></mz-dashboard>, the application environment: sidebar + content.
// A full-size take on the client-portal preview, status cards over a live feed.
import { SPARK } from "./spark.js";

const CARDS = [
  ["June payroll", "Drafted from 14 timesheets, hours matched to employees.", "pending", "Needs approval"],
  ["March books", "412 transactions reconciled, 3 flagged for review.", "done", "Closed"],
  ["Clinic eligibility", "38 patients verified for Tuesday, prior-auths filed.", "done", "Done"],
];
const FEED = [
  [true, "Marzy drafted the June pay run from 14 inbox items", "2m"],
  [false, "QuickBooks synced, 142 records updated", "1h"],
  [true, "Marzy filed 2 prior-auth requests with the payer", "3h"],
  [false, "New connection added, Gusto", "Yesterday"],
];

class MzDashboard extends HTMLElement {
  connectedCallback() {
    this.classList.add("appshell");
    const cards = CARDS.map(
      ([label, meta, status, tag]) =>
        `<div class="dash-card"><span class="dash-card-label">${label}</span><span class="dash-card-meta">${meta}</span><span class="dash-status dash-status-${status}">${tag}</span></div>`
    ).join("");
    const feed = FEED.map(
      ([marzy, text, time]) =>
        `<div class="dash-row">${marzy ? `<span class="dash-row-spark">${SPARK}</span>` : `<span class="dash-row-dot"></span>`}<span class="dash-row-text">${text}</span><span class="dash-row-time">${time}</span></div>`
    ).join("");
    this.innerHTML = `
      <mz-sidebar></mz-sidebar>
      <div class="appshell-main">
        <div class="appshell-topbar">
          <span class="appshell-title">Overview</span>
          <mz-btn variant="primary" size="sm">New connection</mz-btn>
        </div>
        <div class="appshell-body">
          <div class="dash-cards">${cards}</div>
          <div class="dash-feed">
            <div class="dash-feed-head">Recent activity</div>
            ${feed}
          </div>
        </div>
      </div>`;
  }
}
customElements.define("mz-dashboard", MzDashboard);

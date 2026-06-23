// <mz-activity></mz-activity>, a detailed activity timeline card (app). Each
// entry shows the actor (Marzy or a teammate), a rich action line with the
// subject, an optional detail, and a timestamp — connected as a timeline.
import { SPARK } from "./spark.js";

const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

// [actor, isMarzy, action-html, detail, time]
const FEED = [
  ["Marzy", true, "Drafted <b>June payroll</b> from 14 timesheets", "Hours matched to every employee — awaiting your approval.", "2m ago"],
  ["Dana Reyes", false, "Approved <b>Pay instructions, batch 14</b>", "", "40m ago"],
  ["Marzy", true, "Reconciled <b>412 transactions</b> in the March books", "Flagged 3 for review; the rest closed clean.", "1h ago"],
  ["Marzy", true, "Synced <b>QuickBooks</b>", "142 records updated.", "3h ago"],
  ["Priya Anand", false, "Renewed the <b>QuickBooks</b> connection", "", "5h ago"],
  ["Marzy", true, "Filed <b>2 prior-auth requests</b> with the payer", "", "Yesterday"],
];

class MzActivity extends HTMLElement {
  connectedCallback() {
    this.classList.add("card");
    const items = FEED.map(
      ([actor, isMarzy, action, detail, time]) => `
      <li class="feed-item">
        <span class="feed-avatar ${isMarzy ? "feed-avatar-marzy" : ""}" aria-hidden="true">${isMarzy ? SPARK : initials(actor)}</span>
        <div class="feed-body">
          <p class="feed-action"><span class="feed-actor">${actor}</span> ${action}</p>
          ${detail ? `<p class="feed-detail">${detail}</p>` : ""}
          <time class="feed-time">${time}</time>
        </div>
      </li>`
    ).join("");
    this.innerHTML = `<h3>Activity</h3><ol class="feed">${items}</ol>`;
  }
}
customElements.define("mz-activity", MzActivity);

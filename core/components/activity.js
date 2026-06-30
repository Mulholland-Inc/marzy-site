// <mz-activity></mz-activity>, the workspace activity timeline — the recent
// commits across every object (GET /activity), newest first. Each entry shows
// the actor (Marzy when system-driven, else the person), what changed, and when.
import { SPARK } from "./spark.js";
import { api } from "../auth.js";
import { label } from "../catalog.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const initials = (n) =>
  String(n || "?")
    .split(/[\s@.]+/)
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
const relTime = (iso) => {
  const t = Date.parse(iso);
  if (!t) return "";
  const s = Math.max(1, (Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const action = (c) => {
  const t = `<b>${esc(label(c.type))}</b>`;
  if (c.op === "create") return `Created a ${t}`;
  if (c.op === "delete") return `Deleted a ${t}`;
  const fields = Object.keys(c.changes || {})
    .map(label)
    .join(", ");
  return `Updated a ${t}${fields ? ` — ${esc(fields)}` : ""}`;
};

class MzActivity extends HTMLElement {
  connectedCallback() {
    this.classList.add("card");
    this.innerHTML = `<h3>Activity</h3><ol class="feed"></ol>`;
    this._feed = this.querySelector(".feed");
    this.load();
  }

  async load() {
    let commits;
    try {
      commits = await api("/activity");
    } catch {
      this._feed.innerHTML = `<mz-empty heading="Couldn’t load activity">Try again in a moment.</mz-empty>`;
      return;
    }
    if (!commits.length) {
      this._feed.innerHTML = `<mz-empty heading="No activity yet">Changes to objects show up here.</mz-empty>`;
      return;
    }
    this._feed.innerHTML = commits
      .map((c) => {
        const who = c.author || "Marzy";
        const marzy = who === "Marzy";
        return `<li class="feed-item">
          <span class="feed-avatar ${marzy ? "feed-avatar-marzy" : ""}" aria-hidden="true">${marzy ? SPARK : initials(who)}</span>
          <div class="feed-body">
            <p class="feed-action"><span class="feed-actor">${esc(who)}</span> ${action(c)}</p>
            <time class="feed-time">${esc(relTime(c.created_at))}</time>
          </div>
        </li>`;
      })
      .join("");
  }
}
customElements.define("mz-activity", MzActivity);

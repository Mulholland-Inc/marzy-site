// <mz-view-month></mz-view-month>, a Notion-style month calendar: a Mon–Fri grid
// where each day lists the teams active that day — a small icon, the team name,
// and the team's member count (fixed per team, like the reference). Self-
// contained sample data (June 2026), the same pattern as <mz-calendar>. Clicking
// an entry emits mz-select so the host opens a detail pane.
import { emitSelect } from "./data.js";
import { icon } from "./icons.js";

const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Teams carry a fixed member count, shown on every occurrence (as in the
// reference, where each team's number is constant across the month).
const TEAMS = {
  finance: { name: "Finance", icon: "table", count: 4 },
  ops: { name: "Operations", icon: "settings", count: 12 },
  eng: { name: "Engineering", icon: "square-kanban", count: 6 },
  people: { name: "People", icon: "users", count: 4 },
};
// A stable pattern so most weekdays carry 1–2 teams, like the reference.
const teamsForDay = (d) => {
  switch (d % 5) {
    case 1: return [TEAMS.finance, TEAMS.ops];
    case 2: return [TEAMS.ops];
    case 3: return [TEAMS.finance, TEAMS.ops];
    case 4: return [TEAMS.people, TEAMS.ops];
    default: return [TEAMS.eng];
  }
};

const PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-6 6 6 6"/></svg>';
const NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 6 6 6-6 6"/></svg>';
const MORE = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';

const YEAR = 2026, MONTH = 5; // June 2026

class MzViewMonth extends HTMLElement {
  connectedCallback() {
    this.classList.add("view", "month-view");
    this._year = YEAR;
    this._month = MONTH;
    this.addEventListener("click", (e) => {
      const nav = e.target.closest("[data-nav]");
      if (nav) {
        this.shift(Number(nav.dataset.nav));
        return;
      }
      const ev = e.target.closest(".month-ev");
      if (ev) {
        emitSelect(this, {
          title: ev.dataset.title,
          status: "Scheduled",
          assignee: "Marzy",
          tag: ev.dataset.team,
          priority: "medium",
          due: ev.dataset.due,
        });
      }
    });
    this.render();
  }

  shift(delta) {
    let m = this._month + delta, y = this._year;
    if (m < 0) { m = 11; y--; }
    else if (m > 11) { m = 0; y++; }
    this._month = m;
    this._year = y;
    this.render();
  }

  render() {
    const first = new Date(this._year, this._month, 1);
    const startOffset = (first.getDay() + 6) % 7; // days back to Monday (Mon=0)
    const daysIn = new Date(this._year, this._month + 1, 0).getDate();
    const last = new Date(this._year, this._month, daysIn);
    const endOffset = (last.getDay() + 6) % 7;
    const total = startOffset + daysIn + (6 - endOffset); // whole Mon–Sun weeks

    const cells = [];
    for (let i = 0; i < total; i++) {
      const date = new Date(this._year, this._month, 1 - startOffset + i);
      const dow = (date.getDay() + 6) % 7; // Mon=0 .. Sun=6
      if (dow > 4) continue; // weekdays only
      const out = date.getMonth() !== this._month;
      const dnum = date.getDate();
      const due = `${MONTHS_SHORT[date.getMonth()]} ${dnum}`;
      const rows = teamsForDay(dnum)
        .map(
          (t) => `<button type="button" class="month-ev" data-team="${t.name}" data-title="${t.name} team — ${due}" data-due="${due}">
            ${icon(t.icon)}
            <span class="month-ev-name">${t.name} team</span>
            <span class="month-ev-count">${t.count}</span>
          </button>`
        )
        .join("");
      cells.push(`<div class="month-cell${out ? " is-out" : ""}">
          <span class="month-daynum">${dnum}</span>
          <div class="month-evs">${rows}</div>
        </div>`);
    }

    const label = `${MONTHS_LONG[this._month]} ${this._year}`;
    this.innerHTML = `
      <div class="month-head">
        <div class="month-title">${label}</div>
        <div class="month-nav">
          <button type="button" class="month-nav-btn" data-nav="-1" aria-label="Previous month">${PREV}</button>
          <button type="button" class="month-nav-btn" data-nav="1" aria-label="Next month">${NEXT}</button>
        </div>
        <button type="button" class="month-nav-btn month-more" aria-label="More">${MORE}</button>
      </div>
      <div class="month-weekdays">${WEEKDAYS.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="month-grid">${cells.join("")}</div>`;
  }
}
customElements.define("mz-view-month", MzViewMonth);

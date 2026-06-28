// <mz-view-month></mz-view-month>, a month calendar as a grid of day-cards on a
// gray panel (Mon–Fri). Each day lists its events — just a name and a time.
// Self-contained sample data (June 2026), the same pattern as <mz-calendar>.
// Clicking an event emits mz-select so the host opens a detail pane.
import { emitSelect } from "./data.js";

const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// [name, time] — a small pool, spread across the weekdays for texture.
const EVENTS = [
  ["Demo call", "9:00 AM"],
  ["Pay run review", "2:00 PM"],
  ["Team standup", "10:00 AM"],
  ["Vendor sync", "11:30 AM"],
  ["Onboarding call", "1:00 PM"],
  ["Invoices due", "9:00 AM"],
  ["1:1 with Sam", "3:00 PM"],
  ["Close the books", "4:00 PM"],
  ["Board prep", "11:00 AM"],
  ["Design review", "2:30 PM"],
];
const eventsForDay = (d) => {
  const evs = [EVENTS[d % EVENTS.length]];
  if (d % 3 === 0) evs.push(EVENTS[(d + 4) % EVENTS.length]);
  return evs;
};

const PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-6 6 6 6"/></svg>';
const NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 6 6 6-6 6"/></svg>';
const MORE = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';

const YEAR = 2026, MONTH = 5, TODAY = 28; // June 2026

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
          tag: "Event",
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
      const isToday = !out && dnum === TODAY && this._month === MONTH && this._year === YEAR;
      const due = `${MONTHS_SHORT[date.getMonth()]} ${dnum}`;
      const rows = eventsForDay(dnum)
        .map(
          ([name, time]) => `<button type="button" class="month-ev" data-title="${name}" data-due="${due} · ${time}">
            <span class="month-ev-name">${name}</span>
            <span class="month-ev-time">${time}</span>
          </button>`
        )
        .join("");
      cells.push(`<div class="month-cell${out ? " is-out" : ""}${isToday ? " is-today" : ""}">
          <span class="month-daynum">${dnum}</span>
          <div class="month-evs">${rows}</div>
        </div>`);
    }

    const label = `${MONTHS_LONG[this._month]} ${this._year}`;
    this.innerHTML = `
      <div class="month-head">
        <div class="month-nav">
          <button type="button" class="month-nav-btn" data-nav="-1" aria-label="Previous month">${PREV}</button>
          <button type="button" class="month-nav-btn" data-nav="1" aria-label="Next month">${NEXT}</button>
        </div>
        <div class="month-title">${label}</div>
        <button type="button" class="month-nav-btn month-more" aria-label="More">${MORE}</button>
      </div>
      <div class="month-scroll">
        <div class="month-weekdays">${WEEKDAYS.map((d) => `<span>${d}</span>`).join("")}</div>
        <div class="month-grid">${cells.join("")}</div>
      </div>`;
  }
}
customElements.define("mz-view-month", MzViewMonth);

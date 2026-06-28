// <mz-view-month></mz-view-month>, a Notion-style month calendar: a Mon–Fri grid
// where each day lists the teams with work due, each with a small icon and an
// item count. Renders from this._records (set via setData by the collection's
// toolbar query), defaulting to all RECORDS. Clicking an entry opens its record.
import { RECORDS, byId, emitSelect } from "./data.js";
import { icon } from "./icons.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TAG_ICON = {
  Finance: "table",
  Payroll: "table",
  Ops: "settings",
  People: "users",
  Eng: "square-kanban",
  Clinic: "activity",
  Legal: "file",
};
const PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-6 6 6 6"/></svg>';
const NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 6 6 6-6 6"/></svg>';

const YEAR = 2026, MONTH = 5, TODAY = 28; // June 2026, matches the sample data

const parseDue = (due) => {
  const m = String(due).match(/([A-Za-z]{3})\s+(\d{1,2})/);
  if (!m) return null;
  const mi = MONTHS.indexOf(m[1]);
  return mi < 0 ? null : { m: mi, d: Number(m[2]) };
};
// sample "items in this team" count — stable per record, just for texture
const evCount = (r) => 2 + ((r.id * 7) % 12);

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
      const ev = e.target.closest(".month-ev[data-id]");
      if (ev) emitSelect(this, byId(ev.dataset.id));
    });
    this.render();
  }

  setData(records) {
    this._records = records;
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
    const recs = this._records || RECORDS;
    const byDay = {};
    recs.forEach((r) => {
      const due = parseDue(r.due);
      if (due && due.m === this._month) (byDay[due.d] = byDay[due.d] || []).push(r);
    });

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
      const isToday = !out && date.getDate() === TODAY && this._month === MONTH && this._year === YEAR;
      const evs = out ? [] : byDay[date.getDate()] || [];
      const rows = evs
        .map(
          (r) => `<button type="button" class="month-ev" data-id="${r.id}">
            ${icon(TAG_ICON[r.tag] || "square-kanban")}
            <span class="month-ev-name">${r.tag} team</span>
            <span class="month-ev-count">${evCount(r)}</span>
          </button>`
        )
        .join("");
      cells.push(`<div class="month-cell${out ? " is-out" : ""}${isToday ? " is-today" : ""}">
          <span class="month-daynum">${date.getDate()}</span>
          <div class="month-evs">${rows}</div>
        </div>`);
    }

    const label = `${new Date(this._year, this._month, 1).toLocaleString("en-US", { month: "long" })} ${this._year}`;
    this.innerHTML = `
      <div class="month-head">
        <div class="month-title">${label}</div>
        <div class="month-nav">
          <button type="button" class="month-nav-btn" data-nav="-1" aria-label="Previous month">${PREV}</button>
          <button type="button" class="month-nav-btn" data-nav="1" aria-label="Next month">${NEXT}</button>
        </div>
      </div>
      <div class="month-weekdays">${WEEKDAYS.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="month-grid">${cells.join("")}</div>`;
  }
}
customElements.define("mz-view-month", MzViewMonth);

// <mz-calendar></mz-calendar>, a month calendar over the live catalog. Every
// object that carries a date property (calendarTypes/calendarProps) is placed on
// its day as a chip; clicking one emits mz-select so <mz-app> opens its detail
// pane. Objects are fetched once on connect; navigating months re-filters them.
import { emitSelect } from "./data.js";
import * as catalog from "../catalog.js";

const PREV = '<svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>';
const NEXT = '<svg viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg>';
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const pad = (n) => String(n).padStart(2, "0");
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
// A date/timestamp value's calendar day is its leading YYYY-MM-DD — taken as a
// string so a date-only value is never shifted across a tz boundary into the
// previous day. timestamptz values keep a time-of-day label.
const dayOf = (v) => String(v).slice(0, 10);
const timeOf = (v) => {
  const s = String(v);
  if (s.length <= 10 || !s.includes("T")) return ""; // date-only → all-day
  const t = new Date(s);
  return isNaN(t) ? "" : t.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }).replace(":00", "");
};

class MzCalendar extends HTMLElement {
  async connectedCallback() {
    this.classList.add("calendar");
    const now = new Date();
    this._year = now.getFullYear();
    this._month = now.getMonth();
    this._today = ymd(now.getFullYear(), now.getMonth(), now.getDate());
    this._events = [];

    this.innerHTML = `
      <div class="cal-head">
        <div class="cal-title"></div>
        <div class="cal-nav">
          <button class="btn btn-ghost btn-sm" type="button" data-nav="today-btn">Today</button>
          <button class="btn-icon" type="button" data-nav="-1" aria-label="Previous month">${PREV}</button>
          <button class="btn-icon" type="button" data-nav="1" aria-label="Next month">${NEXT}</button>
        </div>
      </div>
      <div class="cal-body"></div>`;
    this._title = this.querySelector(".cal-title");
    this._body = this.querySelector(".cal-body");

    this.addEventListener("click", (e) => {
      const nav = e.target.closest("[data-nav]");
      if (nav) { this.nav(nav.dataset.nav); return; }
      const chip = e.target.closest("[data-ev]");
      if (chip) {
        const ev = this._events[Number(chip.dataset.ev)];
        if (ev) emitSelect(this, { _type: ev.type, id: ev.id, [ev.titleField]: ev.title });
      }
    });

    this.renderBody(); // placeholder grid while loading
    await this.load();
    this.renderBody();
  }

  nav(dir) {
    if (dir === "today-btn") {
      const n = new Date();
      this._year = n.getFullYear();
      this._month = n.getMonth();
    } else {
      this._month += Number(dir);
      if (this._month < 0) { this._month = 11; this._year--; }
      else if (this._month > 11) { this._month = 0; this._year++; }
    }
    this.renderBody();
  }

  // Fetch every date-bearing object across the catalog and flatten to one event
  // per (object, date-property) with a value. Failures on a single type are
  // skipped so one bad source doesn't blank the whole calendar.
  async load() {
    const types = catalog.calendarTypes();
    const rowsByType = await Promise.all(
      types.map((t) => catalog.objects(t.name).catch(() => []))
    );
    const events = [];
    types.forEach((t, i) => {
      const titleField = catalog.titleField(t.name);
      const dateProps = catalog.calendarProps(t.name);
      for (const row of rowsByType[i]) {
        for (const p of dateProps) {
          const v = row[p.name];
          if (v == null || v === "") continue;
          events.push({
            type: t.name,
            id: row.id,
            titleField,
            title: row[titleField] || row._links?.[titleField] || catalog.label(t.name),
            field: catalog.label(p.name),
            day: dayOf(v),
            time: timeOf(v),
          });
        }
      }
    });
    this._events = events;
  }

  renderBody() {
    this._title.textContent = `${MONTHS[this._month]} ${this._year}`;
    const byDay = {};
    this._events.forEach((e, i) => (byDay[e.day] = byDay[e.day] || []).push(i));

    const first = new Date(this._year, this._month, 1).getDay();
    const daysIn = new Date(this._year, this._month + 1, 0).getDate();
    const prevDays = new Date(this._year, this._month, 0).getDate();
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = i - first + 1;
      let n, out = false, key = null;
      if (d < 1) { n = prevDays + d; out = true; }
      else if (d > daysIn) { n = d - daysIn; out = true; }
      else { n = d; key = ymd(this._year, this._month, n); }
      const isToday = key === this._today;
      const idxs = key ? byDay[key] || [] : [];
      const chips = idxs
        .map((i) => {
          const e = this._events[i];
          const lead = e.time || e.field;
          return `<button type="button" class="cal-event${e.time ? "" : " muted"}" data-ev="${i}" title="${esc(e.field)}"><span class="cal-event-time">${esc(lead)}</span>${esc(e.title)}</button>`;
        })
        .join("");
      cells.push(`<div class="cal-cell${out ? " out" : ""}${isToday ? " today" : ""}"><span class="cal-daynum">${n}</span>${chips}</div>`);
    }
    const weekdays = WEEKDAYS.map((d) => `<span>${d}</span>`).join("");
    this._body.innerHTML = `<div class="cal-weekdays">${weekdays}</div><div class="cal-grid">${cells.join("")}</div>`;
  }
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

customElements.define("mz-calendar", MzCalendar);

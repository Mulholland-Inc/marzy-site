// <mz-calendar></mz-calendar>, calendar with Month + Week views (sample:
// June 2026). Events show times, and clicking one emits mz-select so the host
// (mz-collection → mz-app) opens its detail pane.
import { emitSelect } from "./data.js";

const PREV = '<svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>';
const NEXT = '<svg viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg>';
const GLOBE = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/></svg>';

const YEAR = 2026, MONTH = 5, TODAY = 21; // June 2026
const BASE_TZ = -5; // events are authored in Eastern (ET)

// Sample events. start/end are 24h decimal hours. Shaped so the detail pane
// (title, status, priority, assignee, tag, due) renders cleanly.
const EVENTS = [
  { id: "e1", day: 21, start: 9, end: 10, title: "Demo call", kind: "volt", assignee: "Dana Reyes", tag: "Sales", priority: "high" },
  { id: "e2", day: 21, start: 14, end: 15.5, title: "Pay run review", kind: "muted", assignee: "Priya Anand", tag: "Payroll", priority: "high" },
  { id: "e3", day: 22, start: 10, end: 10.5, title: "Standup", kind: "muted", assignee: "Marzy", tag: "Team", priority: "low" },
  { id: "e4", day: 23, start: 11, end: 13, title: "Vendor sync", kind: "volt", assignee: "Marcus Lin", tag: "Ops", priority: "medium" },
  { id: "e5", day: 24, start: 13, end: 14, title: "Onboarding", kind: "muted", assignee: "Sam Okafor", tag: "People", priority: "medium" },
  { id: "e6", day: 25, start: 9, end: 10, title: "Invoices due", kind: "volt", assignee: "Dana Reyes", tag: "Finance", priority: "high" },
  { id: "e7", day: 25, start: 15, end: 16, title: "1:1 with Sam", kind: "muted", assignee: "Sam Okafor", tag: "Team", priority: "low" },
  { id: "e8", day: 26, start: 13, end: 15, title: "Close the books", kind: "volt", assignee: "Priya Anand", tag: "Finance", priority: "high" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i); // full day, midnight → midnight
const HOUR_H = 48; // px per hour (fits a title + time in a 1h block)
const WEEK = [21, 22, 23, 24, 25, 26, 27]; // the week containing TODAY

const pad = (n) => String(n).padStart(2, "0");
const fmtHour = (h) => {
  const ap = h < 12 || h === 24 ? "AM" : "PM";
  let hr = h % 12;
  if (hr === 0) hr = 12;
  return `${hr} ${ap}`;
};
const fmtTime = (h) => {
  const ap = h < 12 ? "AM" : "PM";
  let hr = Math.floor(h) % 12;
  if (hr === 0) hr = 12;
  const m = Math.round((h % 1) * 60);
  return m ? `${hr}:${pad(m)} ${ap}` : `${hr} ${ap}`;
};
const weekdayShort = (d) => new Date(YEAR, MONTH, d).toLocaleString("en-US", { weekday: "short" });
const recordFor = (ev, dz = 0) => ({
  ...ev,
  status: "Scheduled",
  due: `${new Date(YEAR, MONTH, ev.day).toLocaleString("en-US", { month: "short" })} ${ev.day} · ${fmtTime(ev.start + dz)}`,
});

class MzCalendar extends HTMLElement {
  connectedCallback() {
    this.classList.add("calendar");
    this._mode = "month";
    this._tz = BASE_TZ;
    // build the chrome once so the switcher thumb can slide on toggle
    this.innerHTML = `
      <div class="cal-head">
        <div class="cal-title"></div>
        <div class="cal-nav">
          <div class="cal-tz">
            <span class="cal-tz-ico" aria-hidden="true">${GLOBE}</span>
            <mz-select class="cal-tz-select" no-search value="-5" aria-label="Timezone">
              <option value="-8">Pacific · PT</option>
              <option value="-7">Mountain · MT</option>
              <option value="-6">Central · CT</option>
              <option value="-5">Eastern · ET</option>
              <option value="0">UTC</option>
              <option value="1">Central Europe · CET</option>
            </mz-select>
          </div>
          <div class="seg viewseg cal-modes" role="tablist">
            <span class="seg-thumb" aria-hidden="true"></span>
            <button type="button" class="seg-btn is-active" data-mode="month"><span>Month</span></button>
            <button type="button" class="seg-btn" data-mode="week"><span>Week</span></button>
          </div>
          <button class="btn-icon" type="button" aria-label="Previous">${PREV}</button>
          <button class="btn-icon" type="button" aria-label="Next">${NEXT}</button>
        </div>
      </div>
      <div class="cal-body"></div>`;

    this._title = this.querySelector(".cal-title");
    this._body = this.querySelector(".cal-body");
    this._seg = this.querySelector(".viewseg");
    this._thumb = this.querySelector(".seg-thumb");

    this.querySelector(".cal-tz-select").addEventListener("change", (e) => {
      this._tz = Number(e.target.value);
      this.renderBody();
    });

    this.addEventListener("click", (e) => {
      const mode = e.target.closest("[data-mode]");
      if (mode) {
        this._mode = mode.dataset.mode;
        this._seg.querySelectorAll(".seg-btn").forEach((b) => b.classList.toggle("is-active", b === mode));
        this.moveThumb();
        this.renderBody();
        return;
      }
      const ev = e.target.closest("[data-ev]");
      if (ev) emitSelect(this, recordFor(EVENTS.find((x) => x.id === ev.dataset.ev), this._tz - BASE_TZ));
    });

    this.renderBody();
    requestAnimationFrame(() => this.moveThumb());

    // live "now" line — nudge it every 30s
    this._clock = setInterval(() => this.updateNow(), 30000);
  }

  disconnectedCallback() {
    clearInterval(this._clock);
  }

  // current wall-clock time-of-day (in the selected tz) as decimal hours
  nowHours() {
    const now = new Date();
    const utc = now.getUTCHours() + now.getUTCMinutes() / 60;
    return (((utc + this._tz) % 24) + 24) % 24;
  }
  nowTop() {
    return (this.nowHours() - HOURS[0]) * HOUR_H;
  }
  updateNow() {
    const el = this.querySelector(".cal-now");
    if (el) el.style.top = `${this.nowTop()}px`;
  }

  moveThumb() {
    const btn = this._seg.querySelector(".seg-btn.is-active");
    if (!btn) return;
    this._thumb.style.left = `${btn.offsetLeft}px`;
    this._thumb.style.top = `${btn.offsetTop}px`;
    this._thumb.style.width = `${btn.offsetWidth}px`;
    this._thumb.style.height = `${btn.offsetHeight}px`;
    this._thumb.style.opacity = "1";
  }

  renderBody() {
    this._title.textContent =
      this._mode === "week"
        ? `${new Date(YEAR, MONTH, WEEK[0]).toLocaleString("en-US", { month: "long" })} ${WEEK[0]}–${WEEK[6]}, ${YEAR}`
        : `${new Date(YEAR, MONTH, 1).toLocaleString("en-US", { month: "long" })} ${YEAR}`;
    this._body.innerHTML = this._mode === "week" ? this.week() : this.month();
    if (this._mode === "week") {
      // keep the day headers aligned with the body's horizontal scroll (mobile)
      const sb = this._body.querySelector(".cal-week-body");
      const sh = this._body.querySelector(".cal-week-head");
      if (sb && sh) sb.addEventListener("scroll", () => (sh.scrollLeft = sb.scrollLeft));
    }
  }

  month() {
    const dz = this._tz - BASE_TZ; // hours to shift event times for the chosen tz
    const first = new Date(YEAR, MONTH, 1).getDay();
    const daysIn = new Date(YEAR, MONTH + 1, 0).getDate();
    const prevDays = new Date(YEAR, MONTH, 0).getDate();
    const byDay = {};
    EVENTS.forEach((e) => (byDay[e.day] = byDay[e.day] || []).push(e));
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = i - first + 1;
      let n, out = false, isToday = false, evs = [];
      if (d < 1) { n = prevDays + d; out = true; }
      else if (d > daysIn) { n = d - daysIn; out = true; }
      else { n = d; isToday = n === TODAY; evs = byDay[n] || []; }
      const chips = evs
        .map(
          (e) =>
            `<button type="button" class="cal-event${e.kind === "muted" ? " muted" : ""}" data-ev="${e.id}"><span class="cal-event-time">${fmtTime(e.start + dz)}</span>${e.title}</button>`
        )
        .join("");
      cells.push(`<div class="cal-cell${out ? " out" : ""}${isToday ? " today" : ""}"><span class="cal-daynum">${n}</span>${chips}</div>`);
    }
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => `<span>${d}</span>`).join("");
    return `<div class="cal-weekdays">${weekdays}</div><div class="cal-grid">${cells.join("")}</div>`;
  }

  week() {
    const dz = this._tz - BASE_TZ;
    const dayHead = WEEK.map(
      (d) => `<span class="cal-wday${d === TODAY ? " today" : ""}"><span>${weekdayShort(d)}</span><b>${d}</b></span>`
    ).join("");
    const times = HOURS.map((h) => `<span class="cal-hour">${fmtHour(h)}</span>`).join("");
    const cols = WEEK.map((d) => {
      const slots = HOURS.map(() => `<div class="cal-slot"></div>`).join("");
      const blocks = EVENTS.filter((e) => e.day === d)
        .map((e) => {
          const top = (e.start + dz - HOURS[0]) * HOUR_H;
          const h = (e.end - e.start) * HOUR_H;
          return `<button type="button" class="cal-block cal-block-${e.kind}" data-ev="${e.id}" style="top:${top}px;height:${h}px">
            <span class="cal-block-title">${e.title}</span>
            <span class="cal-block-time">${fmtTime(e.start + dz)}–${fmtTime(e.end + dz)}</span>
          </button>`;
        })
        .join("");
      const now = d === TODAY ? `<div class="cal-now" style="top:${this.nowTop()}px"></div>` : "";
      return `<div class="cal-col">${slots}${blocks}${now}</div>`;
    }).join("");
    return `
      <div class="cal-week">
        <div class="cal-week-head"><span class="cal-week-gutter"></span>${dayHead}</div>
        <div class="cal-week-body" style="--hour-h:${HOUR_H}px">
          <div class="cal-week-times">${times}</div>
          ${cols}
        </div>
      </div>`;
  }
}
customElements.define("mz-calendar", MzCalendar);

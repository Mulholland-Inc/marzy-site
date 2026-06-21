// <mz-calendar></mz-calendar>, month calendar (sample: June 2026).
const PREV = '<svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>';
const NEXT = '<svg viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg>';
const EVENTS = {
  3: [["Pay run drafted", "volt"]],
  9: [["Standup", "muted"]],
  12: [["Cutoff", "volt"]],
  15: [["Payroll filed", "volt"], ["Review queue", "muted"]],
  18: [["Vendor sync", "muted"]],
  21: [["Demo call", "volt"]],
  25: [["Invoices due", "volt"]],
};
class MzCalendar extends HTMLElement {
  connectedCallback() {
    this.classList.add("calendar");
    const year = 2026, month = 5, today = 21; // June 2026
    const title = new Date(year, month, 1).toLocaleString("en-US", { month: "long" }) + " " + year;
    const first = new Date(year, month, 1).getDay();
    const daysIn = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = i - first + 1;
      let n, out = false, isToday = false, evs = [];
      if (d < 1) { n = prevDays + d; out = true; }
      else if (d > daysIn) { n = d - daysIn; out = true; }
      else { n = d; isToday = n === today; evs = EVENTS[n] || []; }
      const chips = evs
        .map(([l, k]) => `<span class="cal-event${k === "muted" ? " muted" : ""}">${l}</span>`)
        .join("");
      cells.push(`<div class="cal-cell${out ? " out" : ""}${isToday ? " today" : ""}"><span class="cal-daynum">${n}</span>${chips}</div>`);
    }
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => `<span>${d}</span>`).join("");
    this.innerHTML = `
      <div class="cal-head">
        <div class="cal-title">${title}</div>
        <div class="cal-nav">
          <button class="btn btn-outline btn-sm" type="button">Today</button>
          <button class="btn-icon" type="button" aria-label="Previous month">${PREV}</button>
          <button class="btn-icon" type="button" aria-label="Next month">${NEXT}</button>
        </div>
      </div>
      <div class="cal-weekdays">${weekdays}</div>
      <div class="cal-grid">${cells.join("")}</div>`;
  }
}
customElements.define("mz-calendar", MzCalendar);

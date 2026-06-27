// <mz-datepicker label="Pay date" value="2026-06-15" size="sm"></mz-datepicker>
// A custom date selector: a trigger plus a floating month calendar. Stores an
// ISO value (yyyy-mm-dd), exposes `.value`, and emits a bubbling `change` event.
import { icon } from "./icons.js";
import { popIn, popOut } from "./motion.js";

const CAL = icon("calendar");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

class MzDatepicker extends HTMLElement {
  connectedCallback() {
    if (this._wired) return;
    this._wired = true;
    const label = this.getAttribute("label") || "";
    this._value = this.getAttribute("value") || "";
    this.classList.add("cd");
    const sm = this.getAttribute("size") === "sm" ? " cd-trigger-sm" : "";
    this.innerHTML = `
      ${label ? `<span class="field-label">${label}</span>` : ""}
      <button type="button" class="cd-trigger${sm}" aria-haspopup="dialog" aria-expanded="false">
        <span class="cd-value"></span>${CAL}
      </button>`;
    this._trigger = this.querySelector(".cd-trigger");
    this._valueEl = this.querySelector(".cd-value");
    this.renderValue();
    this._trigger.addEventListener("click", () => this.toggle());
  }

  get value() {
    return this._value;
  }
  set value(v) {
    this._value = v;
    this.renderValue();
  }

  parse(iso) {
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null;
  }
  iso(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  today() {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
  }

  renderValue() {
    if (!this._valueEl) return;
    const d = this.parse(this._value);
    this._valueEl.textContent = d ? `${SHORT[d.m]} ${d.d}, ${d.y}` : this.getAttribute("placeholder") || "Pick a date";
    this._valueEl.classList.toggle("is-placeholder", !d);
  }

  toggle() {
    this._pop ? this.close() : this.open();
  }

  open() {
    const cur = this.parse(this._value) || this.today();
    this._viewY = cur.y;
    this._viewM = cur.m;
    const pop = document.createElement("div");
    pop.className = "cd-pop";
    // stable structure — only the title + grid change when paging months, so the
    // nav buttons stay attached (re-rendering them mid-click would close the pop)
    pop.innerHTML = `
      <div class="cd-head">
        <button type="button" class="cd-nav cd-prev" aria-label="Previous month">${icon("chevron-right")}</button>
        <span class="cd-title"></span>
        <button type="button" class="cd-nav cd-next" aria-label="Next month">${icon("chevron-right")}</button>
      </div>
      <div class="cd-dow">${DOW.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="cd-grid"></div>`;
    document.body.appendChild(pop);
    this._pop = pop;
    this._title = pop.querySelector(".cd-title");
    this._grid = pop.querySelector(".cd-grid");
    this.renderCal();
    this.position();
    this._trigger.setAttribute("aria-expanded", "true");
    popIn(pop, -1);

    pop.addEventListener("click", (e) => {
      if (e.target.closest(".cd-prev")) return this.shift(-1);
      if (e.target.closest(".cd-next")) return this.shift(1);
      const day = e.target.closest(".cd-day");
      if (day && !day.classList.contains("is-empty")) this.choose(Number(day.dataset.d));
    });
    this._onKey = (e) => {
      if (e.key === "Escape") {
        this.close();
        this._trigger.focus();
      }
    };
    this._onDoc = (e) => {
      if (!pop.contains(e.target) && !this._trigger.contains(e.target)) this.close();
    };
    // close on outside scroll, but not when scrolling inside the popup
    this._onScroll = (e) => {
      if (!this._pop.contains(e.target)) this.close();
    };
    document.addEventListener("keydown", this._onKey);
    setTimeout(() => document.addEventListener("click", this._onDoc), 0);
    window.addEventListener("scroll", this._onScroll, true);
    window.addEventListener("resize", this._onScroll);
  }

  shift(dir) {
    this._viewM += dir;
    if (this._viewM < 0) {
      this._viewM = 11;
      this._viewY--;
    } else if (this._viewM > 11) {
      this._viewM = 0;
      this._viewY++;
    }
    this.renderCal();
    this.position();
  }

  renderCal() {
    const y = this._viewY;
    const m = this._viewM;
    const sel = this.parse(this._value);
    const tdy = this.today();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
    const days = new Date(y, m + 1, 0).getDate();
    let cells = "";
    for (let i = 0; i < offset; i++) cells += `<span class="cd-day is-empty"></span>`;
    for (let d = 1; d <= days; d++) {
      const isSel = sel && sel.y === y && sel.m === m && sel.d === d;
      const isTdy = tdy.y === y && tdy.m === m && tdy.d === d;
      cells += `<button type="button" class="cd-day${isSel ? " is-selected" : ""}${isTdy ? " is-today" : ""}" data-d="${d}">${d}</button>`;
    }
    this._title.textContent = `${MONTHS[m]} ${y}`;
    this._grid.innerHTML = cells;
  }

  choose(d) {
    this._value = this.iso(this._viewY, this._viewM, d);
    this.renderValue();
    this.close();
    this._trigger.focus();
    this.dispatchEvent(new CustomEvent("change", { bubbles: true }));
  }

  position() {
    const r = this._trigger.getBoundingClientRect();
    const pop = this._pop;
    pop.style.position = "fixed";
    pop.style.left = `${Math.max(12, Math.min(r.left, window.innerWidth - pop.offsetWidth - 12))}px`;
    let top = r.bottom + 6;
    const ph = pop.offsetHeight;
    if (top + ph > window.innerHeight - 12) top = Math.max(12, r.top - ph - 6);
    pop.style.top = `${top}px`;
  }

  close() {
    if (!this._pop) return;
    const pop = this._pop;
    this._pop = null;
    this._trigger.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", this._onKey);
    document.removeEventListener("click", this._onDoc);
    window.removeEventListener("scroll", this._onScroll, true);
    window.removeEventListener("resize", this._onScroll);
    Promise.resolve(popOut(pop)).then(() => pop.remove());
  }
}
customElements.define("mz-datepicker", MzDatepicker);

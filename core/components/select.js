// <mz-select label="Role" value="Member" size="sm" search><option>Admin</option>…</mz-select>
// A custom, searchable dropdown that replaces the native <select>: a trigger plus
// a floating pane with a filter field and an option list. Exposes `.value` and
// emits a bubbling `change` event, so hosts can read it just like a <select>.
// Search shows automatically for longer lists (or force with `search` / disable
// with `no-search`).
import { icon } from "./icons.js";
import { popIn, popOut } from "./motion.js";

const CHEV = icon("chevron-down");
const CHECK = icon("check");
const SEARCH = icon("search");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let openInstance = null; // only one dropdown open at a time

class MzSelect extends HTMLElement {
  connectedCallback() {
    if (this._wired) return;
    this._wired = true;
    const label = this.getAttribute("label") || "";
    this._options = [...this.querySelectorAll("option")].map((o) => ({
      value: o.getAttribute("value") ?? o.textContent.trim(),
      label: o.textContent.trim(),
    }));
    this._value = this.getAttribute("value") ?? (this._options[0] ? this._options[0].value : "");
    this.classList.add("cs");
    const sm = this.getAttribute("size") === "sm" ? " cs-trigger-sm" : "";
    this.innerHTML = `
      ${label ? `<span class="field-label">${esc(label)}</span>` : ""}
      <button type="button" class="cs-trigger${sm}" aria-haspopup="listbox" aria-expanded="false">
        <span class="cs-value"></span>${CHEV}
      </button>`;
    this._trigger = this.querySelector(".cs-trigger");
    this._valueEl = this.querySelector(".cs-value");
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

  renderValue() {
    if (!this._valueEl) return;
    const opt = this._options.find((o) => o.value === this._value);
    this._valueEl.textContent = opt ? opt.label : this.getAttribute("placeholder") || "Select…";
    this._valueEl.classList.toggle("is-placeholder", !opt);
  }

  toggle() {
    this._pop ? this.close() : this.open();
  }

  open() {
    if (openInstance && openInstance !== this) openInstance.close();
    openInstance = this;
    const searchable = this.hasAttribute("search") || (!this.hasAttribute("no-search") && this._options.length > 5);
    const pop = document.createElement("div");
    pop.className = "cs-pop";
    pop.setAttribute("role", "listbox");
    pop.innerHTML = `
      ${searchable ? `<div class="cs-search">${SEARCH}<input type="text" class="cs-search-input" placeholder="Search" aria-label="Filter options" /></div>` : ""}
      <ul class="cs-list"></ul>`;
    document.body.appendChild(pop);
    this._pop = pop;
    this._list = pop.querySelector(".cs-list");
    this._searchEl = pop.querySelector(".cs-search-input");
    this._active = -1;
    this.renderOptions("");
    this.position();
    this._trigger.setAttribute("aria-expanded", "true");
    popIn(pop, -1);

    if (this._searchEl) {
      this._searchEl.addEventListener("input", () => {
        this._active = 0;
        this.renderOptions(this._searchEl.value);
      });
      this._searchEl.focus();
    }
    pop.addEventListener("click", (e) => {
      const li = e.target.closest(".cs-opt");
      if (li) this.choose(li.dataset.value);
    });
    pop.addEventListener("mousemove", (e) => {
      const li = e.target.closest(".cs-opt");
      if (li && Number(li.dataset.i) !== this._active) {
        this._active = Number(li.dataset.i);
        this.syncActive();
      }
    });
    this._onKey = (e) => this.onKey(e);
    this._onDoc = (e) => {
      if (!pop.contains(e.target) && !this._trigger.contains(e.target)) this.close();
    };
    // close on outside scroll, but not when scrolling the option list
    this._onScroll = (e) => {
      if (!this._pop.contains(e.target)) this.close();
    };
    document.addEventListener("keydown", this._onKey);
    setTimeout(() => document.addEventListener("click", this._onDoc), 0);
    window.addEventListener("scroll", this._onScroll, true);
    window.addEventListener("resize", this._onScroll);
  }

  renderOptions(term) {
    const t = term.trim().toLowerCase();
    this._filtered = this._options.filter((o) => !t || o.label.toLowerCase().includes(t));
    this._list.innerHTML = this._filtered.length
      ? this._filtered
          .map(
            (o, i) =>
              `<li class="cs-opt${o.value === this._value ? " is-selected" : ""}" role="option" data-value="${esc(o.value)}" data-i="${i}">
                <span class="cs-opt-label">${esc(o.label)}</span><span class="cs-check">${CHECK}</span>
              </li>`
          )
          .join("")
      : `<li class="cs-empty">No matches</li>`;
    if (this._active < 0) this._active = Math.max(0, this._filtered.findIndex((o) => o.value === this._value));
    this.syncActive();
  }

  syncActive() {
    const items = this._list.querySelectorAll(".cs-opt");
    items.forEach((li, i) => li.classList.toggle("is-active", i === this._active));
    if (items[this._active]) items[this._active].scrollIntoView({ block: "nearest" });
  }

  onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.close();
      this._trigger.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this._active = Math.min((this._filtered.length || 1) - 1, this._active + 1);
      this.syncActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this._active = Math.max(0, this._active - 1);
      this.syncActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = this._filtered[this._active];
      if (o) this.choose(o.value);
    }
  }

  choose(value) {
    const changed = value !== this._value;
    this._value = value;
    this.renderValue();
    this.close();
    this._trigger.focus();
    if (changed) this.dispatchEvent(new CustomEvent("change", { bubbles: true }));
  }

  position() {
    const r = this._trigger.getBoundingClientRect();
    const pop = this._pop;
    pop.style.position = "fixed";
    pop.style.minWidth = `${r.width}px`;
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
    if (openInstance === this) openInstance = null;
    this._trigger.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", this._onKey);
    document.removeEventListener("click", this._onDoc);
    window.removeEventListener("scroll", this._onScroll, true);
    window.removeEventListener("resize", this._onScroll);
    Promise.resolve(popOut(pop)).then(() => pop.remove());
  }
}
customElements.define("mz-select", MzSelect);

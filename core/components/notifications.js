// <mz-notifications></mz-notifications>, a bell button for the app's top-right
// that opens a dropdown of recent notifications. Marzy's items carry the spark
// mark; people's items show their initials. The bell shows a Volt dot while
// anything is unread; opening + "Mark all read" clears it. Mirrors the
// workspace switcher's menu pattern (popIn / popOut, outside-click + Esc).
import { icon } from "./icons.js";
import { initials } from "./data.js";
import { SPARK } from "./spark.js";
import { popIn, popOut } from "./motion.js";

const BELL = icon("bell");

const NOTES = [
  { who: "Marzy", marzy: true, text: "completed <b>Reconcile June invoices</b>", time: "2m ago", unread: true },
  { who: "Dana Lee", text: "assigned you <b>Q3 budget review</b>", time: "1h ago", unread: true },
  { who: "Marzy", marzy: true, text: "flagged <b>3 transactions</b> for your approval", time: "3h ago", unread: true },
  { who: "Alex Park", text: "commented on <b>Vendor onboarding</b>", time: "Yesterday", unread: false },
  { who: "Marzy", marzy: true, text: "synced <b>Stripe payouts</b> to the ledger", time: "Yesterday", unread: false },
];

class MzNotifications extends HTMLElement {
  connectedCallback() {
    this.classList.add("notif");
    this._notes = NOTES.map((n) => ({ ...n })); // own copy so read-state is per-instance
    this.render();
    this._onDoc = (e) => {
      if (!this.contains(e.target)) this.close();
    };
    this._onKey = (e) => {
      if (e.key === "Escape") this.close();
    };
    document.addEventListener("click", this._onDoc);
    document.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onDoc);
    document.removeEventListener("keydown", this._onKey);
  }

  get unread() {
    return this._notes.filter((n) => n.unread).length;
  }

  itemHTML(n, i) {
    const av = n.marzy
      ? `<span class="notif-av notif-av-marzy" aria-hidden="true">${SPARK}</span>`
      : `<span class="notif-av" aria-hidden="true">${initials(n.who)}</span>`;
    return `<button type="button" class="notif-item${n.unread ? " is-unread" : ""}" data-i="${i}" role="menuitem">
        ${av}
        <span class="notif-body">
          <span class="notif-text"><b>${n.who}</b> ${n.text}</span>
          <time class="notif-time">${n.time}</time>
        </span>
        ${n.unread ? `<span class="notif-dot" aria-hidden="true"></span>` : ""}
      </button>`;
  }

  render() {
    const n = this.unread;
    this.innerHTML = `
      <button type="button" class="notif-btn btn-icon" aria-haspopup="true" aria-expanded="false" aria-label="Notifications${n ? ` (${n} unread)` : ""}">
        ${BELL}
        <span class="notif-badge"${n ? "" : " hidden"}></span>
      </button>
      <div class="notif-menu" hidden role="menu" aria-label="Notifications">
        <div class="notif-head">
          <span class="notif-title">Notifications</span>
          <button type="button" class="notif-clear"${n ? "" : " hidden"}>Mark all read</button>
        </div>
        <div class="notif-list">${this._notes.map((note, i) => this.itemHTML(note, i)).join("")}</div>
      </div>`;

    this._btn = this.querySelector(".notif-btn");
    this._menu = this.querySelector(".notif-menu");
    this._btn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });
    this._menu.addEventListener("click", (e) => {
      if (e.target.closest(".notif-clear")) {
        this.markAllRead();
        return;
      }
      const item = e.target.closest(".notif-item");
      if (item) this.markRead(Number(item.dataset.i));
    });
  }

  markRead(i) {
    if (!this._notes[i] || !this._notes[i].unread) return;
    this._notes[i].unread = false;
    this.refresh();
  }

  markAllRead() {
    this._notes.forEach((note) => (note.unread = false));
    this.refresh();
  }

  // Re-render the list + badge in place while keeping the menu open.
  refresh() {
    const open = !this._menu.hidden;
    this.render();
    if (open) {
      this._menu.hidden = false;
      this._btn.setAttribute("aria-expanded", "true");
    }
  }

  toggle() {
    this._menu.hidden ? this.open() : this.close();
  }

  open() {
    this._menu.hidden = false;
    this._btn.setAttribute("aria-expanded", "true");
    popIn(this._menu);
  }

  close() {
    if (!this._menu || this._menu.hidden) return;
    this._btn.setAttribute("aria-expanded", "false");
    popOut(this._menu).then(() => {
      if (this._menu) this._menu.hidden = true;
    });
  }
}
customElements.define("mz-notifications", MzNotifications);

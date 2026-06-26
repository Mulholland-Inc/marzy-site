// <mz-view-board></mz-view-board>, a Trello-style board: one column per status,
// with pointer drag-and-drop (Motion springs for the lift and the drop). Renders
// from this._records (set via setData), default RECORDS.
import { RECORDS, STATUSES, byId, emitSelect, prioHTML, avatarHTML } from "./data.js";
import { animate, SPRING, reduce } from "./motion.js";

class MzViewBoard extends HTMLElement {
  connectedCallback() {
    this.classList.add("view", "board");
    this.addEventListener("pointerdown", (e) => this.onDown(e));
    this.render();
  }
  setData(records) {
    this._records = records;
    this.render();
  }
  render() {
    this._recs = this._records || RECORDS;
    this.innerHTML = STATUSES.map((status) => {
      const items = this._recs.filter((r) => r.status === status);
      return `<div class="board-col" data-status="${status}">
        <div class="board-col-head">${status}<span>${items.length}</span></div>
        <div class="board-list">${items.map((r) => this.cardHTML(r)).join("")}<button class="board-add" type="button">+ Add</button></div>
      </div>`;
    }).join("");
  }
  cardHTML(r) {
    return `<div class="board-card" data-id="${r.id}">
      <div class="board-card-title">${r.title}</div>
      <div class="board-card-meta">${prioHTML(r.priority)}${avatarHTML(r.assignee)}</div>
    </div>`;
  }

  // pointerdown that becomes a drag past a small threshold, else a click→select
  onDown(e) {
    if (e.button !== 0) return;
    const card = e.target.closest(".board-card[data-id]");
    if (!card) return;
    e.preventDefault();
    const startX = e.clientX,
      startY = e.clientY;
    const rect = card.getBoundingClientRect();
    const offX = startX - rect.left,
      offY = startY - rect.top;
    let dragging = false;

    const move = (ev) => {
      if (!dragging) {
        if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) < 5) return;
        dragging = true;
        this.lift(card, rect);
      }
      card.style.left = ev.clientX - offX + "px";
      card.style.top = ev.clientY - offY + "px";
      this.reposition(ev.clientX, ev.clientY);
    };
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      if (!dragging) {
        emitSelect(this, byId(card.dataset.id));
        return;
      }
      this.drop(card);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  // float the card under the pointer; leave a placeholder in its slot
  lift(card, rect) {
    const ph = document.createElement("div");
    ph.className = "board-ph";
    ph.style.height = rect.height + "px";
    card.after(ph);
    this._ph = ph;
    card.classList.add("is-dragging");
    Object.assign(card.style, {
      position: "fixed",
      width: rect.width + "px",
      left: rect.left + "px",
      top: rect.top + "px",
      margin: "0",
    });
    document.body.classList.add("is-dragging-card");
    if (!reduce) animate(card, { scale: [1, 1.03] }, { duration: 0.15 });
  }

  // move the placeholder to wherever the pointer is hovering
  reposition(x, y) {
    const lists = [...this.querySelectorAll(".board-list")];
    const target = lists.find((l) => {
      const r = l.getBoundingClientRect();
      return x >= r.left && x <= r.right;
    });
    if (!target) return;
    const cards = [...target.querySelectorAll(".board-card:not(.is-dragging)")];
    const before = cards.find((c) => {
      const r = c.getBoundingClientRect();
      return y < r.top + r.height / 2;
    });
    target.insertBefore(this._ph, before || target.querySelector(".board-add"));
  }

  // drop the card into the placeholder slot and spring it into place
  drop(card) {
    const ph = this._ph;
    const list = ph.parentElement;
    const fromRect = card.getBoundingClientRect();
    list.insertBefore(card, ph);
    ph.remove();
    card.classList.remove("is-dragging");
    Object.assign(card.style, { position: "", width: "", left: "", top: "", margin: "" });
    document.body.classList.remove("is-dragging-card");

    const newRect = card.getBoundingClientRect();
    if (reduce) {
      card.style.transform = "";
    } else {
      animate(
        card,
        { x: [fromRect.left - newRect.left, 0], y: [fromRect.top - newRect.top, 0], scale: [1.03, 1] },
        SPRING,
      );
    }

    const rec = byId(card.dataset.id);
    if (rec) rec.status = list.closest(".board-col").dataset.status;
    this.commitOrder();
    this.updateCounts();
    this._ph = null;
  }

  // reorder the backing array to match the DOM so state stays consistent
  commitOrder() {
    const ids = [...this.querySelectorAll(".board-card[data-id]")].map((c) => c.dataset.id);
    this._recs.sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id)));
  }

  updateCounts() {
    this.querySelectorAll(".board-col").forEach((col) => {
      const span = col.querySelector(".board-col-head span");
      if (span) span.textContent = col.querySelectorAll(".board-card").length;
    });
  }
}
customElements.define("mz-view-board", MzViewBoard);

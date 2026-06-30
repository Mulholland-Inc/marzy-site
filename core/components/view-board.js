// <mz-view-board></mz-view-board>, a Trello-style board over a real object type:
// one column per value of the type's grouping enum (mode.groupBy, e.g. a deal's
// stage), with pointer drag-and-drop. Dropping a card into a column PATCHes that
// field. Fed by setData(rows, { type, columns, mode }); a click emits mz-select.
import { display, label } from "../catalog.js";
import { api } from "../auth.js";
import { animate, SPRING, reduce } from "./motion.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzViewBoard extends HTMLElement {
  connectedCallback() {
    this.classList.add("view", "board");
    this.addEventListener("pointerdown", (e) => this.onDown(e));
    this.render();
  }
  setData(rows, ctx) {
    this._rows = rows || [];
    this._ctx = ctx || {};
    this.render();
  }
  row(id) {
    return (this._rows || []).find((r) => String(r.id) === String(id));
  }
  render() {
    const mode = this._ctx?.mode;
    if (!mode || mode.id !== "board" || !mode.groupBy) {
      this.innerHTML = "";
      return;
    }
    const order = mode.order && mode.order.length ? mode.order : [...new Set((this._rows || []).map((r) => r[mode.groupBy] ?? ""))];
    this.innerHTML = order
      .map((g) => {
        const items = (this._rows || []).filter((r) => String(r[mode.groupBy] ?? "") === String(g));
        return `<div class="board-col" data-group="${esc(g)}">
          <div class="board-col-head">${esc(label(g))}<span>${items.length}</span></div>
          <div class="board-list">${items.map((r) => this.cardHTML(r)).join("")}</div>
        </div>`;
      })
      .join("");
  }
  cardHTML(r) {
    const cols = this._ctx.columns;
    const meta = (cols?.cols || [])
      .slice(0, 2)
      .map((c) => {
        const v = display(r, c);
        return v ? `<span class="board-card-meta-item t-meta">${esc(v)}</span>` : "";
      })
      .join("");
    return `<div class="board-card" data-id="${esc(r.id)}">
      <div class="board-card-title">${esc(r[cols.title.name])}</div>
      <div class="board-card-meta">${meta}</div>
    </div>`;
  }

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
        const r = this.row(card.dataset.id);
        if (r) this.dispatchEvent(new CustomEvent("mz-select", { detail: r, bubbles: true }));
        return;
      }
      this.drop(card);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  lift(card, rect) {
    const ph = document.createElement("div");
    ph.className = "board-ph";
    ph.style.height = rect.height + "px";
    card.after(ph);
    this._ph = ph;
    card.classList.add("is-dragging");
    Object.assign(card.style, { position: "fixed", width: rect.width + "px", left: rect.left + "px", top: rect.top + "px", margin: "0" });
    document.body.classList.add("is-dragging-card");
    if (!reduce) animate(card, { scale: [1, 1.03] }, { duration: 0.15 });
  }

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
    target.insertBefore(this._ph, before || null);
  }

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
    if (reduce) card.style.transform = "";
    else
      animate(
        card,
        { x: [fromRect.left - newRect.left, 0], y: [fromRect.top - newRect.top, 0], scale: [1.03, 1] },
        SPRING
      );
    // Persist the move: the card's new column is its group value.
    const groupVal = list.closest(".board-col").dataset.group;
    const r = this.row(card.dataset.id);
    const field = this._ctx.mode.groupBy;
    if (r && String(r[field] ?? "") !== String(groupVal)) {
      r[field] = groupVal;
      api(`/objects/${this._ctx.type}/${card.dataset.id}`, { method: "PATCH", body: { [field]: groupVal } }).catch(() => {});
    }
    this.updateCounts();
    this._ph = null;
  }

  updateCounts() {
    this.querySelectorAll(".board-col").forEach((col) => {
      const span = col.querySelector(".board-col-head span");
      if (span) span.textContent = col.querySelectorAll(".board-card").length;
    });
  }
}
customElements.define("mz-view-board", MzViewBoard);

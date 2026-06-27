// <mz-chats></mz-chats> — the Chats home: a left rail listing conversations
// with Marzy, and a main area centered on one big prompt (Claude/ChatGPT
// style). This is a landing surface — it owns its own rail/main split inside
// the app body. Built entirely from house tokens and the shared spark/icons.
import { SPARK } from "./spark.js";
import { icon } from "./icons.js";

// Sample conversation list, grouped by recency. [id, title, snippet]
const GROUPS = [
  ["Today", [
    ["c1", "June payroll run", "Drafted from 14 timesheets — awaiting approval"],
    ["c2", "Q2 invoice reconcile", "Flagged 3 of 412 transactions for review"],
  ]],
  ["Previous 7 days", [
    ["c3", "Onboard Marcus Lin", "Pre-filled the Gusto profile and I-9"],
    ["c4", "Close March books", "Reconciled and closed clean"],
    ["c5", "QuickBooks sync", "142 records updated"],
  ]],
];

// Starter prompts shown under the composer.
const SUGGESTIONS = [
  "Draft this month's payroll",
  "Reconcile Q2 invoices",
  "Summarize this week",
];

class MzChats extends HTMLElement {
  connectedCallback() {
    this.classList.add("chats");
    this._active = null;
    this.render();

    this._input = this.querySelector(".chats-input");
    this._list = this.querySelector(".chats-list");

    // Selecting a conversation just flags it active (showcase surface).
    this._list.addEventListener("click", (e) => {
      const item = e.target.closest(".chats-item");
      if (!item) return;
      this.setActive(item.dataset.id);
    });
    // New chat clears the active conversation and refocuses the prompt.
    this.querySelector(".chats-new").addEventListener("click", () => {
      this.setActive(null);
      this._input.focus();
    });
    // Suggestion chips drop their text into the composer.
    this.querySelectorAll(".chats-chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        this._input.value = chip.textContent;
        this.grow();
        this._input.focus();
      })
    );
    // Auto-grow the textarea; submit clears it (no fake thread yet).
    this._input.addEventListener("input", () => this.grow());
    this.querySelector(".chats-composer").addEventListener("submit", (e) => {
      e.preventDefault();
      this._input.value = "";
      this.grow();
    });
  }

  setActive(id) {
    this._active = id;
    this._list.querySelectorAll(".chats-item").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.id === id)
    );
  }

  grow() {
    const t = this._input;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 200) + "px";
  }

  listHTML() {
    return GROUPS.map(
      ([label, items]) => `
        <div class="chats-group">${label}</div>
        ${items
          .map(
            ([id, title, snippet]) => `
          <button type="button" class="chats-item" data-id="${id}">
            <span class="chats-item-ico" aria-hidden="true">${icon("message-square")}</span>
            <span class="chats-item-text">
              <span class="chats-item-title">${title}</span>
              <span class="chats-item-snippet">${snippet}</span>
            </span>
          </button>`
          )
          .join("")}`
    ).join("");
  }

  render() {
    this.innerHTML = `
      <aside class="chats-rail" aria-label="Conversations">
        <button type="button" class="chats-new">${icon("square-pen")}<span>New chat</span></button>
        <div class="chats-search search">
          ${icon("search")}
          <input type="search" class="search-input" placeholder="Search chats" aria-label="Search chats" />
        </div>
        <nav class="chats-list">${this.listHTML()}</nav>
      </aside>
      <div class="chats-main">
        <div class="chats-stage">
          <span class="chats-mark" aria-hidden="true">${SPARK}</span>
          <h2 class="chats-greeting">What can Marzy do for you?</h2>
          <form class="chats-composer">
            <textarea class="chats-input" rows="1" placeholder="Ask Marzy to run a task, reconcile the books, draft payroll…" aria-label="Message Marzy"></textarea>
            <div class="chats-composer-foot">
              <span class="chats-composer-hint">Marzy can act across your connected tools.</span>
              <button type="submit" class="chats-send" aria-label="Send">${icon("send")}</button>
            </div>
          </form>
          <div class="chats-suggest">
            ${SUGGESTIONS.map((s) => `<button type="button" class="chats-chip">${s}</button>`).join("")}
          </div>
        </div>
      </div>`;
  }
}
customElements.define("mz-chats", MzChats);

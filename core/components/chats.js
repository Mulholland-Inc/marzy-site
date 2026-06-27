// <mz-chats></mz-chats> — the Chats home: one big central prompt to Marzy
// (Claude/ChatGPT style). Stateless — no conversation list, no thread. Built
// entirely from house tokens and the shared spark/icons.
import { SPARK } from "./spark.js";
import { icon } from "./icons.js";

// Starter prompts shown under the composer.
const SUGGESTIONS = [
  "Draft this month's payroll",
  "Reconcile Q2 invoices",
  "Summarize this week",
];

class MzChats extends HTMLElement {
  connectedCallback() {
    this.classList.add("chats");
    this.render();

    this._input = this.querySelector(".chats-input");

    // Suggestion chips drop their text into the composer.
    this.querySelectorAll(".chats-chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        this._input.value = chip.textContent;
        this.grow();
        this._input.focus();
      })
    );
    // Auto-grow the textarea; submit just clears it (stateless surface).
    this._input.addEventListener("input", () => this.grow());
    this.querySelector(".chats-composer").addEventListener("submit", (e) => {
      e.preventDefault();
      this._input.value = "";
      this.grow();
    });
  }

  grow() {
    const t = this._input;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 200) + "px";
  }

  render() {
    this.innerHTML = `
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
      </div>`;
  }
}
customElements.define("mz-chats", MzChats);

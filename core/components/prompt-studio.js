// <mz-prompt-studio></mz-prompt-studio> — the workspace assistant instructions
// (the org prompt) with a live preview, built in the same language as the Chat
// tab: the soft rounded composer, the spark, and the chat's own message bubbles.
// Edit on the left; test the *draft* on the right against the real assistant
// (POST /chat/preview — a dry run, so write actions are simulated and nothing is
// saved or changed). Admin-only surface.
import { api } from "../auth.js";
import { SPARK } from "./spark.js";
import { icon } from "./icons.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzPromptStudio extends HTMLElement {
  connectedCallback() {
    this.classList.add("studio");
    this._history = [];
    this.innerHTML = `
      <section class="studio-pane">
        <div class="studio-hd">
          <h3 class="studio-label">Workspace instructions</h3>
          <p class="t-meta">Guidance the assistant follows across this workspace. Edit here, test on the right, then save.</p>
        </div>
        <div class="chats-composer studio-editor">
          <textarea class="chats-input studio-prompt" placeholder="e.g. We're a dental group — be precise about patient data and never guess at clinical details." aria-label="Workspace instructions"></textarea>
          <div class="chats-composer-foot">
            <span class="studio-status t-meta" role="status"></span>
            <button type="button" class="chats-send studio-save" data-act="save" aria-label="Save instructions">${icon("check")}</button>
          </div>
        </div>
      </section>
      <section class="studio-pane">
        <div class="studio-hd">
          <h3 class="studio-label">Preview</h3>
          <p class="t-meta">Test the current draft (unsaved). Actions are simulated — nothing is changed.</p>
        </div>
        <div class="studio-thread">
          <div class="chats-answer studio-empty">
            <span class="chats-mark" aria-hidden="true">${SPARK}</span>
            <h2 class="chats-greeting">Try your draft</h2>
          </div>
        </div>
        <form class="chats-composer studio-composer">
          <textarea class="chats-input studio-msg" rows="1" placeholder="Ask the assistant…" aria-label="Message the assistant"></textarea>
          <div class="chats-composer-foot">
            <span></span>
            <button type="submit" class="chats-send" aria-label="Send">${icon("send")}</button>
          </div>
        </form>
      </section>`;

    this._prompt = this.querySelector(".studio-prompt");
    this._thread = this.querySelector(".studio-thread");
    this._msg = this.querySelector(".studio-msg");

    this.addEventListener("click", (e) => {
      if (e.target.closest("[data-act='save']")) this.save();
    });
    this.querySelector(".studio-composer").addEventListener("submit", (e) => {
      e.preventDefault();
      this.send();
    });
    this._msg.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });

    this.load();
  }

  async load() {
    const p = await api("/prompts").catch(() => ({}));
    this._prompt.value = p.org || "";
  }

  async save() {
    const status = this.querySelector(".studio-status");
    status.textContent = "Saving…";
    try {
      await api("/prompts/org", { method: "PUT", body: { body: this._prompt.value } });
      status.textContent = "Saved.";
    } catch {
      status.textContent = "Couldn’t save.";
    }
  }

  // A message in the preview thread, in the chat's own bubble language: your
  // message is a right-aligned surface bubble, the assistant's is left-aligned
  // plain text under the spark.
  bubble(text, bot) {
    this._thread.querySelector(".studio-empty")?.remove();
    const el = document.createElement("div");
    el.className = "chats-msg " + (bot ? "chats-msg-marzy" : "chats-msg-user");
    el.innerHTML = bot
      ? `<div class="chats-msg-bubble"><span class="chats-mark studio-msg-mark" aria-hidden="true">${SPARK}</span><p class="chats-msg-text">${esc(text)}</p></div>`
      : `<div class="chats-msg-bubble"><p class="chats-msg-text">${esc(text)}</p></div>`;
    this._thread.appendChild(el);
    this._thread.scrollTop = this._thread.scrollHeight;
    return el;
  }

  async send() {
    const text = this._msg.value.trim();
    if (!text || this._busy) return;
    this._busy = true;
    this._msg.value = "";
    this.bubble(text, false);
    const pending = this.bubble("…", true);
    let reply;
    try {
      const res = await api("/chat/preview", { method: "POST", body: { text, org: this._prompt.value, history: this._history } });
      reply = (res && res.reply) || "…";
    } catch {
      reply = "Couldn’t reach the assistant.";
    }
    pending.querySelector(".chats-msg-text").textContent = reply;
    this._history.push({ Author: "you", Text: text, FromBot: false }, { Author: "", Text: reply, FromBot: true });
    this._thread.scrollTop = this._thread.scrollHeight;
    this._busy = false;
  }
}
customElements.define("mz-prompt-studio", MzPromptStudio);

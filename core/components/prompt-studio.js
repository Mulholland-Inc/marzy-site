// <mz-prompt-studio></mz-prompt-studio> — the workspace assistant instructions
// (the org prompt) with a live preview, composed from the house components
// (mz-grid, mz-card, mz-btn) and the chat's own message language. Edit on the
// left; test the *draft* on the right against the real assistant
// (POST /chat/preview — a dry run, so write actions are simulated and nothing is
// saved or changed). Admin-only surface.
import { api } from "../auth.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzPromptStudio extends HTMLElement {
  connectedCallback() {
    this._history = [];
    this.innerHTML = `
      <mz-grid cols="2" class="studio">
        <mz-card class="studio-card">
          <div class="studio-hd">
            <h3>Workspace instructions</h3>
            <p class="t-meta">Guidance the assistant follows across this workspace. Edit here, test on the right, then save.</p>
          </div>
          <textarea class="input studio-prompt" placeholder="e.g. We're a dental group — be precise about patient data and never guess at clinical details."></textarea>
          <div class="studio-foot">
            <mz-btn variant="primary" size="sm" data-act="save">Save</mz-btn>
            <span class="studio-status t-meta" role="status"></span>
          </div>
        </mz-card>
        <mz-card class="studio-card">
          <div class="studio-hd">
            <h3>Preview</h3>
            <p class="t-meta">Test the current draft (unsaved). Actions are simulated — nothing is changed.</p>
          </div>
          <div class="studio-thread"></div>
          <form class="studio-compose">
            <textarea class="input studio-msg" rows="1" placeholder="Ask the assistant…"></textarea>
            <mz-btn variant="primary" size="sm" type="submit">Send</mz-btn>
          </form>
        </mz-card>
      </mz-grid>`;

    this._prompt = this.querySelector(".studio-prompt");
    this._thread = this.querySelector(".studio-thread");
    this._msg = this.querySelector(".studio-msg");

    this.addEventListener("click", (e) => {
      if (e.target.closest("[data-act='save']")) this.save();
    });
    this.querySelector(".studio-compose").addEventListener("submit", (e) => {
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

  // A message in the preview thread, reusing the chat's bubble language: your
  // message is a right-aligned surface bubble, the assistant's is left-aligned
  // plain text.
  bubble(text, bot) {
    const el = document.createElement("div");
    el.className = "chats-msg " + (bot ? "chats-msg-marzy" : "chats-msg-user");
    el.innerHTML = `<div class="chats-msg-bubble"><p class="chats-msg-text">${esc(text)}</p></div>`;
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

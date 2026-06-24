// <mz-mailbox></mz-mailbox> — a 1:1 chat room with Marzy (the AI agent). The
// left pane is a "New chat" button, a search box, and the list of conversations;
// the right pane opens a conversation (or a new chat) as a thread of chat
// bubbles with a composer. It owns its own master/detail split and tells the
// app shell to extend the breadcrumb (mz-crumb) and flag the sidebar (mz-unread).
import { icon } from "./icons.js";
import { MESSAGES } from "./mailbox-data.js";

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzMailbox extends HTMLElement {
  connectedCallback() {
    this.classList.add("mbx");
    // Clone the sample data so replies/new chats don't mutate the shared module.
    this._messages = MESSAGES.map((m) => ({ ...m, thread: m.thread.map((n) => ({ ...n })) }));
    this._search = "";
    this._open = null;
    this._composing = false;
    this._seq = 0;

    this.innerHTML = `
      <div class="mbx-list-pane">
        <div class="mbx-top">
          <div class="mbx-search">
            ${icon("search")}
            <input type="search" class="mbx-search-input" placeholder="Search chats" aria-label="Search chats" />
          </div>
          <button type="button" class="btn btn-primary btn-sm mbx-new">${icon("plus")}<span>New chat</span></button>
        </div>
        <div class="mbx-list" role="list"></div>
      </div>
      <div class="mbx-reading" aria-label="Conversation"></div>`;

    this._listEl = this.querySelector(".mbx-list");
    this._readEl = this.querySelector(".mbx-reading");
    this._searchInput = this.querySelector(".mbx-search-input");

    this._searchInput.addEventListener("input", (e) => {
      this._search = e.target.value;
      this.renderList();
    });
    this.addEventListener("click", (e) => this.onClick(e));

    this.renderList();
    this.renderReading();
  }

  byId(id) {
    return this._messages.find((m) => m.id === id);
  }

  list() {
    const term = this._search.trim().toLowerCase();
    return this._messages.filter((m) => {
      if (m.deleted) return false;
      if (!term) return true;
      const hay = `${m.subject} ${m.thread.map((n) => n.text).join(" ")}`.toLowerCase();
      return hay.includes(term);
    });
  }

  // Ask the app shell to add (or clear) a trailing breadcrumb segment.
  emitCrumb(label) {
    this.dispatchEvent(new CustomEvent("mz-crumb", { detail: { label: label || null }, bubbles: true }));
  }
  // Tell the app shell how many unread conversations there are (sidebar dot).
  emitUnread() {
    const count = this._messages.filter((m) => !m.deleted && m.unread).length;
    this.dispatchEvent(new CustomEvent("mz-unread", { detail: { count }, bubbles: true }));
  }

  renderList() {
    this.emitUnread();
    const rows = this.list();
    if (!rows.length) {
      this._listEl.innerHTML = `<mz-empty heading="No chats">Start a new chat with Marzy.</mz-empty>`;
      return;
    }
    this._listEl.innerHTML = rows
      .map((m) => {
        const last = m.thread[m.thread.length - 1];
        const snippet = last ? `${last.you ? "You: " : ""}${esc(last.text)}` : "";
        return `<div class="mbx-row${m.unread ? " is-unread" : ""}${m.id === this._open ? " is-open" : ""}" role="listitem">
          <button type="button" class="mbx-row-open" data-open="${m.id}">
            <span class="mbx-row-body">
              <span class="mbx-row-top">
                <span class="mbx-from">${esc(m.subject)}</span>
                <time class="mbx-time">${esc(m.time)}</time>
              </span>
              <span class="mbx-snippet">${snippet}</span>
            </span>
          </button>
        </div>`;
      })
      .join("");
  }

  // The shared chat-room chrome: thread of bubbles + composer. The title lives
  // in the breadcrumb, so the only header is a close button while composing.
  roomHTML(notes, placeholder, cancel) {
    return `
      ${cancel ? `<div class="mbx-read-head"><button type="button" class="btn-icon mbx-read-cancel" data-act="cancel" title="Cancel" aria-label="Cancel">${icon("x")}</button></div>` : ""}
      <div class="mbx-thread">${notes}</div>
      <form class="mbx-compose">
        <div class="mbx-compose-box">
          <textarea class="mbx-compose-input" rows="1" placeholder="${esc(placeholder)}" aria-label="Message Marzy"></textarea>
          <button type="submit" class="mbx-send" title="Send" aria-label="Send">${icon("send")}</button>
        </div>
      </form>`;
  }

  noteHTML(n) {
    return `<div class="mbx-note${n.you ? " is-you" : ""}">
        <div class="mbx-note-head"><b>${n.marzy ? "Marzy" : "You"}</b>${n.time ? `<time>${esc(n.time)}</time>` : ""}</div>
        <div class="mbx-note-text">${esc(n.text)}</div>
      </div>`;
  }

  renderReading() {
    if (this._composing) {
      this._readEl.hidden = false;
      const greeting = this.noteHTML({ marzy: true, text: "What can I help you with? Ask me to handle a task, pull a report, or check on something." });
      this._readEl.innerHTML = this.roomHTML(greeting, "Message Marzy…", true);
      this._readEl.querySelector(".mbx-compose").addEventListener("submit", (e) => {
        e.preventDefault();
        this.startChat();
      });
      this.emitCrumb("New chat");
      this._readEl.querySelector(".mbx-compose-input")?.focus();
      return;
    }

    const m = this._open ? this.byId(this._open) : null;
    if (!m || m.deleted) {
      this._open = null;
      this._readEl.hidden = true;
      this._readEl.innerHTML = "";
      this.emitCrumb(null);
      return;
    }
    this._readEl.hidden = false;
    const notes = m.thread.map((n) => this.noteHTML(n)).join("");
    this._readEl.innerHTML = this.roomHTML(notes, "Message Marzy…", false);
    this._readEl.querySelector(".mbx-compose").addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendReply(m);
    });
    this.emitCrumb(m.subject);
    this.scrollThread();
  }

  scrollThread() {
    const t = this._readEl.querySelector(".mbx-thread");
    if (t) t.scrollTop = t.scrollHeight;
  }

  onClick(e) {
    if (e.target.closest(".mbx-new")) {
      this._composing = true;
      this._open = null;
      this.renderList();
      this.renderReading();
      return;
    }
    const open = e.target.closest("[data-open]");
    if (open) {
      const m = this.byId(open.dataset.open);
      m.unread = false;
      this._composing = false;
      this._open = m.id;
      this.renderList();
      this.renderReading();
      return;
    }
    if (e.target.closest('[data-act="cancel"]')) {
      this._composing = false;
      this.renderReading();
    }
  }

  sendReply(m) {
    const input = this._readEl.querySelector(".mbx-compose-input");
    const text = input.value.trim();
    if (!text) return;
    m.thread.push({ you: true, time: "Just now", text });
    m.unread = false;
    input.value = "";
    this.renderList();
    this.renderReading();
  }

  // New chat: your first message, plus a Marzy acknowledgement.
  startChat() {
    const input = this._readEl.querySelector(".mbx-compose-input");
    const text = input.value.trim();
    if (!text) return;
    const subject = text.length > 48 ? text.slice(0, 48) + "…" : text;
    const msg = {
      id: "new" + ++this._seq,
      subject,
      unread: false,
      time: "Just now",
      thread: [
        { you: true, time: "Just now", text },
        { marzy: true, time: "Just now", text: "On it — I'll take care of that and report back here." },
      ],
    };
    this._messages.unshift(msg);
    this._composing = false;
    this._open = msg.id;
    this.renderList();
    this.renderReading();
  }
}
customElements.define("mz-mailbox", MzMailbox);

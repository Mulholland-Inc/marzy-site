// <mz-mailbox></mz-mailbox> — a self-contained mail client: folder rail, a
// searchable/selectable message list, and a reading pane with the thread and a
// reply composer. It owns its own master/detail split (a mailbox is itself a
// two-pane view), so it does not use the app's right-hand detail pane.
import { icon } from "./icons.js";
import { SPARK } from "./spark.js";
import { initials } from "./data.js";
import { MESSAGES, LABEL_CAT } from "./mailbox-data.js";

const FOLDERS = [
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "unread", label: "Unread", icon: "mail" },
  { id: "starred", label: "Starred", icon: "star" },
  { id: "sent", label: "Sent", icon: "send" },
  { id: "archive", label: "Archive", icon: "archive" },
];

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Avatar: Marzy gets the spark glyph; everyone else gets monogram initials.
const avatar = (name, note = {}, cls = "") =>
  note.marzy || name === "Marzy"
    ? `<span class="who-av mbx-av-marzy ${cls}" title="Marzy">${SPARK}</span>`
    : `<span class="who-av ${cls}" title="${esc(name)}">${initials(name)}</span>`;

const labelChip = (label) =>
  label ? `<span class="mbx-label"><span class="tag-dot ${LABEL_CAT[label] || ""}"></span>${esc(label)}</span>` : "";

class MzMailbox extends HTMLElement {
  connectedCallback() {
    this.classList.add("mbx");
    // Clone the sample data so toggles/replies don't mutate the shared module.
    this._messages = MESSAGES.map((m) => ({ ...m, thread: m.thread.map((n) => ({ ...n })) }));
    this._folder = "inbox";
    this._search = "";
    this._sel = new Set();
    this._open = null;

    this.innerHTML = `
      <div class="mbx-list-pane">
        <nav class="mbx-folders" aria-label="Mailbox folders"></nav>
        <div class="mbx-search">
          ${icon("search")}
          <input type="search" class="mbx-search-input" placeholder="Search mail" aria-label="Search mail" />
        </div>
        <div class="mbx-bulk" hidden></div>
        <div class="mbx-list" role="list"></div>
      </div>
      <div class="mbx-reading" aria-label="Message"></div>`;

    this._foldersEl = this.querySelector(".mbx-folders");
    this._listEl = this.querySelector(".mbx-list");
    this._bulkEl = this.querySelector(".mbx-bulk");
    this._readEl = this.querySelector(".mbx-reading");
    this._searchInput = this.querySelector(".mbx-search-input");

    this._searchInput.addEventListener("input", (e) => {
      this._search = e.target.value;
      this.renderList();
    });
    this.addEventListener("click", (e) => this.onClick(e));
    this.addEventListener("change", (e) => {
      const cb = e.target.closest(".mbx-check");
      if (!cb) return;
      const id = cb.closest(".mbx-row").dataset.id;
      cb.checked ? this._sel.add(id) : this._sel.delete(id);
      cb.closest(".mbx-row").classList.toggle("is-checked", cb.checked);
      this.renderBulk();
    });

    this.renderAll();
  }

  // ── data helpers ────────────────────────────────────────────────────────
  byId(id) {
    return this._messages.find((m) => m.id === id);
  }
  inFolder(m, folder) {
    if (m.deleted) return false;
    if (folder === "inbox") return m.folder === "inbox";
    if (folder === "unread") return m.folder === "inbox" && m.unread;
    if (folder === "starred") return m.starred && m.folder !== "archive";
    return m.folder === folder; // sent, archive
  }
  list() {
    const term = this._search.trim().toLowerCase();
    return this._messages.filter((m) => {
      if (!this.inFolder(m, this._folder)) return false;
      if (!term) return true;
      const hay = `${m.from} ${m.subject} ${m.thread.map((n) => n.text).join(" ")}`.toLowerCase();
      return hay.includes(term);
    });
  }
  inboxUnread() {
    return this._messages.filter((m) => this.inFolder(m, "unread")).length;
  }

  // ── render ──────────────────────────────────────────────────────────────
  renderAll() {
    this.renderFolders();
    this.renderBulk();
    this.renderList();
    this.renderReading();
  }

  renderFolders() {
    const unread = this.inboxUnread();
    this._foldersEl.innerHTML = FOLDERS.map((f) => {
      const count = (f.id === "inbox" || f.id === "unread") && unread ? `<span class="mbx-folder-count">${unread}</span>` : "";
      return `<button type="button" class="mbx-folder${f.id === this._folder ? " is-active" : ""}" data-folder="${f.id}">
          <span class="mbx-folder-ico" aria-hidden="true">${icon(f.icon)}</span>
          <span class="mbx-folder-label">${f.label}</span>${count}</button>`;
    }).join("");
  }

  renderBulk() {
    const n = this._sel.size;
    if (!n) {
      this._bulkEl.hidden = true;
      this._bulkEl.innerHTML = "";
      return;
    }
    this._bulkEl.hidden = false;
    this._bulkEl.innerHTML = `
      <span class="mbx-bulk-count">${n} selected</span>
      <div class="mbx-bulk-actions">
        <button type="button" class="btn-icon" data-bulk="read" title="Mark read" aria-label="Mark read">${icon("mail-open")}</button>
        <button type="button" class="btn-icon" data-bulk="archive" title="Archive" aria-label="Archive">${icon("archive")}</button>
        <button type="button" class="btn-icon" data-bulk="delete" title="Delete" aria-label="Delete">${icon("trash-2")}</button>
        <button type="button" class="btn-icon" data-bulk="clear" title="Clear selection" aria-label="Clear selection">${icon("x")}</button>
      </div>`;
  }

  renderList() {
    const rows = this.list();
    if (!rows.length) {
      this._listEl.innerHTML = `<mz-empty heading="Nothing here">No messages in this folder.</mz-empty>`;
      return;
    }
    this._listEl.innerHTML = rows
      .map((m) => {
        const last = m.thread[m.thread.length - 1];
        const snippet = last ? esc(last.text) : "";
        const checked = this._sel.has(m.id);
        return `<div class="mbx-row${m.unread ? " is-unread" : ""}${m.id === this._open ? " is-open" : ""}${checked ? " is-checked" : ""}" data-id="${m.id}" role="listitem">
          <input type="checkbox" class="checkbox mbx-check" ${checked ? "checked" : ""} aria-label="Select message" />
          <button type="button" class="mbx-star${m.starred ? " is-on" : ""}" data-star="${m.id}" aria-label="Star" aria-pressed="${m.starred}">${icon("star")}</button>
          <button type="button" class="mbx-row-open" data-open="${m.id}">
            ${avatar(m.from, m.thread[0])}
            <span class="mbx-row-body">
              <span class="mbx-row-top">
                <span class="mbx-from">${esc(m.from)}</span>
                <time class="mbx-time">${esc(m.time)}</time>
              </span>
              <span class="mbx-subj">${esc(m.subject)}</span>
              <span class="mbx-snippet">${snippet}</span>
            </span>
            ${labelChip(m.label)}
          </button>
        </div>`;
      })
      .join("");
  }

  renderReading() {
    const m = this._open ? this.byId(this._open) : null;
    if (!m || m.deleted || !this.inFolder(m, this._folder)) {
      this._open = null;
      this._readEl.innerHTML = `<div class="mbx-read-empty"><mz-empty heading="No message selected">Pick a message from the list to read the thread.</mz-empty></div>`;
      return;
    }
    const notes = m.thread
      .map(
        (n) => `<div class="mbx-note${n.you ? " is-you" : ""}">
          ${avatar(n.from, n)}
          <div class="mbx-note-body">
            <div class="mbx-note-head"><b>${esc(n.from)}</b><time>${esc(n.time)}</time></div>
            <div class="mbx-note-text">${esc(n.text)}</div>
          </div>
        </div>`
      )
      .join("");
    this._readEl.innerHTML = `
      <div class="mbx-read-head">
        <div class="mbx-read-titles">
          <h2 class="mbx-read-subj">${esc(m.subject)}</h2>
          ${labelChip(m.label)}
        </div>
        <div class="mbx-read-tools">
          <button type="button" class="btn-icon mbx-star${m.starred ? " is-on" : ""}" data-star="${m.id}" title="Star" aria-label="Star" aria-pressed="${m.starred}">${icon("star")}</button>
          <button type="button" class="btn-icon" data-act="archive" title="Archive" aria-label="Archive">${icon("archive")}</button>
          <button type="button" class="btn-icon" data-act="delete" title="Delete" aria-label="Delete">${icon("trash-2")}</button>
        </div>
      </div>
      <div class="mbx-read-from">
        ${avatar(m.from, m.thread[0])}
        <div class="mbx-read-meta"><b>${esc(m.from)}</b><span class="mbx-read-email">${esc(m.email)}</span></div>
      </div>
      <div class="mbx-thread">${notes}</div>
      <form class="mbx-compose">
        <textarea class="mbx-compose-input" rows="2" placeholder="Reply to ${esc(m.from)}…" aria-label="Reply"></textarea>
        <div class="mbx-compose-actions">
          <button type="submit" class="btn btn-primary btn-sm">${icon("reply")}<span>Reply</span></button>
        </div>
      </form>`;
    this._readEl.querySelector(".mbx-compose").addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendReply(m);
    });
  }

  // ── interactions ────────────────────────────────────────────────────────
  onClick(e) {
    const folder = e.target.closest(".mbx-folder");
    if (folder) {
      this._folder = folder.dataset.folder;
      this._sel.clear();
      this._open = null;
      this.renderAll();
      return;
    }
    const star = e.target.closest("[data-star]");
    if (star) {
      const m = this.byId(star.dataset.star);
      m.starred = !m.starred;
      this.renderFolders();
      this.renderList();
      if (this._open === m.id) this.renderReading();
      return;
    }
    const open = e.target.closest("[data-open]");
    if (open) {
      const m = this.byId(open.dataset.open);
      m.unread = false;
      this._open = m.id;
      this.renderFolders();
      this.renderList();
      this.renderReading();
      return;
    }
    const bulk = e.target.closest("[data-bulk]");
    if (bulk) {
      this.runBulk(bulk.dataset.bulk);
      return;
    }
    const act = e.target.closest("[data-act]");
    if (act) {
      const m = this.byId(this._open);
      if (!m) return;
      if (act.dataset.act === "archive") m.folder = "archive";
      if (act.dataset.act === "delete") m.deleted = true;
      this._open = null;
      this.renderAll();
    }
  }

  runBulk(kind) {
    const ids = [...this._sel];
    if (kind === "clear") {
      this._sel.clear();
    } else {
      ids.forEach((id) => {
        const m = this.byId(id);
        if (!m) return;
        if (kind === "read") m.unread = false;
        if (kind === "archive") m.folder = "archive";
        if (kind === "delete") m.deleted = true;
      });
      if (kind !== "read") this._sel.clear();
    }
    if (this._open && !this.byId(this._open)) this._open = null;
    this.renderAll();
  }

  sendReply(m) {
    const input = this._readEl.querySelector(".mbx-compose-input");
    const text = input.value.trim();
    if (!text) return;
    m.thread.push({ from: "You", you: true, time: "Just now", text });
    m.unread = false;
    input.value = "";
    this.renderList();
    this.renderReading();
    this._readEl.querySelector(".mbx-thread")?.lastElementChild?.scrollIntoView({ block: "nearest" });
  }
}
customElements.define("mz-mailbox", MzMailbox);

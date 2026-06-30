// <mz-chats></mz-chats> — the Chats home. The composer starts centered with the
// greeting and glides to the bottom on first send (FLIP). After that it's a
// normal conversation thread (Claude/ChatGPT-style): your message appears as a
// right-aligned bubble, then Marzy replies with the spark, a short typing beat,
// and text that streams in word by word (a blur/fade reveal). Built on house
// tokens, the spark, and Motion.
import { SPARK } from "./spark.js";
import { icon } from "./icons.js";
import { animate, stagger, reduce, SPRING_SOFT, EASE_OUT } from "./motion.js";
import { api } from "../auth.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzChats extends HTMLElement {
  connectedCallback() {
    this.classList.add("chats");
    this._conversing = false;
    this.render();

    this._stage = this.querySelector(".chats-stage");
    this._composer = this.querySelector(".chats-composer");
    this._input = this.querySelector(".chats-input");

    // Attachments
    this._files = [];
    this._fid = 0;
    this._filesRow = this.querySelector(".chats-files");
    this._fileInput = this.querySelector(".chats-file-input");
    this.querySelector(".chats-attach").addEventListener("click", () => this._fileInput.click());
    this._fileInput.addEventListener("change", (e) => {
      this.addFiles(e.target.files);
      this._fileInput.value = ""; // let the same file be picked again later
    });
    // Click (or Enter/Space) a card to remove it — it flies up and out.
    this._filesRow.addEventListener("click", (e) => {
      const card = e.target.closest(".chats-file");
      if (card) this.flyAway(card);
    });
    this._filesRow.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".chats-file");
      if (card) {
        e.preventDefault();
        this.flyAway(card);
      }
    });
    this.wireDrop();

    this._input.addEventListener("input", () => this.grow());
    // Enter sends, Shift+Enter makes a newline (chat convention).
    this._input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this._composer.requestSubmit();
      }
    });
    this._composer.addEventListener("submit", (e) => {
      e.preventDefault();
      this.send();
    });

    // Click anywhere on the prompt area (padding, the foot row, empty space) to
    // focus the textarea — except on the real interactive children. mousedown +
    // preventDefault keeps focus from flashing to the clicked element first.
    this._composer.addEventListener("mousedown", (e) => {
      if (e.target.closest("button, a, input, textarea, .chats-file")) return;
      e.preventDefault();
      const end = this._input.value.length;
      this._input.focus();
      this._input.setSelectionRange(end, end);
    });
  }

  grow() {
    const t = this._input;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 200) + "px";
  }

  async send() {
    const text = this._input.value.trim();
    const fileCount = this._files.length;
    if ((!text && !fileCount) || this._busy) return;
    this._busy = true;
    this._input.value = "";
    this.grow();
    this.clearFiles(); // attachments go with the message
    this.setSending(true);

    if (!this._conversing) this.dockComposer();

    this.addUserMessage(text, fileCount); // your message
    await sleep(reduce ? 0 : 240);
    this._history = this._history || [];
    let reply;
    try {
      const res = await api("/chat", { method: "POST", body: { text, history: this._history } });
      reply = (res && res.reply) || "…";
    } catch {
      reply = "Sorry — I couldn’t reach the assistant just now.";
    }
    await this.addMarzyReply(reply, null); // her reply, streamed in
    this._history.push({ Author: "you", Text: text, FromBot: false }, { Author: "", Text: reply, FromBot: true });

    this.setSending(false);
    this._busy = false;
  }

  // First send: the composer glides down from the centered landing to the
  // bottom dock (FLIP). The center stage stays put and becomes Marzy's work.
  dockComposer() {
    this._conversing = true;
    const first = this._composer.getBoundingClientRect();
    this.classList.add("is-conversing");
    this.appendChild(this._composer); // out of the centered cluster, to the bottom
    const last = this._composer.getBoundingClientRect();
    const dy = first.top - last.top;
    if (!reduce && dy) {
      this._composer.style.transform = `translateY(${dy}px)`; // pre-place before paint
      animate(this._composer, { y: [dy, 0] }, SPRING_SOFT).finished.then(() => (this._composer.style.transform = ""));
    }
  }

  // Keep the latest message in view as the thread grows.
  scrollDown() {
    this._stage.scrollTop = this._stage.scrollHeight;
  }

  // Your message — a right-aligned bubble.
  addUserMessage(text, fileCount) {
    const msg = document.createElement("div");
    msg.className = "chats-msg chats-msg-user";
    const bubble = document.createElement("div");
    bubble.className = "chats-msg-bubble";
    bubble.textContent = text || (fileCount ? `${fileCount} attachment${fileCount > 1 ? "s" : ""}` : "");
    msg.appendChild(bubble);
    this._stage.appendChild(msg);
    if (!reduce) {
      msg.style.opacity = "0";
      animate(msg, { opacity: [0, 1], y: [8, 0] }, { duration: 0.22, ease: EASE_OUT }).finished.then(
        () => (msg.style.opacity = "")
      );
    }
    this.scrollDown();
  }

  // Marzy's reply — spark + a short typing beat, then the text streams in word
  // by word (the blur/fade reveal that reads like live output).
  async addMarzyReply(text, embed) {
    const msg = document.createElement("div");
    msg.className = "chats-msg chats-msg-marzy";
    msg.innerHTML = `<div class="chats-msg-bubble"><div class="typing" aria-label="Marzy is typing"><i></i><i></i><i></i></div></div>`;
    this._stage.appendChild(msg);
    if (!reduce) {
      msg.style.opacity = "0";
      animate(msg, { opacity: [0, 1], y: [8, 0] }, { duration: 0.22, ease: EASE_OUT }).finished.then(
        () => (msg.style.opacity = "")
      );
    }
    this.scrollDown();

    await sleep(reduce ? 0 : 700);

    const bubble = msg.querySelector(".chats-msg-bubble");
    const words = text.split(" ").map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
    bubble.innerHTML = `<p class="chats-msg-text">${words}</p>`;
    this.scrollDown();

    if (reduce) {
      if (embed) this.appendEmbed(bubble, embed);
      return;
    }

    const wEls = bubble.querySelectorAll(".w");
    wEls.forEach((w) => (w.style.opacity = "0"));
    await animate(
      wEls,
      { opacity: [0, 1], filter: ["blur(2px)", "blur(0px)"] },
      { delay: stagger(0.02), duration: 0.26 }
    ).finished;
    wEls.forEach((w) => (w.style.opacity = ""));
    this.scrollDown();

    if (embed) this.appendEmbed(bubble, embed); // the card rises in under the text
  }

  // Drop an embed (table / image) below the reply text and float it in.
  appendEmbed(bubble, embed) {
    const wrap = document.createElement("div");
    wrap.className = "chats-msg-embed";
    wrap.innerHTML = `<${embed}></${embed}>`;
    bubble.appendChild(wrap);
    this.scrollDown();
    if (reduce) return;
    wrap.style.opacity = "0";
    animate(wrap, { opacity: [0, 1], y: [14, 0], scale: [0.97, 1] }, { ...SPRING_SOFT, delay: 0.05 }).finished.then(() => {
      wrap.style.opacity = "";
      this.scrollDown();
    });
  }

  setSending(on) {
    this._composer.classList.toggle("is-sending", on);
    this.querySelector(".chats-send").disabled = on;
  }

  // ── Attachments ───────────────────────────────────────────────
  // Each lands as a little card, tossed down at a slight random angle. Images
  // get a real thumbnail (object URL); everything else gets a file glyph.
  addFiles(fileList) {
    const newIds = [];
    for (const file of fileList) {
      const id = String(++this._fid);
      this._files.push({
        id,
        file,
        rot: Math.random() * 14 - 7, // -7°..7°
        ty: Math.random() * 6 - 3, // -3px..3px
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      });
      newIds.push(id);
    }
    this.renderFiles();
    if (reduce) return;
    for (const id of newIds) {
      const card = this._filesRow.querySelector(`.chats-file[data-id="${id}"]`);
      if (!card) continue;
      card.style.opacity = "0"; // pre-hide before paint, then settle in
      animate(card, { opacity: [0, 1] }, { duration: 0.24 }).finished.then(() => (card.style.opacity = ""));
    }
  }

  // Remove a card: it flies up and fades, then the rest spring in to fill the
  // gap (FLIP). Rotation lives on an inner wrapper, so the outer card is free to
  // animate translate without fighting the jumble transform.
  async flyAway(card) {
    if (card.dataset.removing) return;
    card.dataset.removing = "1";
    const id = card.dataset.id;
    const others = [...this._filesRow.querySelectorAll(".chats-file")].filter((c) => c !== card);
    const first = others.map((c) => ({ el: c, r: c.getBoundingClientRect() }));

    card.style.pointerEvents = "none";
    if (!reduce) {
      await animate(card, { y: [0, -68], opacity: [1, 0], scale: [1, 0.9] }, { duration: 0.3, ease: [0.4, 0, 1, 1] }).finished;
    }

    const f = this._files.find((f) => f.id === id);
    if (f && f.url) URL.revokeObjectURL(f.url);
    this._files = this._files.filter((f) => f.id !== id);
    card.remove();
    this._filesRow.hidden = this._files.length === 0;
    if (reduce) return;

    // FLIP the survivors into their new spots with a slight bounce.
    for (const { el, r } of first) {
      const now = el.getBoundingClientRect();
      const dx = r.left - now.left;
      const dy = r.top - now.top;
      if (!dx && !dy) continue;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      animate(el, { x: [dx, 0], y: [dy, 0] }, { type: "spring", stiffness: 420, damping: 30 }).finished.then(
        () => (el.style.transform = "")
      );
    }
  }

  clearFiles() {
    if (!this._files.length) return;
    this._files.forEach((f) => f.url && URL.revokeObjectURL(f.url));
    this._files = [];
    this.renderFiles();
  }

  renderFiles() {
    this._filesRow.hidden = this._files.length === 0;
    this._filesRow.innerHTML = this._files
      .map(({ id, file, rot, ty, url }) => {
        const preview = url ? `<img src="${url}" alt="" />` : icon("file");
        return `<span class="chats-file" data-id="${id}" role="button" tabindex="0" aria-label="Remove ${esc(file.name)}">
          <span class="chats-file-inner" style="--rot:${rot.toFixed(2)}deg; --ty:${ty.toFixed(2)}px">
            <span class="chats-file-preview">${preview}</span>
            <span class="chats-file-name">${esc(file.name)}</span>
          </span>
        </span>`;
      })
      .join("");
  }

  // Drag a file anywhere over the chat to attach it; the composer lights up.
  wireDrop() {
    let depth = 0;
    const hasFiles = (e) => e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("Files");
    const show = (on) => this._composer.classList.toggle("is-dragging", on);
    this.addEventListener("dragenter", (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth++;
      show(true);
    });
    this.addEventListener("dragover", (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    });
    this.addEventListener("dragleave", (e) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) show(false);
    });
    this.addEventListener("drop", (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      show(false);
      if (e.dataTransfer.files.length) this.addFiles(e.dataTransfer.files);
    });
  }

  render() {
    this.innerHTML = `
      <div class="chats-stage">
        <div class="chats-answer">
          <span class="chats-mark" aria-hidden="true">${SPARK}</span>
          <h2 class="chats-greeting">What can Marzy do for you?</h2>
        </div>
        <form class="chats-composer">
          <div class="chats-files" hidden></div>
          <textarea class="chats-input" rows="1" placeholder="Ask Marzy to run a task, reconcile the books, draft payroll…" aria-label="Message Marzy"></textarea>
          <div class="chats-composer-foot">
            <button type="button" class="chats-attach" aria-label="Add attachment">${icon("paperclip")}</button>
            <button type="submit" class="chats-send" aria-label="Send">${icon("send")}</button>
          </div>
          <input type="file" class="chats-file-input" multiple hidden aria-hidden="true" />
          <div class="chats-drop-hint" aria-hidden="true">${icon("paperclip")}<span>Drop files to attach</span></div>
        </form>
      </div>`;
  }
}
customElements.define("mz-chats", MzChats);

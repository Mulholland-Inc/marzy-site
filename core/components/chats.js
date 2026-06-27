// <mz-chats></mz-chats> — the Chats home: one big central prompt to Marzy
// (Claude/ChatGPT style). Empty, it's a centered composer; on the first send
// the composer glides down to dock at the bottom (FLIP), the greeting fades,
// your message springs in, and Marzy replies — a typing beat, then the answer
// streamed word by word. Built on house tokens, the shared spark, and Motion.
import { SPARK } from "./spark.js";
import { icon } from "./icons.js";
import { animate, stagger, reduce, SPRING_SOFT } from "./motion.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Canned, on-brand replies — Marzy is the ops/finance agent. Light keyword
// routing so the answer feels like it read the prompt.
function reply(text) {
  const t = text.toLowerCase();
  if (t.includes("payroll"))
    return "I drafted this month's payroll from the latest timesheets — hours match every employee. It's ready for your approval whenever you are.";
  if (t.includes("invoice") || t.includes("reconcile") || t.includes("books"))
    return "I reconciled the open invoices against the books. Three need a second look; the rest closed clean. Want me to walk you through the flagged ones?";
  if (t.includes("summary") || t.includes("summar") || t.includes("week") || t.includes("status"))
    return "Here's the week at a glance: payroll is on track, onboarding sits at 42%, and 412 transactions synced overnight. Nothing's blocked on you right now.";
  if (t.includes("onboard") || t.includes("hire"))
    return "I can take the new hire end to end — I'll pre-fill the Gusto profile, request the I-9 and direct-deposit details, and set up the onboarding tasks.";
  return "On it. I'll handle this across your connected tools and surface only what needs your call.";
}

class MzChats extends HTMLElement {
  connectedCallback() {
    this.classList.add("chats");
    this._conversing = false;
    this.render();

    this._composer = this.querySelector(".chats-composer");
    this._input = this.querySelector(".chats-input");

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
  }

  grow() {
    const t = this._input;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 200) + "px";
  }

  async send() {
    const text = this._input.value.trim();
    if (!text || this._busy) return;
    this._input.value = "";
    this.grow();
    if (!this._conversing) this.startConversation();
    this.addUser(text);
    await this.respond(text);
  }

  // Transition from the centered landing to the docked thread layout, gliding
  // the composer down from where it sat to the bottom (FLIP).
  startConversation() {
    this._conversing = true;
    const chatsRect = this.getBoundingClientRect();
    const first = this._composer.getBoundingClientRect();
    const stage = this.querySelector(".chats-stage");
    const stageRect = stage.getBoundingClientRect();

    // Build the thread layout: a scroll area on top, composer docked below.
    const scroll = document.createElement("div");
    scroll.className = "chats-scroll";
    this._thread = document.createElement("div");
    this._thread.className = "chats-thread";
    scroll.appendChild(this._thread);
    this._scroll = scroll;

    this.classList.add("is-conversing");
    this.insertBefore(scroll, stage);
    this.appendChild(this._composer); // move composer out of the stage, to the bottom

    if (reduce) {
      stage.remove();
    } else {
      // Pin the leaving greeting where it sat (out of flow), then fade it up —
      // so it doesn't shift the composer's docked position we're about to measure.
      Object.assign(stage.style, {
        position: "absolute",
        top: stageRect.top - chatsRect.top + "px",
        left: stageRect.left - chatsRect.left + "px",
        width: stageRect.width + "px",
        margin: "0",
        pointerEvents: "none",
      });
      animate(stage, { opacity: [1, 0], y: [0, -10] }, { duration: 0.24 }).finished.then(() => stage.remove());
    }

    // FLIP: invert the composer's position, then release it with a soft spring.
    const last = this._composer.getBoundingClientRect();
    const dy = first.top - last.top;
    if (!reduce && dy) animate(this._composer, { y: [dy, 0] }, SPRING_SOFT);
  }

  addUser(text) {
    const el = document.createElement("div");
    el.className = "msg msg-user";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    el.appendChild(bubble);
    this._thread.appendChild(el);
    this.enter(el);
    this.scrollDown();
  }

  async respond(text) {
    this._busy = true;
    this.setSending(true);
    await sleep(380);
    const typing = this.addTyping();
    await sleep(950);
    typing.remove();
    this.addMarzy(reply(text));
    this.setSending(false);
    this._busy = false;
  }

  addTyping() {
    const el = document.createElement("div");
    el.className = "msg msg-marzy";
    el.innerHTML = `<span class="msg-avatar" aria-hidden="true">${SPARK}</span><div class="msg-body"><span class="typing"><i></i><i></i><i></i></span></div>`;
    this._thread.appendChild(el);
    this.enter(el);
    this.scrollDown();
    return el;
  }

  addMarzy(text) {
    const el = document.createElement("div");
    el.className = "msg msg-marzy";
    el.innerHTML = `<span class="msg-avatar" aria-hidden="true">${SPARK}</span><div class="msg-body"></div>`;
    const body = el.querySelector(".msg-body");
    body.innerHTML = text.split(" ").map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
    this._thread.appendChild(el);
    this.scrollDown();
    if (reduce) return;
    animate(el.querySelector(".msg-avatar"), { opacity: [0, 1], scale: [0.7, 1] }, SPRING_SOFT);
    // Stream the words in on a gentle stagger, then keep the view pinned.
    animate(
      el.querySelectorAll(".w"),
      { opacity: [0, 1], filter: ["blur(2px)", "blur(0px)"] },
      { delay: stagger(0.022), duration: 0.26 }
    ).finished.then(() => this.scrollDown());
  }

  // Shared bubble entrance — fade + rise + a touch of scale.
  enter(el) {
    if (reduce) return;
    animate(el, { opacity: [0, 1], y: [12, 0], scale: [0.98, 1] }, SPRING_SOFT);
  }

  setSending(on) {
    this._composer.classList.toggle("is-sending", on);
    this.querySelector(".chats-send").disabled = on;
  }

  scrollDown() {
    if (!this._scroll) return;
    this._scroll.scrollTo({ top: this._scroll.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }

  render() {
    this.innerHTML = `
      <div class="chats-stage">
        <div class="chats-hero">
          <span class="chats-mark" aria-hidden="true">${SPARK}</span>
          <h2 class="chats-greeting">What can Marzy do for you?</h2>
        </div>
        <form class="chats-composer">
          <textarea class="chats-input" rows="1" placeholder="Ask Marzy to run a task, reconcile the books, draft payroll…" aria-label="Message Marzy"></textarea>
          <div class="chats-composer-foot">
            <button type="submit" class="chats-send" aria-label="Send">${icon("send")}</button>
          </div>
        </form>
      </div>`;
  }
}
customElements.define("mz-chats", MzChats);

// <mz-chats></mz-chats> — the Chats home. The composer is docked at the bottom;
// the center shows a single answer from Marzy. You never see your own message:
// on send, the centered card crossfades to a typing beat, then Marzy's reply
// streams in word by word — replacing whatever was there. Stateless, no thread.
// Built on house tokens, the shared spark, and Motion.
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

    this._stage = this.querySelector(".chats-stage");
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
    this._busy = true;
    this._input.value = "";
    this.grow();
    this.setSending(true);

    if (!this._conversing) this.dockComposer();

    await this.swap(this.typingNode());
    await sleep(950);
    await this.swap(this.answerNode(reply(text)), true);

    this.setSending(false);
    this._busy = false;
  }

  // First send: the composer glides down from the centered landing to the
  // bottom dock (FLIP). The center stage stays put and becomes Marzy's answer.
  dockComposer() {
    this._conversing = true;
    const first = this._composer.getBoundingClientRect();
    this.classList.add("is-conversing");
    this.appendChild(this._composer); // move out of the centered cluster, to the bottom
    const last = this._composer.getBoundingClientRect();
    const dy = first.top - last.top;
    if (!reduce && dy) animate(this._composer, { y: [dy, 0] }, SPRING_SOFT);
  }

  // Crossfade the centered card: out with the old, in with the new. When
  // `stream`, the spark pops and the reply's words ripple in word by word.
  async swap(node, stream = false) {
    const old = this._stage.firstElementChild;
    if (old) {
      if (reduce) old.remove();
      else {
        await animate(old, { opacity: [1, 0], y: [0, -8], scale: [1, 0.98] }, { duration: 0.2 }).finished;
        old.remove();
      }
    }
    this._stage.appendChild(node);
    if (reduce) return;
    if (stream) {
      animate(node.querySelector(".chats-mark"), { opacity: [0, 1], scale: [0.7, 1] }, SPRING_SOFT);
      animate(
        node.querySelectorAll(".w"),
        { opacity: [0, 1], filter: ["blur(2px)", "blur(0px)"] },
        { delay: stagger(0.022), duration: 0.26 }
      );
    } else {
      animate(node, { opacity: [0, 1], y: [10, 0] }, SPRING_SOFT);
    }
  }

  typingNode() {
    const el = document.createElement("div");
    el.className = "chats-answer";
    el.innerHTML = `<span class="chats-mark" aria-hidden="true">${SPARK}</span><span class="typing"><i></i><i></i><i></i></span>`;
    return el;
  }

  answerNode(text) {
    const el = document.createElement("div");
    el.className = "chats-answer";
    const words = text.split(" ").map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
    el.innerHTML = `<span class="chats-mark" aria-hidden="true">${SPARK}</span><p class="chats-reply">${words}</p>`;
    return el;
  }

  setSending(on) {
    this._composer.classList.toggle("is-sending", on);
    this.querySelector(".chats-send").disabled = on;
  }

  render() {
    this.innerHTML = `
      <div class="chats-stage">
        <div class="chats-answer">
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

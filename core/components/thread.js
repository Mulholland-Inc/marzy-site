// <mz-thread></mz-thread>, animated Slack-style conversation card. Cycles
// through Marzy ↔ operator exchanges, one at a time (Marzy → operator →
// Marzy), then fades to the next. Lifted out of the product hero so it can
// stand on its own.
import { SPARK } from "./spark.js";

// Each conversation: Marzy (proactive) → operator → Marzy delivers an artifact.
// The third message is an embedded component ({ embed: "<tag>" }) instead of text.
const CONVOS = [
  [
    ["marzy", "Pulled the new intake from Dr. Lee's office and verified eligibility."],
    ["op", "The chart too?"],
    ["marzy", { embed: "mz-embed-doc" }],
  ],
  [
    ["marzy", "I've closed the March books."],
    ["op", "Anything flagged?"],
    ["marzy", { embed: "mz-embed-table" }],
  ],
  [
    ["marzy", "Payroll is drafted from this week's 14 timesheets."],
    ["op", "Hours look right?"],
    ["marzy", { embed: "mz-embed-checklist" }],
  ],
  [
    ["marzy", "Cleared today's inbox and handled the routine items."],
    ["op", "Exceptions?"],
    ["marzy", { embed: "mz-embed-kanban" }],
  ],
];

// content is either a string (text bubble) or { embed: "<tag>" } (artifact card).
function msgEl(sender, content) {
  const isM = sender === "marzy";
  const el = document.createElement("div");
  const avatar = `<span class="msg-avatar ${isM ? "marzy" : "op"}">${isM ? SPARK : "D"}</span>`;
  const head = `<div class="msg-head"><span class="msg-name">${isM ? "Marzy" : "Dana"}</span></div>`;
  if (content && typeof content === "object" && content.embed) {
    el.className = "msg msg-embed";
    el.innerHTML = `${avatar}<div class="msg-body">${head}</div>`;
    el.querySelector(".msg-body").appendChild(document.createElement(content.embed));
  } else {
    el.className = "msg";
    el.innerHTML = `${avatar}<div class="msg-body">${head}<div class="msg-text">${content}</div></div>`;
  }
  return el;
}
function typingEl() {
  const el = document.createElement("div");
  el.className = "msg";
  el.innerHTML = `<span class="msg-avatar marzy">${SPARK}</span><div class="typing-dots"><span></span><span></span><span></span></div>`;
  return el;
}

class MzThread extends HTMLElement {
  connectedCallback() {
    this.classList.add("thread");
    let gen = 0;

    const play = (i) => {
      const convo = CONVOS[i];
      const my = ++gen;
      this.replaceChildren(msgEl(convo[0][0], convo[0][1])); // Marzy
      setTimeout(() => {
        if (my !== gen) return;
        this.appendChild(msgEl(convo[1][0], convo[1][1])); // operator
        setTimeout(() => {
          if (my !== gen) return;
          const t = typingEl();
          this.appendChild(t);
          setTimeout(() => {
            if (my !== gen) return;
            t.remove();
            this.appendChild(msgEl(convo[2][0], convo[2][1])); // Marzy
          }, 1000);
        }, 850);
      }, 850);
    };

    play(0);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Advance to the next conversation on a loop.
    let i = 0;
    setInterval(() => {
      i = (i + 1) % CONVOS.length;
      play(i);
    }, 5200);
  }
}
customElements.define("mz-thread", MzThread);

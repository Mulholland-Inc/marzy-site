// <mz-thread></mz-thread>, animated Slack-style conversation card. Cycles
// through Marzy ↔ operator exchanges, one at a time (Marzy → operator →
// Marzy), then fades to the next. Lifted out of the product hero so it can
// stand on its own.
import { SPARK } from "./spark.js";

// Each conversation: Marzy (proactive) → operator → Marzy.
const CONVOS = [
  [
    ["marzy", "Pulled the new intake from Dr. Lee's office and verified eligibility."],
    ["op", "The chart too?"],
    ["marzy", "Already built. Approve it and I'll book the visit."],
  ],
  [
    ["marzy", "I've closed the March books."],
    ["op", "Anything flagged?"],
    ["marzy", "3 of 412 transactions. The summary is in your inbox."],
  ],
  [
    ["marzy", "Payroll is drafted from this week's 14 timesheets."],
    ["op", "Hours look right?"],
    ["marzy", "Matched to every employee. Approve and I'll file it now."],
  ],
  [
    ["marzy", "Cleared today's inbox and handled the routine items."],
    ["op", "Exceptions?"],
    ["marzy", "3 invoices over the limit. Queued for your approval."],
  ],
];

function msgEl(sender, text) {
  const isM = sender === "marzy";
  const el = document.createElement("div");
  el.className = "msg";
  el.innerHTML = `<span class="msg-avatar ${isM ? "marzy" : "op"}">${isM ? SPARK : "D"}</span><div class="msg-body"><div class="msg-head"><span class="msg-name">${isM ? "Marzy" : "Dana"}</span></div><div class="msg-text">${text}</div></div>`;
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

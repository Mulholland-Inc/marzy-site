// <mz-family-hero></mz-family-hero>, typewriter headline (left) paired with an
// animated Slack-style thread (right) that switches to a conversation matching
// the vertical as soon as the word finishes typing.
import { SPARK } from "./spark.js";

const WORDS = ["Dental", "Accounting", "Healthcare", "Payroll", "Operations"];
// Each thread: Marzy (proactive) → operator → Marzy.
const THREADS = {
  Dental: [
    ["marzy", "Pulled the new intake from Dr. Lee's office and verified eligibility."],
    ["op", "The chart too?"],
    ["marzy", "Already built. Approve it and I'll book the visit."],
  ],
  Accounting: [
    ["marzy", "I've closed the March books."],
    ["op", "Anything flagged?"],
    ["marzy", "3 of 412 transactions. The summary is in your inbox."],
  ],
  Healthcare: [
    ["marzy", "Ran eligibility on all 38 patients for Tuesday's clinic."],
    ["op", "And the gaps?"],
    ["marzy", "2 need prior auth. I filed the requests this morning."],
  ],
  Payroll: [
    ["marzy", "Payroll is drafted from this week's 14 timesheets."],
    ["op", "Hours look right?"],
    ["marzy", "Matched to every employee. Approve and I'll file it now."],
  ],
  Operations: [
    ["marzy", "Cleared today's inbox and handled the routine items."],
    ["op", "Exceptions?"],
    ["marzy", "3 invoices over the limit. Queued for your approval."],
  ],
};
const rand = (a, b) => a + Math.random() * (b - a);

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

class MzFamilyHero extends HTMLElement {
  connectedCallback() {
    this.classList.add("famhero");
    this.innerHTML = `
      <div class="famhero-copy">
        <h1 class="famhero-title">Marzy for<br /><span class="typer"><span class="type-text">${WORDS[0]}</span><span class="type-cursor" aria-hidden="true"></span></span></h1>
        <p class="lead">One AI agent for the back office, now tailored to your industry. Same engine, built for the way your field actually works.</p>
        <div class="actions">
          <a class="btn btn-primary" href="#">Get a demo</a>
          <a class="btn btn-outline" href="#">Explore products</a>
        </div>
      </div>
      <div class="thread" data-thread></div>`;

    const out = this.querySelector(".type-text");
    const thread = this.querySelector("[data-thread]");
    let gen = 0;
    const renderThread = (word) => {
      const convo = THREADS[word];
      if (!convo) return;
      const my = ++gen;
      thread.replaceChildren(msgEl(convo[0][0], convo[0][1])); // Marzy
      setTimeout(() => {
        if (my !== gen) return;
        thread.appendChild(msgEl(convo[1][0], convo[1][1])); // operator
        setTimeout(() => {
          if (my !== gen) return;
          const t = typingEl();
          thread.appendChild(t);
          setTimeout(() => {
            if (my !== gen) return;
            t.remove();
            thread.appendChild(msgEl(convo[2][0], convo[2][1])); // Marzy
          }, 1000);
        }, 850);
      }, 850);
    };

    renderThread(WORDS[0]);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let wi = 0, ci = WORDS[0].length, deleting = true;
    const tick = () => {
      const word = WORDS[wi];
      if (!deleting) {
        ci++;
        out.textContent = word.slice(0, ci);
        if (ci >= word.length) {
          deleting = true;
          renderThread(word);
          return setTimeout(tick, rand(2600, 3400));
        }
        setTimeout(tick, rand(55, 145) + (Math.random() < 0.12 ? 230 : 0));
      } else {
        ci--;
        out.textContent = word.slice(0, ci);
        if (ci <= 0) {
          deleting = false;
          wi = (wi + 1) % WORDS.length;
          return setTimeout(tick, rand(280, 520));
        }
        setTimeout(tick, rand(38, 95));
      }
    };
    setTimeout(tick, 2600);
  }
}
customElements.define("mz-family-hero", MzFamilyHero);

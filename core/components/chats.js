// <mz-chats></mz-chats> — the Chats home. The composer starts centered with the
// greeting and glides to the bottom on first send (FLIP). You never see your own
// message: the center shows Marzy *working* — a short run of thinking steps /
// tool calls that tick off one by one — then it crossfades to her report (a line
// plus an embedded card). Ask again and the report clears, she thinks afresh, and
// writes a new one. Stateless, no thread. Built on house tokens, the spark, the
// shared embed cards, and Motion.
import { SPARK } from "./spark.js";
import { icon } from "./icons.js";
import { animate, stagger, reduce, SPRING_SOFT } from "./motion.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// What Marzy does for a prompt: the steps she works through (with the tool each
// touches), the line she lands on, and the embedded card she returns. Lightly
// keyword-routed so it feels like she read the request.
const PLANS = [
  {
    match: ["payroll", "pay"],
    steps: [
      { label: "Reading June timesheets", tool: "Gusto" },
      { label: "Matching hours to employees", tool: "" },
      { label: "Calculating taxes & deductions", tool: "" },
      { label: "Drafting the pay run", tool: "" },
    ],
    lead: "June payroll is drafted from 14 timesheets — it's ready for your approval.",
    embed: "mz-embed-table",
  },
  {
    match: ["invoice", "reconcile", "books", "ledger"],
    steps: [
      { label: "Pulling open invoices", tool: "QuickBooks" },
      { label: "Matching against the ledger", tool: "" },
      { label: "Flagging anomalies", tool: "" },
    ],
    lead: "I reconciled 412 transactions — three need a second look, the rest closed clean.",
    embed: "mz-embed-table",
  },
  {
    match: ["onboard", "hire", "new hire"],
    steps: [
      { label: "Creating the employee profile", tool: "Gusto" },
      { label: "Requesting I-9 & direct deposit", tool: "" },
      { label: "Scheduling orientation", tool: "Calendar" },
    ],
    lead: "I've kicked off onboarding — here's where the new hire stands.",
    embed: "mz-embed-checklist",
  },
  {
    match: ["summary", "summar", "week", "status", "standup"],
    steps: [
      { label: "Gathering this week's activity", tool: "" },
      { label: "Checking task progress", tool: "" },
      { label: "Summarizing", tool: "" },
    ],
    lead: "Here's where things stand this week — nothing's blocked on you.",
    embed: "mz-embed-kanban",
  },
];
const DEFAULT_PLAN = {
  steps: [
    { label: "Understanding the request", tool: "" },
    { label: "Checking connected tools", tool: "" },
    { label: "Preparing a plan", tool: "" },
  ],
  lead: "Here's what I pulled together.",
  embed: "mz-embed-doc",
};

function planFor(text) {
  const t = text.toLowerCase();
  return PLANS.find((p) => p.match.some((m) => t.includes(m))) || DEFAULT_PLAN;
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

    const plan = planFor(text);
    await this.swap(this.thinkNode());          // Marzy starts working
    await this.runSteps(plan.steps);            // steps tick off one by one
    await sleep(reduce ? 0 : 380);
    await this.swap(this.reportNode(plan), (n) => this.revealReport(n)); // her report

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
    if (!reduce && dy) animate(this._composer, { y: [dy, 0] }, SPRING_SOFT);
  }

  // Crossfade the centered card: out with the old, in with the new. `enter`
  // customizes the entrance (default: a soft fade-up).
  async swap(node, enter) {
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
    if (enter) enter(node);
    else animate(node, { opacity: [0, 1], y: [10, 0] }, SPRING_SOFT);
  }

  thinkNode() {
    const el = document.createElement("div");
    el.className = "think";
    el.innerHTML = `
      <div class="think-head">
        <span class="chats-mark think-mark" aria-hidden="true">${SPARK}</span>
        <span class="think-title">Working on it…</span>
      </div>
      <div class="think-list"></div>`;
    return el;
  }

  // Append the steps one at a time: each shows a spinner, then resolves to a
  // check and dims as the next appears.
  async runSteps(steps) {
    const list = this._stage.querySelector(".think-list");
    for (const s of steps) {
      const row = document.createElement("div");
      row.className = "think-step";
      row.innerHTML = `<span class="think-ind is-loading"></span><span class="think-label">${esc(s.label)}</span>${
        s.tool ? `<span class="think-tool">${esc(s.tool)}</span>` : ""
      }`;
      list.appendChild(row);
      if (!reduce) animate(row, { opacity: [0, 1], y: [6, 0] }, { duration: 0.28 });
      await sleep(reduce ? 0 : 620);
      const ind = row.querySelector(".think-ind");
      ind.classList.replace("is-loading", "is-done");
      ind.innerHTML = icon("check");
      row.classList.add("is-done");
      await sleep(reduce ? 0 : 150);
    }
  }

  reportNode(plan) {
    const el = document.createElement("div");
    el.className = "chats-report";
    const words = plan.lead.split(" ").map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
    el.innerHTML = `
      <div class="chats-report-lead">
        <span class="chats-mark" aria-hidden="true">${SPARK}</span>
        <p class="chats-reply">${words}</p>
      </div>
      <div class="chats-report-embed"><${plan.embed}></${plan.embed}></div>`;
    return el;
  }

  // Report entrance: spark pops, the line ripples in word by word, the card
  // rises in just after.
  revealReport(n) {
    animate(n.querySelector(".chats-mark"), { opacity: [0, 1], scale: [0.7, 1] }, SPRING_SOFT);
    animate(
      n.querySelectorAll(".w"),
      { opacity: [0, 1], filter: ["blur(2px)", "blur(0px)"] },
      { delay: stagger(0.02), duration: 0.26 }
    );
    animate(
      n.querySelector(".chats-report-embed"),
      { opacity: [0, 1], y: [14, 0], scale: [0.97, 1] },
      { ...SPRING_SOFT, delay: 0.18 }
    );
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

// <mz-embed-checklist></mz-embed-checklist>, a compact display-only checklist
// card for embedding in Slack / MCP surfaces. Static state, no inputs.
import { SPARK } from "./spark.js";

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>';
const ITEMS = [
  ["Sign offer letter", true],
  ["Collect tax forms", true],
  ["Set up payroll", true],
  ["Provision accounts", false],
  ["Schedule orientation", false],
];

class MzEmbedChecklist extends HTMLElement {
  connectedCallback() {
    this.classList.add("embed", "embed-check");
    const done = ITEMS.filter(([, d]) => d).length;
    const items = ITEMS.map(
      ([text, d]) =>
        `<li class="${d ? "is-done" : ""}"><span class="ck">${d ? CHECK : ""}</span><span>${text}</span></li>`
    ).join("");
    this.innerHTML = `
      <div class="embed-head"><span class="embed-mark">${SPARK}</span><span class="embed-title">New hire onboarding</span><span class="embed-meta">${done}/${ITEMS.length}</span></div>
      <ul class="embed-check-list">${items}</ul>`;
  }
}
customElements.define("mz-embed-checklist", MzEmbedChecklist);

// <mz-timeline></mz-timeline>, engagement timeline: a forward-deployed
// Mulholland engineer embeds, audits the back office, automates it behind your
// approval, then keeps scaling. A centered stack of phase cards, each joined
// to the next by a short line.
const STEPS = [
  [
    "Week 0",
    "A forward-deployed engineer embeds",
    "A Mulholland engineer sits with your operators and maps how work actually moves, system by system.",
  ],
  [
    "Weeks 1–2",
    "We audit every workflow",
    "The engineer shadows the back office, documents each handoff, and marks what is safe to automate.",
  ],
  [
    "Weeks 3–4",
    "We automate behind your approval",
    "Agents are built and tested against your real data, then shipped so nothing runs without your sign-off.",
  ],
  [
    "Ongoing",
    "We scale with you",
    "New workflows come online every week. You keep the audit trail, the controls, and your engineer.",
  ],
];

class MzTimeline extends HTMLElement {
  connectedCallback() {
    this.classList.add("timeline");
    this.innerHTML = STEPS.map(
      ([when, title, desc]) =>
        `<div class="tl-step"><span class="tl-when">${when}</span><h3 class="tl-title">${title}</h3><p class="tl-desc">${desc}</p></div>`
    ).join("");
  }
}
customElements.define("mz-timeline", MzTimeline);

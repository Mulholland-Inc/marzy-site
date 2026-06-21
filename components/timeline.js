// <mz-timeline></mz-timeline>, engagement timeline. Two lightweight entry paths
// (a guided demo or a scoped pilot) converge at a checkpoint; if you're happy,
// the full forward-deployed Mulholland engagement begins below.
const ENTRY = [
  ["2–3 days", "Guided demo", "A walkthrough on sample data so you can see Marzy work end to end."],
  ["~1 week", "Scoped pilot", "A limited run on your real data. Length depends on the scope you pick."],
];
const GATE = ["Checkpoint", "You're satisfied", "Happy with the pilot, we kick off the full engagement."];
const TRAJ = [
  ["Week 0", "An engineer embeds", "A Mulholland engineer sits with your operators and maps how work actually moves."],
  ["Weeks 1–2", "We audit every workflow", "They document each handoff and mark what is safe to automate."],
  ["Weeks 3–4", "We automate behind approval", "Agents are tested on real data, then shipped so nothing runs without sign-off."],
  ["Ongoing", "We scale with you", "New workflows come online every week. You keep the audit trail and the controls."],
];

const card = ([when, title, desc], cls = "") =>
  `<div class="tl-step ${cls}"><span class="tl-when">${when}</span><h3 class="tl-title">${title}</h3><p class="tl-desc">${desc}</p></div>`;
const PIPES = `<div class="tl-pipes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>`;
// Orthogonal routes (straight runs + rounded 90° bends) that step inward and
// converge into a tight bundle at the checkpoint — the pipes aesthetic.
const MERGE = `<svg class="tl-merge" viewBox="0 0 520 64" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <path class="pn" d="M120 0 V26 Q120 38 132 38 H240 Q252 38 252 50 V64"/>
    <path class="pv" d="M132 0 V26 Q132 38 144 38 H246 Q258 38 258 50 V64"/>
    <path class="pv" d="M388 0 V26 Q388 38 376 38 H274 Q262 38 262 50 V64"/>
    <path class="pn" d="M400 0 V26 Q400 38 388 38 H280 Q268 38 268 50 V64"/>
  </svg>`;

class MzTimeline extends HTMLElement {
  connectedCallback() {
    this.classList.add("timeline");
    this.innerHTML = `
      <div class="tl-paths">${ENTRY.map((e) => card(e)).join("")}</div>
      ${MERGE}
      ${card(GATE, "tl-gate")}
      <div class="tl-trunk">${TRAJ.map((t) => PIPES + card(t)).join("")}</div>`;
  }
}
customElements.define("mz-timeline", MzTimeline);

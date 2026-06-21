// <mz-timeline></mz-timeline>, engagement timeline. Two lightweight entry paths
// (a guided demo or a scoped pilot) converge at a checkpoint; if you're happy,
// the full forward-deployed Mulholland engagement runs down the trunk. All the
// connectors use the shared buildPipes() bundle, so they match <mz-pipes>.
import { buildPipes } from "./pipe.js";

const ENTRY = [
  ["2–3 days", "Guided demo", "A walkthrough on sample data so you can see Marzy work end to end."],
  ["~1 week", "Scoped pilot", "A limited run on your real data. Length depends on the scope you pick."],
];
const GATE = ["Checkpoint", "You're satisfied", "Happy with the pilot, we kick off the full engagement."];
const TRAJ = [
  ["Week 0", "An engineer embeds", "A Mulholland engineer sits with your operators and maps how work actually moves."],
  ["Weeks 1–2", "We audit every workflow", "They document each handoff and mark what is safe to automate."],
  ["Weeks 3–4", "We automate behind approval", "Agents are tested on real data, then shipped so nothing runs without sign-off."],
];
const GATE2 = ["Checkpoint", "Review, then scale", "We measure the impact together and pick the next workflows to automate."];

// Two routes that step inward (rounded 90° bends) into one evenly-spaced
// bundle at the checkpoint.
const MERGE = [
  [[126, 0], [126, 32], [246, 32], [246, 72]],
  [[394, 0], [394, 32], [282, 32], [282, 72]],
];

function cardEl([when, title, desc], cls) {
  const d = document.createElement("div");
  d.className = "tl-step" + (cls ? ` ${cls}` : "");
  d.innerHTML = `<span class="tl-when">${when}</span><h3 class="tl-title">${title}</h3><p class="tl-desc">${desc}</p>`;
  return d;
}
// A straight vertical pipe bundle joining one card to the next.
function connector() {
  const svg = buildPipes({ routes: [[[30, 0], [30, 40]]], width: 60, height: 40, n: 5, spacing: 7, radius: 0 });
  svg.classList.add("tl-conn");
  return svg;
}

class MzTimeline extends HTMLElement {
  connectedCallback() {
    this.classList.add("timeline");

    const paths = document.createElement("div");
    paths.className = "tl-paths";
    ENTRY.forEach((e) => paths.appendChild(cardEl(e)));
    this.appendChild(paths);

    const merge = buildPipes({ routes: MERGE, width: 520, height: 72, n: 5, spacing: 7, radius: 16 });
    merge.classList.add("tl-merge");
    this.appendChild(merge);

    this.appendChild(cardEl(GATE, "tl-gate"));

    TRAJ.forEach((t) => {
      this.appendChild(connector());
      this.appendChild(cardEl(t));
    });

    this.appendChild(connector());
    this.appendChild(cardEl(GATE2, "tl-gate"));
  }
}
customElements.define("mz-timeline", MzTimeline);

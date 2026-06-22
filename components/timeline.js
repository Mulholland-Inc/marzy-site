// <mz-timeline></mz-timeline>, engagement timeline, left to right. Two entry
// paths (a guided demo or a scoped pilot) converge at a checkpoint; the engineer
// embeds; work then diverges into audit + automate and merges into the review
// checkpoint. Pipes (shared buildPipes) flow between every card; the converging
// and diverging branches are measured/redrawn so they line up with the cards.
import { buildPipes } from "./pipe.js";

const ENTRY = [
  ["2–3 days", "Guided demo", "See Marzy work on sample data."],
  ["~1 week", "Scoped pilot", "A scoped run on your real data."],
];
const GATE = ["Checkpoint", "Proven on the pilot", "You've seen the hours and dollars it saves."];
const EMBED = ["Week 0", "Engineer embeds", "A Mulholland engineer maps how work moves."];
const SPLIT = [
  ["Weeks 1–2", "You audit", "You flag what's safe to automate."],
  ["Weeks 3–4", "We automate", "Agents shipped behind your approval."],
];
const GATE2 = ["Ongoing", "Margins keep improving", "We report the time and money each automation wins back."];

function cardEl([when, title, desc], cls) {
  const d = document.createElement("div");
  d.className = "tl-step" + (cls ? ` ${cls}` : "");
  d.innerHTML = `<span class="tl-when">${when}</span><h3 class="tl-title">${title}</h3><p class="tl-desc">${desc}</p>`;
  return d;
}
function colEl(pair) {
  const col = document.createElement("div");
  col.className = "tl-col";
  const c1 = cardEl(pair[0]);
  const c2 = cardEl(pair[1]);
  col.append(c1, c2);
  return { col, c1, c2 };
}
function connector() {
  const wrap = document.createElement("div");
  wrap.className = "tl-conn-h";
  wrap.appendChild(buildPipes({ routes: [[[0, 28], [36, 28]]], width: 36, height: 56, n: 5, spacing: 7, radius: 0 }));
  return wrap;
}
function branchEl() {
  const d = document.createElement("div");
  d.className = "tl-branch";
  return d;
}

class MzTimeline extends HTMLElement {
  connectedCallback() {
    this.classList.add("timeline");
    const row = document.createElement("div");
    row.className = "tl-row";

    const entry = colEl(ENTRY);
    const split = colEl(SPLIT);
    const bMerge1 = branchEl();
    const bDiverge = branchEl();
    const bMerge2 = branchEl();

    row.append(
      entry.col,
      bMerge1,
      cardEl(GATE, "tl-gate"),
      connector(),
      cardEl(EMBED),
      bDiverge,
      split.col,
      bMerge2,
      cardEl(GATE2, "tl-gate")
    );
    this.appendChild(row);

    // [branch element, top card, bottom card, mode]
    this._branches = [
      [bMerge1, entry.c1, entry.c2, "merge"],
      [bDiverge, split.c1, split.c2, "diverge"],
      [bMerge2, split.c1, split.c2, "merge"],
    ];

    const draw = () => this.layout();
    requestAnimationFrame(draw);
    if ("ResizeObserver" in window) {
      this._ro = new ResizeObserver(draw);
      this._ro.observe(row);
    }
  }

  disconnectedCallback() {
    this._ro?.disconnect();
  }

  layout() {
    for (const [el, c1, c2, mode] of this._branches) this.drawBranch(el, c1, c2, mode);
  }

  // Connect a single side and a two-card side with a pipe bundle.
  drawBranch(el, c1, c2, mode) {
    const mb = el.getBoundingClientRect();
    if (!mb.width || !mb.height) return;
    const r1 = c1.getBoundingClientRect();
    const r2 = c2.getBoundingClientRect();
    const W = mb.width, H = mb.height, yc = H / 2, mx = W / 2;
    const y1 = r1.top + r1.height / 2 - mb.top;
    const y2 = r2.top + r2.height / 2 - mb.top;
    const routes =
      mode === "diverge"
        ? [
            [[0, yc - 10], [mx, yc - 10], [mx, y1], [W, y1]],
            [[0, yc + 10], [mx, yc + 10], [mx, y2], [W, y2]],
          ]
        : [
            [[0, y1], [mx, y1], [mx, yc - 10], [W, yc - 10]],
            [[0, y2], [mx, y2], [mx, yc + 10], [W, yc + 10]],
          ];
    el.replaceChildren(buildPipes({ routes, width: W, height: H, n: 3, spacing: 7, radius: 12, preserve: "none" }));
  }
}
customElements.define("mz-timeline", MzTimeline);

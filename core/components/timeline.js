// <mz-timeline></mz-timeline>, engagement timeline. Two entry paths (a guided
// demo or a scoped pilot) converge at a checkpoint; the engineer embeds; work
// diverges into audit + automate and merges into the review checkpoint. Pipes
// (shared buildPipes) flow between every card. Laid out left-to-right on
// desktop and top-down on mobile; the converge/diverge branches and the
// connectors are measured and redrawn for whichever orientation is active.
import { buildPipes } from "./pipe.js";

const ENTRY = [
  ["2–3 days", "Guided demo", "See Marzy work on sample data."],
  ["~1 week", "Scoped pilot", "A scoped run on your real data."],
];
const GATE = ["Checkpoint", "Proven on pilot", "You've seen the hours and dollars it saves."];
const EMBED = ["Week 0", "Engineer embeds", "A Mulholland engineer maps how work moves."];
const SPLIT = [
  ["Weeks 1–2", "You audit", "You flag what's safe to automate."],
  ["Weeks 3–4", "We automate", "Agents shipped behind your approval."],
];
const GATE2 = ["Ongoing", "Margins keep improving", "Each automation compounds."];

const MOBILE = "(max-width: 640px)";

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
function el(cls) {
  const d = document.createElement("div");
  d.className = cls;
  return d;
}

class MzTimeline extends HTMLElement {
  connectedCallback() {
    this.classList.add("timeline");
    const row = el("tl-row");

    const entry = colEl(ENTRY);
    const split = colEl(SPLIT);
    const bMerge1 = el("tl-branch");
    const bDiverge = el("tl-branch");
    const bMerge2 = el("tl-branch");
    const conn = el("tl-conn-h");

    row.append(
      entry.col,
      bMerge1,
      cardEl(GATE, "tl-gate"),
      conn,
      cardEl(EMBED),
      bDiverge,
      split.col,
      bMerge2,
      cardEl(GATE2, "tl-gate")
    );
    this.appendChild(row);

    this._branches = [
      [bMerge1, entry.c1, entry.c2, "merge"],
      [bDiverge, split.c1, split.c2, "diverge"],
      [bMerge2, split.c1, split.c2, "merge"],
    ];
    this._conns = [conn];

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
    const vertical = matchMedia(MOBILE).matches;
    for (const [b, c1, c2, mode] of this._branches) this.drawBranch(b, c1, c2, mode, vertical);
    for (const c of this._conns) this.drawConn(c, vertical);
  }

  drawConn(elem, vertical) {
    const b = elem.getBoundingClientRect();
    if (!b.width || !b.height) return;
    const W = b.width, H = b.height;
    const routes = vertical ? [[[W / 2, 0], [W / 2, H]]] : [[[0, H / 2], [W, H / 2]]];
    elem.replaceChildren(buildPipes({ routes, width: W, height: H, n: 5, spacing: 7, radius: 0, preserve: "none" }));
  }

  // Connect a single side to a two-card side with a pipe bundle, in whichever
  // orientation is active.
  drawBranch(elem, c1, c2, mode, vertical) {
    const mb = elem.getBoundingClientRect();
    if (!mb.width || !mb.height) return;
    const r1 = c1.getBoundingClientRect();
    const r2 = c2.getBoundingClientRect();
    const W = mb.width, H = mb.height;
    let routes;
    if (vertical) {
      // cards sit in a row (side by side); flow runs top -> bottom
      const x1 = r1.left + r1.width / 2 - mb.left;
      const x2 = r2.left + r2.width / 2 - mb.left;
      const xc = W / 2, my = H / 2;
      routes =
        mode === "diverge"
          ? [
              [[xc - 10, 0], [xc - 10, my], [x1, my], [x1, H]],
              [[xc + 10, 0], [xc + 10, my], [x2, my], [x2, H]],
            ]
          : [
              [[x1, 0], [x1, my], [xc - 10, my], [xc - 10, H]],
              [[x2, 0], [x2, my], [xc + 10, my], [xc + 10, H]],
            ];
    } else {
      // cards sit in a column (stacked); flow runs left -> right
      const y1 = r1.top + r1.height / 2 - mb.top;
      const y2 = r2.top + r2.height / 2 - mb.top;
      const yc = H / 2, mx = W / 2;
      routes =
        mode === "diverge"
          ? [
              [[0, yc - 10], [mx, yc - 10], [mx, y1], [W, y1]],
              [[0, yc + 10], [mx, yc + 10], [mx, y2], [W, y2]],
            ]
          : [
              [[0, y1], [mx, y1], [mx, yc - 10], [W, yc - 10]],
              [[0, y2], [mx, y2], [mx, yc + 10], [W, yc + 10]],
            ];
    }
    elem.replaceChildren(buildPipes({ routes, width: W, height: H, n: 3, spacing: 7, radius: 12, preserve: "none" }));
  }
}
customElements.define("mz-timeline", MzTimeline);

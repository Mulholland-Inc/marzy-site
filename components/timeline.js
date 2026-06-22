// <mz-timeline></mz-timeline>, engagement timeline, left to right. Two entry
// paths (a guided demo or a scoped pilot) converge at a checkpoint; from there
// the forward-deployed Mulholland engagement runs across, ending on a review
// checkpoint. Pipes (shared buildPipes) flow between every card; the converging
// merge is measured/redrawn so it always lines up with the two entry cards.
import { buildPipes } from "./pipe.js";

const ENTRY = [
  ["2–3 days", "Guided demo", "On sample data."],
  ["~1 week", "Scoped pilot", "On your real data."],
];
const GATE = ["Checkpoint", "You're satisfied", "Pilot approved."];
const TRAJ = [
  ["Week 0", "Engineer embeds", "Maps how work moves."],
  ["Weeks 1–4", "Audit & automate", "Shipped with approval."],
];
const GATE2 = ["Ongoing", "Review & scale", "Pick what's next."];

function cardEl([when, title, desc], cls) {
  const d = document.createElement("div");
  d.className = "tl-step" + (cls ? ` ${cls}` : "");
  d.innerHTML = `<span class="tl-when">${when}</span><h3 class="tl-title">${title}</h3><p class="tl-desc">${desc}</p>`;
  return d;
}
function connector() {
  const wrap = document.createElement("div");
  wrap.className = "tl-conn-h";
  wrap.appendChild(buildPipes({ routes: [[[0, 28], [36, 28]]], width: 36, height: 56, n: 5, spacing: 7, radius: 0 }));
  return wrap;
}

class MzTimeline extends HTMLElement {
  connectedCallback() {
    this.classList.add("timeline");
    const row = document.createElement("div");
    row.className = "tl-row";

    const entry = document.createElement("div");
    entry.className = "tl-entry";
    ENTRY.forEach((e) => entry.appendChild(cardEl(e)));
    row.appendChild(entry);

    const merge = document.createElement("div");
    merge.className = "tl-merge-h";
    row.appendChild(merge);

    const main = document.createElement("div");
    main.className = "tl-main";
    main.appendChild(cardEl(GATE, "tl-gate"));
    TRAJ.forEach((t) => {
      main.appendChild(connector());
      main.appendChild(cardEl(t));
    });
    main.appendChild(connector());
    main.appendChild(cardEl(GATE2, "tl-gate"));
    row.appendChild(main);

    this.appendChild(row);
    this._entry = entry;
    this._merge = merge;

    const draw = () => this.drawMerge();
    requestAnimationFrame(draw);
    if ("ResizeObserver" in window) {
      this._ro = new ResizeObserver(draw);
      this._ro.observe(row);
    }
  }

  disconnectedCallback() {
    this._ro?.disconnect();
  }

  // Converge the two entry cards into a single bundle at the merge's right edge.
  drawMerge() {
    const m = this._merge;
    const mb = m.getBoundingClientRect();
    if (!mb.width || !mb.height) return;
    const [c1, c2] = this._entry.children;
    const r1 = c1.getBoundingClientRect();
    const r2 = c2.getBoundingClientRect();
    const W = mb.width, H = mb.height, yc = H / 2, mx = W * 0.5;
    const y1 = r1.top + r1.height / 2 - mb.top;
    const y2 = r2.top + r2.height / 2 - mb.top;
    const routes = [
      [[0, y1], [mx, y1], [mx, yc - 10], [W, yc - 10]],
      [[0, y2], [mx, y2], [mx, yc + 10], [W, yc + 10]],
    ];
    m.replaceChildren(
      buildPipes({ routes, width: W, height: H, n: 3, spacing: 7, radius: 12, preserve: "none" })
    );
  }
}
customElements.define("mz-timeline", MzTimeline);

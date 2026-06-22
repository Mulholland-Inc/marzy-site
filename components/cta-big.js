// <mz-cta-big heading="…" sub="…"></mz-cta-big>, a large dark call-to-action:
// centered title, a full-width pipes band, then the buttons. The pipes are
// drawn to the band's exact pixels (no scaling, no crop) and redrawn on resize.
import { buildPipes } from "./pipe.js";

// The pipes divider's serpentine, normalized to 0..1, so we can map it to the
// band's exact pixels (keeps the same composition, no scaling/cropping).
const LEVELS = [
  [0, 0.47], [0.179, 0.47], [0.179, 1], [0.343, 1],
  [0.343, 0.067], [0.507, 0.067], [0.507, 0.87], [0.627, 0.87],
  [0.627, 0], [0.806, 0], [0.806, 0.67], [1, 0.67],
];

function serpentine(W, H) {
  const pad = 30; // keeps the bundle off the top/bottom edges (no clip)
  const span = Math.max(20, H - 2 * pad);
  const pts = LEVELS.map(([nx, ny]) => [nx * W, pad + ny * span]);
  pts.unshift([-40, pts[0][1]]); // bleed left
  pts.push([W + 40, pts[pts.length - 1][1]]); // bleed right
  return pts;
}

class MzCtaBig extends HTMLElement {
  connectedCallback() {
    this.classList.add("ctabig");
    const heading = this.getAttribute("heading") || "Stop running the back office.";
    const sub =
      this.getAttribute("sub") ||
      "Let Marzy run it. See your own workflows automated in a 30-minute demo.";

    const inner = document.createElement("div");
    inner.className = "ctabig-inner";
    inner.innerHTML = `<h2>${heading}</h2><p>${sub}</p>`;
    this.appendChild(inner);

    this._band = document.createElement("div");
    this._band.className = "ctabig-pipes";
    this.appendChild(this._band);

    const actions = document.createElement("div");
    actions.className = "actions ctabig-actions";
    actions.innerHTML = `
      <a class="btn btn-primary" href="#">Get a demo</a>
      <a class="btn ctaband-ghost" href="#">Talk to us</a>`;
    this.appendChild(actions);

    const draw = () => this.drawPipes();
    requestAnimationFrame(draw);
    if ("ResizeObserver" in window) {
      this._ro = new ResizeObserver(draw);
      this._ro.observe(this._band);
    }
  }

  disconnectedCallback() {
    this._ro?.disconnect();
  }

  drawPipes() {
    const b = this._band.getBoundingClientRect();
    if (!b.width || !b.height) return;
    const W = Math.round(b.width), H = Math.round(b.height);
    this._band.replaceChildren(
      buildPipes({ routes: [serpentine(W, H)], width: W, height: H, n: 7, spacing: 9, radius: 28, preserve: "none", fade: false })
    );
  }
}
customElements.define("mz-cta-big", MzCtaBig);

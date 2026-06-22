// <mz-cta-big heading="…" sub="…"></mz-cta-big>, a large dark call-to-action:
// centered title, then a full-width animated pipes band, then the buttons.
import { buildPipes } from "./pipe.js";

// Same serpentine route as the pipes divider.
const PTS = [
  [-60, 120], [180, 120], [180, 200], [400, 200],
  [400, 60], [620, 60], [620, 180], [840, 180],
  [840, 50], [1060, 50], [1060, 150], [1280, 150],
];

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

    const pipes = buildPipes({ routes: [PTS], width: 1200, height: 240, n: 7, spacing: 9, radius: 44, preserve: "xMidYMid slice" });
    pipes.classList.add("ctabig-pipes");
    this.appendChild(pipes);

    const actions = document.createElement("div");
    actions.className = "actions ctabig-actions";
    actions.innerHTML = `
      <a class="btn btn-primary" href="#">Get a demo</a>
      <a class="btn ctaband-ghost" href="#">Talk to us</a>`;
    this.appendChild(actions);
  }
}
customElements.define("mz-cta-big", MzCtaBig);

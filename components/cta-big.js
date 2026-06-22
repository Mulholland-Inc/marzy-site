// <mz-cta-big heading="…" sub="…"></mz-cta-big>, a large dark call-to-action
// with a centered title over an animated pipes backdrop and a pair of buttons.
import { buildPipes } from "./pipe.js";

// Same serpentine route as the pipes divider, used as a faint moving backdrop.
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

    const bg = buildPipes({ routes: [PTS], width: 1200, height: 240, n: 7, spacing: 9, radius: 44, preserve: "xMidYMid slice" });
    bg.classList.add("ctabig-bg");
    this.appendChild(bg);

    const inner = document.createElement("div");
    inner.className = "ctabig-inner";
    inner.innerHTML = `
      <h2>${heading}</h2>
      <p>${sub}</p>
      <div class="actions">
        <a class="btn btn-primary" href="#">Get a demo</a>
        <a class="btn ctaband-ghost" href="#">Talk to us</a>
      </div>`;
    this.appendChild(inner);
  }
}
customElements.define("mz-cta-big", MzCtaBig);

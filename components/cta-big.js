// <mz-cta-big heading="…" sub="…"></mz-cta-big>, a large dark call-to-action:
// centered title, then a full-width animated pipes band, then the buttons.
import { buildPipes } from "./pipe.js";

// Serpentine sized to fill the band's viewBox (0 0 1340 160) so, stretched with
// preserveAspectRatio:none, it runs edge to edge with no crop.
const PTS = [
  [0, 77], [240, 77], [240, 130], [460, 130],
  [460, 37], [680, 37], [680, 117], [900, 117],
  [900, 30], [1120, 30], [1120, 97], [1340, 97],
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

    // Stretch to fill the band exactly: edge to edge, no crop.
    const pipes = buildPipes({ routes: [PTS], width: 1340, height: 160, n: 5, spacing: 10, radius: 20, preserve: "none" });
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

// <mz-pipes></mz-pipes>, animated pipes divider. Built from the shared
// buildPipes() bundle so it matches the pipes used in the engagement timeline.
import { buildPipes } from "./pipe.js";

const PTS = [
  [-60, 120], [180, 120], [180, 200], [400, 200],
  [400, 60], [620, 60], [620, 180], [840, 180],
  [840, 50], [1060, 50], [1060, 150], [1280, 150],
];

class MzPipes extends HTMLElement {
  connectedCallback() {
    this.classList.add("pipes");
    this.appendChild(
      buildPipes({ routes: [PTS], width: 1200, height: 240, n: 7, spacing: 9, radius: 44, preserve: "xMidYMid slice" })
    );
  }
}
customElements.define("mz-pipes", MzPipes);

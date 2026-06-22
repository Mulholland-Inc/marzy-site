// <mz-gallery></mz-gallery>, screenshot / media grid (marketing). Uses branded
// placeholder tiles in place of real imagery.
import { SPARK } from "./spark.js";

const SHOTS = [
  ["Dashboard", "Everything awaiting you, in one view"],
  ["Inbox", "Marzy reads and acts on what arrives"],
  ["Reports", "Close the books with a full trail"],
  ["Connections", "Every system in one ontology"],
];

class MzGallery extends HTMLElement {
  connectedCallback() {
    this.classList.add("shots");
    this.innerHTML = SHOTS.map(
      ([tag, caption]) => `
      <figure class="gal-item">
        <div class="gal-media"><span class="gal-mark">${SPARK}</span><span class="gal-tag">${tag}</span></div>
        <figcaption>${caption}</figcaption>
      </figure>`
    ).join("");
  }
}
customElements.define("mz-gallery", MzGallery);

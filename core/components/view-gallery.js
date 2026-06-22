// <mz-view-gallery></mz-view-gallery>, a media/gallery perspective: each object
// as a tile with a branded placeholder image.
import { SPARK } from "./spark.js";
import { RECORDS, byId, emitSelect, avatarHTML } from "./data.js";

class MzViewGallery extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.innerHTML = `<div class="shots">${RECORDS.map(
      (r) => `<figure class="gal-item" data-id="${r.id}">
        <div class="gal-media"><span class="gal-mark">${SPARK}</span><span class="gal-tag">${r.tag}</span></div>
        <figcaption class="gal-cap"><span class="gal-cap-title">${r.title}</span>${avatarHTML(r.assignee)}</figcaption>
      </figure>`
    ).join("")}</div>`;
    this.addEventListener("click", (e) => {
      const fig = e.target.closest(".gal-item[data-id]");
      if (fig) emitSelect(this, byId(fig.dataset.id));
    });
  }
}
customElements.define("mz-view-gallery", MzViewGallery);

// <mz-view-gallery></mz-view-gallery>, a media/gallery perspective: each object
// as a tile. Renders from this._records (set via setData), default RECORDS.
import { SPARK } from "./spark.js";
import { RECORDS, byId, emitSelect, avatarHTML } from "./data.js";

class MzViewGallery extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.addEventListener("click", (e) => {
      const fig = e.target.closest(".gal-item[data-id]");
      if (fig) emitSelect(this, byId(fig.dataset.id));
    });
    this.render();
  }
  setData(records) {
    this._records = records;
    this.render();
  }
  render() {
    const recs = this._records || RECORDS;
    this.innerHTML = recs.length
      ? `<div class="shots">${recs
          .map(
            (r) => `<figure class="gal-item" data-id="${r.id}">
        <div class="gal-media"><span class="gal-mark">${SPARK}</span><span class="gal-tag">${r.tag}</span></div>
        <figcaption class="gal-cap"><span class="gal-cap-title">${r.title}</span>${avatarHTML(r.assignee)}</figcaption>
      </figure>`
          )
          .join("")}</div>`
      : `<mz-empty heading="Nothing here">No items match the current filters.</mz-empty>`;
  }
}
customElements.define("mz-view-gallery", MzViewGallery);

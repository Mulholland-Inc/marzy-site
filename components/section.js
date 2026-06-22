// <mz-section bg="soft|panel" size="sm" width="wide|narrow" id="...">...</mz-section>
class MzSection extends HTMLElement {
  connectedCallback() {
    this.classList.add("section");
    if (this.getAttribute("size") === "sm") this.classList.add("section-sm");
    const bg = this.getAttribute("bg");
    if (bg) this.classList.add(`bg-${bg}`);
    const w = this.getAttribute("width");
    const c = w === "wide" ? "container-wide" : w === "narrow" ? "container-narrow" : "container";
    this.innerHTML = `<div class="${c}">${this.innerHTML}</div>`;
  }
}
// <mz-section-head center>…</mz-section-head> — intro block above a section's
// body. center centers it and its text.
class MzSectionHead extends HTMLElement {
  connectedCallback() {
    this.classList.add("section-head");
    if (this.hasAttribute("center")) this.classList.add("section-head-center");
  }
}
customElements.define("mz-section", MzSection);
customElements.define("mz-section-head", MzSectionHead);

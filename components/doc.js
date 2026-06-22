// <mz-doc title="Privacy Policy" meta="Last updated June 1, 2026">…body…</mz-doc>
// A long-form document: a centered, readable column inside a surface card.
// Reuses the .document / .doc type styles (shared with mz-report). Authors
// write plain <h2>, <p>, <ul>, <mz-lead> inside and the .doc rules style them.
// title and meta are optional — omit title to supply your own header markup.
class MzDoc extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title");
    const meta = this.getAttribute("meta");
    const body = this.innerHTML;
    this.classList.add("document");
    const head =
      (title ? `<h1>${title}</h1>` : "") +
      (meta ? `<div class="doc-meta"><span>${meta}</span></div>` : "");
    this.innerHTML = `<article class="doc">${head}${body}</article>`;
  }
}
customElements.define("mz-doc", MzDoc);

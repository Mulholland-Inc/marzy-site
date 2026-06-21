// <mz-topnav></mz-topnav> — floating top nav. Transparent + full-width at rest;
// on scroll the links squeeze and it contracts into a centered rounded bar.
import { SPARK } from "./spark.js";

const LINKS = [
  ["#", "Product"],
  ["#", "Pricing"],
  ["#", "Security"],
  ["#", "Docs"],
];

function scrollParent(el) {
  let p = el.parentElement;
  while (p) {
    const o = getComputedStyle(p).overflowY;
    if (o === "auto" || o === "scroll") return p;
    p = p.parentElement;
  }
  return null;
}

class MzTopnav extends HTMLElement {
  connectedCallback() {
    this.classList.add("topnav");
    this.innerHTML = `<div class="topnav-bar">
      <a class="logo" href="#" aria-label="Marzy home"><span class="spark" aria-hidden="true">${SPARK}</span><span>Marzy</span></a>
      <nav class="topnav-links" aria-label="Primary">${LINKS.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
      <a class="btn btn-primary btn-sm" href="#">Get a demo</a>
    </div>`;
    const root = scrollParent(this);
    const target = root || window;
    const getY = () => (root ? root.scrollTop : window.scrollY);
    const onScroll = () => this.classList.toggle("is-stuck", getY() > 16);
    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
}
customElements.define("mz-topnav", MzTopnav);

// <mz-topnav></mz-topnav>, floating top nav. Transparent + full-width at rest;
// on scroll the links squeeze and it contracts into a centered rounded bar.
// Brand and link targets come from the site's config (window.MZ_SITE).
import { SPARK } from "./spark.js";
import { NAV, CTA, HOME, BRAND } from "./site-config.js";

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
    const [ctaHref, ctaLabel] = CTA;
    this.innerHTML = `<div class="topnav-bar">
      <a class="logo" href="${HOME}" aria-label="${BRAND} home"><span class="spark" aria-hidden="true">${SPARK}</span><span>${BRAND}</span></a>
      <nav class="topnav-links" aria-label="Primary">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
      <a class="btn btn-primary btn-sm" href="${ctaHref}">${ctaLabel}</a>
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

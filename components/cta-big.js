// <mz-cta-big heading="…" sub="…"></mz-cta-big>, a large dark call-to-action:
// centered title, a ring of animated pipes, then the buttons. The ring is sized
// to the band's pixels and redrawn on resize.
import { buildRing } from "./pipe.js";
import { ROUTES } from "./site-map.js";

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

    this._band = document.createElement("div");
    this._band.className = "ctabig-pipes";
    this.appendChild(this._band);

    const actions = document.createElement("div");
    actions.className = "actions ctabig-actions";
    actions.innerHTML = `
      <a class="btn btn-primary" href="${ROUTES.demo}">Get a demo</a>
      <a class="btn ctaband-ghost" href="${ROUTES.contact}">Talk to us</a>`;
    this.appendChild(actions);

    const draw = () => this.drawRing();
    requestAnimationFrame(draw);
    if ("ResizeObserver" in window) {
      this._ro = new ResizeObserver(draw);
      this._ro.observe(this._band);
    }
  }

  disconnectedCallback() {
    this._ro?.disconnect();
  }

  drawRing() {
    const b = this._band.getBoundingClientRect();
    if (!b.height) return;
    const size = Math.round(b.height);
    this._band.replaceChildren(buildRing({ size, n: 7, spacing: 10, pad: 8, fade: false }));
  }
}
customElements.define("mz-cta-big", MzCtaBig);

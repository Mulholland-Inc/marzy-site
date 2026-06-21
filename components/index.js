// Component registry. Each module registers its <mz-*> element synchronously.
import "./spark.js";
import "./container.js";
import "./section.js";
import "./grid.js";
import "./divider.js";
import "./actions.js";
import "./lead.js";
import "./muted.js";
import "./meta.js";
import "./link.js";
import "./btn.js";
import "./card.js";
import "./field.js";
import "./select.js";
import "./switch.js";
import "./slider.js";
import "./datepicker.js";
import "./checkbox.js";
import "./radio.js";
import "./badge.js";
import "./alert.js";
import "./tabs.js";
import "./accordion.js";
import "./table.js";
import "./pricing.js";
import "./progress.js";
import "./bento.js";
import "./invoice.js";
import "./report.js";
import "./contract.js";
import "./empty.js";
import "./footer.js";
import "./sidebar.js";
import "./login.js";

// Scroll-reveal: sections ease up as they enter the viewport (one-shot).
function initReveal() {
  const els = document.querySelectorAll(".preview, .gallery-head");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  els.forEach((el) => el.classList.add("reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => io.observe(el));
}

// Reveal the body once elements have upgraded (no FOUC).
const reveal = () => document.body && document.body.classList.add("mz-ready");
const boot = () => {
  initReveal();
  requestAnimationFrame(reveal);
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
setTimeout(reveal, 1000);

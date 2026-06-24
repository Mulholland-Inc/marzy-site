// Component registry. Each module registers its <mz-*> element synchronously.
import "./spark.js";
import "./container.js";
import "./section.js";
import "./grid.js";
import "./stack.js";
import "./stat.js";
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
import "./activity.js";
import "./calendar.js";
import "./kanban.js";
import "./invoice.js";
import "./report.js";
import "./contract.js";
import "./family-hero.js";
import "./thread.js";
import "./portal-preview.js";
import "./data-control.js";
import "./data-clean.js";
import "./timeline.js";
import "./embed-table.js";
import "./embed-doc.js";
import "./embed-checklist.js";
import "./embed-kanban.js";
import "./quote.js";
import "./post-card.js";
import "./changelog.js";
import "./gallery.js";
import "./logos.js";
import "./cta.js";
import "./cta-big.js";
import "./trust-banner.js";
import "./pipes.js";
import "./workcard.js";
import "./compliance.js";
import "./signup.js";
import "./empty.js";
import "./doc.js";
import "./footer.js";
import "./topnav.js";
import "./view-table.js";
import "./view-board.js";
import "./view-grid.js";
import "./view-gallery.js";
import "./view-todo.js";
import "./mailbox.js";
import "./workspace.js";
import "./toolbar.js";
import "./collection.js";
import "./connectors.js";
import "./app.js";
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

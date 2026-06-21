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
import "./badge.js";
import "./alert.js";
import "./tabs.js";
import "./accordion.js";
import "./table.js";
import "./pricing.js";
import "./sidebar.js";
import "./login.js";

// Reveal the body once elements have upgraded (no FOUC).
const reveal = () => document.body && document.body.classList.add("mz-ready");
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(reveal));
} else {
  requestAnimationFrame(reveal);
}
setTimeout(reveal, 1000);

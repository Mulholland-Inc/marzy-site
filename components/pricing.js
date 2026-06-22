// <mz-pricing></mz-pricing>, three-tier pricing section (marketing).
import { ROUTES } from "./site-map.js";
const CHECK = '<svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>';
const TIERS = [
  { name: "Starter", price: "$0", per: "/mo", cta: "Start free", href: ROUTES.signin, featured: false, feats: ["1 connected system", "100 workflows / mo", "Email support"] },
  { name: "Team", price: "$499", per: "/mo", cta: "Get a demo", href: ROUTES.demo, featured: true, feats: ["Unlimited connectors", "10k workflows / mo", "Review queue & audit log", "Priority support"] },
  { name: "Enterprise", price: "Custom", per: "", cta: "Talk to us", href: ROUTES.contact, featured: false, feats: ["SSO & SCIM", "Dedicated infrastructure", "SLA & onboarding", "Solutions engineer"] },
];
class MzPricing extends HTMLElement {
  connectedCallback() {
    this.classList.add("pricing");
    this.innerHTML = TIERS.map(
      (t) => `<div class="price-card${t.featured ? " is-featured" : ""}">
        <div class="price-head"><span class="price-name">${t.name}</span>${t.featured ? '<span class="badge badge-info">Popular</span>' : ""}</div>
        <div class="price-amt">${t.price}<span>${t.per}</span></div>
        <ul class="price-feats">${t.feats.map((f) => `<li>${CHECK}<span>${f}</span></li>`).join("")}</ul>
        <a class="btn ${t.featured ? "btn-primary" : "btn-outline"}" href="${t.href}">${t.cta}</a>
      </div>`
    ).join("");
  }
}
customElements.define("mz-pricing", MzPricing);

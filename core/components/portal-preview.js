// <mz-portal-preview slug="acme" heading="…" sub="…"></mz-portal-preview>
// Marketing: a headline above a fake browser window framing a miniature client
// portal served from the client's own subdomain (slug.marzy.com).
import { SPARK } from "./spark.js";

const LOCK =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const ICON = {
  overview:
    '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  workflows:
    '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.3 10.9 15.7 7.1M8.3 13.1 15.7 16.9"/></svg>',
  documents:
    '<svg viewBox="0 0 24 24"><path d="M6 3.5h7l5 5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z"/><path d="M13 3.5V9h5"/></svg>',
  billing:
    '<svg viewBox="0 0 24 24"><rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M3.5 10h17"/></svg>',
};
const NAV = [
  ["overview", "Overview", true],
  ["workflows", "Workflows", false],
  ["documents", "Documents", false],
  ["billing", "Billing", false],
];

class MzPortalPreview extends HTMLElement {
  connectedCallback() {
    this.classList.add("portalprev");
    const slug = (this.getAttribute("slug") || "client").trim();
    const heading =
      this.getAttribute("heading") ||
      "Your own workspace and agents.";
    const sub = this.getAttribute("sub") || "";

    const nav = NAV.map(
      ([icon, label, active]) =>
        `<span class="pp-item${active ? " is-active" : ""}">${ICON[icon]}<span>${label}</span></span>`
    ).join("");

    this.innerHTML = `
      <div class="portalprev-head">
        <h2 class="portalprev-title">${heading}</h2>
        ${sub ? `<p class="lead">${sub}</p>` : ""}
      </div>
      <div class="browser" role="img" aria-label="Preview of ${slug}.marzy.com client portal">
        <div class="browser-bar">
          <span class="browser-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="browser-url"><span class="browser-lock">${LOCK}</span><span class="browser-host"><b>${slug}</b>.marzy.com</span></span>
        </div>
        <div class="browser-body">
          <aside class="pp-rail">
            <span class="pp-brand"><span class="pp-brand-mark">${SPARK}</span><span>${slug}</span></span>
            <nav class="pp-nav" aria-hidden="true">${nav}</nav>
            <span class="pp-user"><span class="pp-avatar">${slug.charAt(0).toUpperCase()}</span><span class="pp-user-name">${slug}.inc</span></span>
          </aside>
          <main class="pp-main">
            <header class="pp-topbar">
              <span class="pp-topbar-title">Overview</span>
            </header>
            <div class="pp-content">
              <div class="pp-card">
                <span class="pp-card-label">June payroll</span>
                <span class="pp-card-meta">Drafted from 14 timesheets</span>
                <span class="pp-status pp-status-pending">Needs approval</span>
              </div>
              <div class="pp-card">
                <span class="pp-card-label">Books closed</span>
                <span class="pp-card-meta">412 transactions reconciled</span>
                <span class="pp-status pp-status-done">Done</span>
              </div>
              <div class="pp-row"><span class="pp-row-spark">${SPARK}</span><span class="pp-row-text">Marzy filed 2 prior-auth requests</span><span class="pp-row-time">2m</span></div>
              <div class="pp-row"><span class="pp-row-dot"></span><span class="pp-row-text">Invoice #2049 sent to Dr. Lee</span><span class="pp-row-time">1h</span></div>
            </div>
          </main>
        </div>
      </div>`;
  }
}
customElements.define("mz-portal-preview", MzPortalPreview);

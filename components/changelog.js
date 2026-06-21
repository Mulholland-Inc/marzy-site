// <mz-changelog></mz-changelog>, release notes (marketing). Editorial layout:
// version + summary as the header, monospace ledger codes (NEW/IMP/FIX) instead
// of colored pills, Volt used only as the single accent.
const CODES = { new: "NEW", imp: "IMP", fix: "FIX" };
const ENTRIES = [
  ["v2.4", "June 2026", "Embeds everywhere", [
    ["new", "Slack and MCP embeds: drop compact cards into any channel or tool"],
    ["imp", "Reconciliation runs 3× faster on large ledgers"],
    ["fix", "Scheduled pay runs respect each workspace's timezone"],
  ]],
  ["v2.3", "May 2026", "Your own front door", [
    ["new", "Client portals: a branded workspace on every client's subdomain"],
    ["imp", "Audit trail exports to CSV and PDF"],
  ]],
  ["v2.2", "April 2026", "Hands-on onboarding", [
    ["new", "Forward-deployed engineers embed to map and automate your workflows"],
    ["fix", "Duplicate-invoice detection edge case resolved"],
  ]],
];

class MzChangelog extends HTMLElement {
  connectedCallback() {
    this.classList.add("changelog");
    this.innerHTML = ENTRIES.map(
      ([ver, date, summary, changes]) => `
      <article class="cl-rel">
        <header class="cl-rel-head">
          <h3 class="cl-rel-title"><span class="cl-ver">${ver}</span>${summary}</h3>
          <span class="cl-date">${date}</span>
        </header>
        <ul class="cl-changes">${changes
          .map(([t, txt]) => `<li><span class="cl-code cl-${t}">${CODES[t]}</span><span class="cl-text">${txt}</span></li>`)
          .join("")}</ul>
      </article>`
    ).join("");
  }
}
customElements.define("mz-changelog", MzChangelog);

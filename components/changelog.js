// <mz-changelog></mz-changelog>, release-notes template (marketing). Version and
// date sit on the left; each release's details live in a card on the right.
const TAGS = { new: "New", improved: "Improved", fixed: "Fixed" };
const ENTRIES = [
  ["v2.4", "June 2026", "Embeds everywhere", [
    ["new", "Slack & MCP embeds", "Drop compact, display-only cards into any channel or tool."],
    ["improved", "3× faster reconciliation", "Large ledgers now close in seconds, not minutes."],
    ["fixed", "Scheduled-run drift", "Pay runs respect each workspace's timezone."],
  ]],
  ["v2.3", "May 2026", "Your own front door", [
    ["new", "Client portals", "Every client gets a branded workspace on their own subdomain."],
    ["improved", "Exportable audit trail", "Every action now exports to CSV and PDF."],
  ]],
  ["v2.2", "April 2026", "Hands-on onboarding", [
    ["new", "Forward-deployed engineers", "A Mulholland engineer embeds to map and automate your workflows."],
    ["fixed", "Duplicate invoices", "Edge case in duplicate detection resolved."],
  ]],
];

class MzChangelog extends HTMLElement {
  connectedCallback() {
    this.classList.add("changelog");
    this.innerHTML = ENTRIES.map(
      ([version, date, title, changes]) => `
      <div class="cl-entry">
        <div class="cl-meta"><span class="cl-version">${version}</span><span class="cl-date">${date}</span></div>
        <div class="cl-card">
          <h3 class="cl-title">${title}</h3>
          <ul class="cl-list">${changes
            .map(
              ([t, h, d]) =>
                `<li><span class="cl-tag cl-${t}">${TAGS[t]}</span><div class="cl-change"><b>${h}</b><p>${d}</p></div></li>`
            )
            .join("")}</ul>
        </div>
      </div>`
    ).join("");
  }
}
customElements.define("mz-changelog", MzChangelog);

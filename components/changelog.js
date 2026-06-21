// <mz-changelog></mz-changelog>, release-notes template (marketing).
const TAGS = { new: "New", improved: "Improved", fixed: "Fixed" };
const ENTRIES = [
  ["v2.4", "June 2026", [
    ["new", "Slack & MCP embeds, drop compact cards into any channel"],
    ["improved", "Reconciliation runs 3× faster on large ledgers"],
    ["fixed", "Timezone drift on scheduled pay runs"],
  ]],
  ["v2.3", "May 2026", [
    ["new", "Client portals on your own subdomain"],
    ["improved", "Audit trail exports to CSV and PDF"],
  ]],
  ["v2.2", "April 2026", [
    ["new", "Forward-deployed engineer onboarding"],
    ["fixed", "Duplicate-invoice detection edge case"],
  ]],
];

class MzChangelog extends HTMLElement {
  connectedCallback() {
    this.classList.add("changelog");
    this.innerHTML = ENTRIES.map(
      ([version, date, changes]) => `
      <div class="cl-entry">
        <div class="cl-head"><span class="cl-version">${version}</span><span class="cl-date">${date}</span></div>
        <ul class="cl-list">${changes
          .map(([t, txt]) => `<li><span class="cl-tag cl-${t}">${TAGS[t]}</span><span class="cl-text">${txt}</span></li>`)
          .join("")}</ul>
      </div>`
    ).join("");
  }
}
customElements.define("mz-changelog", MzChangelog);

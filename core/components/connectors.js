// <mz-connectors></mz-connectors>, the integrations directory: a big centered
// title + search, category chips, and a marketplace grid of connector cards
// (logo, name, kind, status, Connect/Manage). Search + category filter live.
import { icon } from "./icons.js";

// Real, full-colour brand logos via DuckDuckGo's favicon service (free, no
// auth), keyed by domain. Falls back to a letter monogram if one can't load.
const LOGO = (domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;

// [name, domain, kind, category, description, connected]
const CONNECTORS = [
  ["Gusto", "gusto.com", "App", "Finance", "Payroll & benefits", true],
  ["QuickBooks", "quickbooks.intuit.com", "App", "Finance", "Billing & ledger", true],
  ["Gmail", "gmail.com", "App", "Comms", "Inbox & email", true],
  ["Slack", "slack.com", "App", "Comms", "Notifications & alerts", true],
  ["Google Drive", "drive.google.com", "App", "Productivity", "Files & storage", true],
  ["Stripe", "stripe.com", "API", "Payments", "Payments & payouts", false],
  ["Plaid", "plaid.com", "API", "Finance", "Bank connections", false],
  ["Notion", "notion.so", "MCP", "Productivity", "Docs, wikis & databases", false],
  ["Salesforce", "salesforce.com", "App", "Records", "Customer relationships", false],
  ["HubSpot", "hubspot.com", "App", "Records", "Marketing & CRM", false],
  ["Xero", "xero.com", "App", "Finance", "Accounting", false],
  ["Airtable", "airtable.com", "App", "Records", "Records & bases", false],
  ["Twilio", "twilio.com", "API", "Comms", "SMS & voice", false],
  ["GitHub", "github.com", "MCP", "Dev", "Repos, issues & PRs", false],
  ["Linear", "linear.app", "MCP", "Dev", "Issues & projects", false],
  ["Snowflake", "snowflake.com", "API", "Data", "Warehouse & queries", false],
];

const mono = (n) => n.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase();

class MzConnectors extends HTMLElement {
  connectedCallback() {
    this.classList.add("connectors");
    this._q = "";
    this.innerHTML = `
      <div class="cn-head">
        <h2 class="cn-title">Connect everything.</h2>
        <p class="cn-sub">Tools, APIs, and MCP servers, all in one place.</p>
        <div class="cn-search">
          <span class="cn-search-ico" aria-hidden="true">${icon("search")}</span>
          <input class="input cn-search-input" type="search" placeholder="Search connectors…" aria-label="Search connectors" />
        </div>
      </div>
      <div class="cn-grid"></div>`;

    this._grid = this.querySelector(".cn-grid");
    this.querySelector(".cn-search-input").addEventListener("input", (e) => {
      this._q = e.target.value;
      this.renderGrid();
    });
    this.renderGrid();
  }

  renderGrid() {
    const term = this._q.trim().toLowerCase();
    const rows = CONNECTORS.filter(([name, domain, kind, cat, desc]) =>
      !term || `${name} ${kind} ${cat} ${desc}`.toLowerCase().includes(term)
    );
    this._grid.innerHTML = rows.length
      ? rows
          .map(
            ([name, domain, kind, cat, desc, connected]) => `
        <div class="cn-card">
          <img class="cn-logo" src="${LOGO(domain)}" alt="${name}" loading="lazy"
            onerror="this.outerHTML='<span class=&quot;cn-logo cn-mono&quot;>${mono(name)}</span>'" />
          <div class="cn-body">
            <div class="cn-name">${name}</div>
            <p class="cn-desc">${desc}</p>
          </div>
          <button type="button" class="btn ${connected ? "btn-outline" : "btn-primary"} btn-sm cn-action">${connected ? "Manage" : "Connect"}</button>
        </div>`
          )
          .join("")
      : `<mz-empty heading="No connectors found">Try a different search.</mz-empty>`;
  }
}
customElements.define("mz-connectors", MzConnectors);

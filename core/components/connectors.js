// <mz-connectors></mz-connectors>, the integrations directory: a big centered
// title + search, category chips, and a marketplace grid of connector cards
// (logo, name, kind, status, Connect/Manage). Search + category filter live.
import { icon } from "./icons.js";

// Real brand logos via Simple Icons (simpleicons.org, CC0), served as raw SVGs
// from the jsDelivr CDN — monochrome (near-black) marks that sit on palette on
// the light logo tile. Falls back to a letter monogram if a logo can't load.
const LOGO = (slug) => `https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${slug}.svg`;

// [name, slug, kind, category, description, connected]
const CONNECTORS = [
  ["Gusto", "gusto", "App", "Finance", "Payroll & benefits", true],
  ["QuickBooks", "quickbooks", "App", "Finance", "Billing & ledger", true],
  ["Gmail", "gmail", "App", "Comms", "Inbox & email", true],
  ["Slack", "slack", "App", "Comms", "Notifications & alerts", true],
  ["Google Drive", "googledrive", "App", "Productivity", "Files & storage", true],
  ["Stripe", "stripe", "API", "Payments", "Payments & payouts", false],
  ["Plaid", "plaid", "API", "Finance", "Bank connections", false],
  ["Notion", "notion", "MCP", "Productivity", "Docs, wikis & databases", false],
  ["Salesforce", "salesforce", "App", "Records", "Customer relationships", false],
  ["HubSpot", "hubspot", "App", "Records", "Marketing & CRM", false],
  ["Xero", "xero", "App", "Finance", "Accounting", false],
  ["Airtable", "airtable", "App", "Records", "Records & bases", false],
  ["Twilio", "twilio", "API", "Comms", "SMS & voice", false],
  ["GitHub", "github", "MCP", "Dev", "Repos, issues & PRs", false],
  ["Linear", "linear", "MCP", "Dev", "Issues & projects", false],
  ["Snowflake", "snowflake", "API", "Data", "Warehouse & queries", false],
];

const mono = (n) => n.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase();

class MzConnectors extends HTMLElement {
  connectedCallback() {
    this.classList.add("connectors");
    this._q = "";
    this.innerHTML = `
      <div class="cn-head">
        <h2 class="cn-title">Connect everything.</h2>
        <p class="cn-sub">Plug Marzy into the tools, APIs, and MCP servers your back office already runs on.</p>
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
    const rows = CONNECTORS.filter(([name, slug, kind, cat, desc]) =>
      !term || `${name} ${kind} ${cat} ${desc}`.toLowerCase().includes(term)
    );
    this._grid.innerHTML = rows.length
      ? rows
          .map(
            ([name, slug, kind, cat, desc, connected]) => `
        <div class="cn-card">
          <img class="cn-logo" src="${LOGO(slug)}" alt="${name}" loading="lazy"
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

// <mz-connectors></mz-connectors>, the integrations directory: a big centered
// title + search, category chips, and a marketplace grid of connector cards
// (logo, name, kind, status, Connect/Manage). Search + category filter live.
import { icon } from "./icons.js";

// [name, kind, category, description, connected]
const CONNECTORS = [
  ["Gusto", "App", "Finance", "Payroll & benefits", true],
  ["QuickBooks", "App", "Finance", "Billing & ledger", true],
  ["Gmail", "App", "Comms", "Inbox & email", true],
  ["Slack", "App", "Comms", "Notifications & alerts", true],
  ["Sikka", "API", "Records", "Practice records (FHIR)", true],
  ["Stripe", "API", "Payments", "Payments & payouts", false],
  ["Plaid", "API", "Finance", "Bank connections", false],
  ["Notion", "MCP", "Productivity", "Docs, wikis & databases", false],
  ["Google Drive", "App", "Productivity", "Files & storage", false],
  ["Salesforce", "App", "Records", "Customer relationships", false],
  ["HubSpot", "App", "Records", "Marketing & CRM", false],
  ["Xero", "App", "Finance", "Accounting", false],
  ["Twilio", "API", "Comms", "SMS & voice", false],
  ["GitHub", "MCP", "Dev", "Repos, issues & PRs", false],
  ["Linear", "MCP", "Dev", "Issues & projects", false],
  ["Snowflake", "API", "Data", "Warehouse & queries", false],
];

const CATEGORIES = ["All", ...new Set(CONNECTORS.map((c) => c[2]))];
const mono = (n) => n.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase();

class MzConnectors extends HTMLElement {
  connectedCallback() {
    this.classList.add("connectors");
    this._q = "";
    this._cat = "All";
    this.innerHTML = `
      <div class="cn-head">
        <h2 class="cn-title">Connect everything.</h2>
        <p class="cn-sub">Plug Marzy into the tools, APIs, and MCP servers your back office already runs on.</p>
        <div class="cn-search">
          <span class="cn-search-ico" aria-hidden="true">${icon("search")}</span>
          <input class="input cn-search-input" type="search" placeholder="Search connectors…" aria-label="Search connectors" />
        </div>
        <div class="cn-cats" role="tablist">
          ${CATEGORIES.map(
            (c) => `<button type="button" class="cn-chip${c === "All" ? " is-active" : ""}" data-cat="${c}">${c}</button>`
          ).join("")}
        </div>
      </div>
      <div class="cn-grid"></div>`;

    this._grid = this.querySelector(".cn-grid");
    this.querySelector(".cn-search-input").addEventListener("input", (e) => {
      this._q = e.target.value;
      this.renderGrid();
    });
    this.querySelector(".cn-cats").addEventListener("click", (e) => {
      const chip = e.target.closest(".cn-chip");
      if (!chip) return;
      this._cat = chip.dataset.cat;
      this.querySelectorAll(".cn-chip").forEach((c) => c.classList.toggle("is-active", c === chip));
      this.renderGrid();
    });
    this.renderGrid();
  }

  renderGrid() {
    const term = this._q.trim().toLowerCase();
    const rows = CONNECTORS.filter(([name, kind, cat, desc]) => {
      if (this._cat !== "All" && cat !== this._cat) return false;
      if (term && !`${name} ${kind} ${cat} ${desc}`.toLowerCase().includes(term)) return false;
      return true;
    });
    this._grid.innerHTML = rows.length
      ? rows
          .map(
            ([name, kind, cat, desc, connected]) => `
        <div class="cn-card">
          <div class="cn-card-top">
            <span class="cn-logo" aria-hidden="true">${mono(name)}</span>
            <mz-badge variant="${connected ? "info" : "neutral"}">${connected ? "Connected" : "Available"}</mz-badge>
          </div>
          <div class="cn-name">${name}</div>
          <div class="cn-kind">${kind} · ${cat}</div>
          <p class="cn-desc">${desc}</p>
          <button type="button" class="btn ${connected ? "btn-outline" : "btn-primary"} btn-sm cn-action">${connected ? "Manage" : "Connect"}</button>
        </div>`
          )
          .join("")
      : `<mz-empty heading="No connectors found">Try a different search or category.</mz-empty>`;
  }
}
customElements.define("mz-connectors", MzConnectors);

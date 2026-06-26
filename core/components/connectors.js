// <mz-connectors></mz-connectors>, the integrations directory. Structured:
// a search + connected count, then one section per category, each a list of
// connector rows (logo, name, kind, Connect/Manage). Search filters live.
import { icon } from "./icons.js";

// Full-colour brand logos via DuckDuckGo's favicon service; letter fallback.
const LOGO = (domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;
const mono = (n) => n.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase();
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// [name, domain, kind, category, description, connected]
const CONNECTORS = [
  ["Gusto", "gusto.com", "App", "Finance", "Payroll & benefits", true],
  ["QuickBooks", "quickbooks.intuit.com", "App", "Finance", "Billing & ledger", true],
  ["Xero", "xero.com", "App", "Finance", "Accounting", false],
  ["Plaid", "plaid.com", "API", "Finance", "Bank connections", false],
  ["Gmail", "gmail.com", "App", "Comms", "Inbox & email", true],
  ["Slack", "slack.com", "App", "Comms", "Notifications & alerts", true],
  ["Twilio", "twilio.com", "API", "Comms", "SMS & voice", false],
  ["Google Drive", "drive.google.com", "App", "Productivity", "Files & storage", true],
  ["Notion", "notion.so", "MCP", "Productivity", "Docs, wikis & databases", false],
  ["Stripe", "stripe.com", "API", "Payments", "Payments & payouts", false],
  ["Salesforce", "salesforce.com", "App", "Records", "Customer relationships", false],
  ["HubSpot", "hubspot.com", "App", "Records", "Marketing & CRM", false],
  ["Airtable", "airtable.com", "App", "Records", "Records & bases", false],
  ["GitHub", "github.com", "MCP", "Dev", "Repos, issues & PRs", false],
  ["Linear", "linear.app", "MCP", "Dev", "Issues & projects", false],
  ["Snowflake", "snowflake.com", "API", "Data", "Warehouse & queries", false],
];

const CATS = ["Finance", "Comms", "Productivity", "Payments", "Records", "Dev", "Data"];

class MzConnectors extends HTMLElement {
  connectedCallback() {
    this.classList.add("cnx");
    this._items = CONNECTORS.map(([name, domain, kind, cat, desc, connected]) => ({ name, domain, kind, cat, desc, connected }));
    this._q = "";

    this.innerHTML = `
      <div class="cnx-toolbar">
        <div class="search cnx-search">
          ${icon("search")}
          <input type="search" class="search-input" placeholder="Search connectors" aria-label="Search connectors" />
        </div>
        <span class="cnx-count t-meta"></span>
      </div>
      <div class="cnx-sections"></div>`;

    this._sections = this.querySelector(".cnx-sections");
    this._count = this.querySelector(".cnx-count");

    this.querySelector(".search-input").addEventListener("input", (e) => {
      this._q = e.target.value;
      this.render();
    });
    this._sections.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-i]");
      if (!btn) return;
      const it = this._items[Number(btn.dataset.i)];
      it.connected = !it.connected;
      this.render();
    });

    this.render();
  }

  render() {
    const term = this._q.trim().toLowerCase();
    const match = (it) => !term || `${it.name} ${it.kind} ${it.cat} ${it.desc}`.toLowerCase().includes(term);

    const connectedTotal = this._items.filter((it) => it.connected).length;
    this._count.textContent = `${connectedTotal} connected · ${this._items.length} available`;

    const row = (it) => {
      const i = this._items.indexOf(it);
      return `<div class="cnx-row${it.connected ? " is-connected" : ""}">
        <img class="cnx-logo" src="${LOGO(it.domain)}" alt="" loading="lazy"
          onerror="this.outerHTML='<span class=&quot;cnx-logo cnx-mono&quot;>${mono(it.name)}</span>'" />
        <div class="cnx-main">
          <div class="cnx-name">${esc(it.name)}</div>
          <div class="cnx-desc t-meta">${esc(it.desc)}</div>
        </div>
        <span class="cnx-kind">${it.kind}</span>
        ${it.connected ? `<span class="cnx-on" title="Connected" aria-hidden="true"></span>` : ""}
        <button type="button" class="btn ${it.connected ? "btn-ghost" : "btn-primary"} btn-sm" data-i="${i}">${it.connected ? "Manage" : "Connect"}</button>
      </div>`;
    };

    const sections = CATS.map((cat) => {
      const items = this._items.filter((it) => it.cat === cat && match(it));
      if (!items.length) return "";
      return `<section class="cnx-cat-sec">
        <h3 class="cnx-cat">${cat}<span>${items.length}</span></h3>
        <div class="cnx-list">${items.map(row).join("")}</div>
      </section>`;
    }).join("");

    this._sections.innerHTML = sections || `<mz-empty heading="No connectors found">Try a different search.</mz-empty>`;
  }
}
customElements.define("mz-connectors", MzConnectors);

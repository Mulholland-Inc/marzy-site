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

// Identity is a category of its own: your linked accounts on external platforms
// (OIDC) so Marzy can verify who it's talking to. [name, domain, handle, as]
const IDENTITY = [
  ["Slack", "slack.com", "@marijn", "@marijn"],
  ["Discord", "discord.com", null, "marijn"],
  ["Google", "google.com", "marijn@mulholland.inc", "marijn@mulholland.inc"],
  ["Microsoft", "microsoft.com", null, "marijn@mulholland.inc"],
  ["GitHub", "github.com", "ietsnut", "ietsnut"],
  ["Apple", "apple.com", null, "marijn@icloud.com"],
];

const CATS = ["Finance", "Comms", "Productivity", "Payments", "Records", "Dev", "Data", "Identity"];

class MzConnectors extends HTMLElement {
  connectedCallback() {
    this.classList.add("cnx");
    this._items = [
      ...CONNECTORS.map(([name, domain, kind, cat, desc, connected]) => ({ name, domain, kind, cat, desc, connected })),
      // identity accounts: `connected` mirrors "linked"; the button links/unlinks
      ...IDENTITY.map(([name, domain, handle, as]) => ({ name, domain, cat: "Identity", identity: true, handle, as })),
    ];
    this._q = "";

    this.innerHTML = `
      <div class="cnx-toolbar">
        <div class="search cnx-search">
          ${icon("search")}
          <input type="search" class="search-input" placeholder="Search connectors" aria-label="Search connectors" />
        </div>
      </div>
      <div class="cnx-sections"></div>`;

    this._sections = this.querySelector(".cnx-sections");

    this.querySelector(".search-input").addEventListener("input", (e) => {
      this._q = e.target.value;
      this.render();
    });
    this._sections.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-i]");
      if (!btn) return;
      const it = this._items[Number(btn.dataset.i)];
      if (it.identity) it.handle = it.handle ? null : it.as; // link / unlink
      else it.connected = !it.connected;
      this.render();
    });

    this.render();
  }

  render() {
    const term = this._q.trim().toLowerCase();
    const text = (it) =>
      it.identity ? `${it.name} ${it.cat} ${it.handle || ""} ${it.as}` : `${it.name} ${it.kind} ${it.cat} ${it.desc}`;
    const match = (it) => !term || text(it).toLowerCase().includes(term);

    const row = (it) => {
      const i = this._items.indexOf(it);
      const on = it.identity ? !!it.handle : it.connected;
      const desc = it.identity ? (it.handle ? esc(it.handle) : "Not linked") : esc(it.desc);
      const label = it.identity ? (on ? "Unlink" : "Link account") : on ? "Manage" : "Connect";
      return `<div class="cnx-row${on ? " is-connected" : ""}">
        <img class="cnx-logo" src="${LOGO(it.domain)}" alt="" loading="lazy"
          onerror="this.outerHTML='<span class=&quot;cnx-logo cnx-mono&quot;>${mono(it.name)}</span>'" />
        <div class="cnx-main">
          <div class="cnx-name">${esc(it.name)}</div>
          <div class="cnx-desc t-meta">${desc}</div>
        </div>
        <button type="button" class="btn ${on ? "btn-ghost" : "btn-primary"} btn-sm" data-i="${i}">${label}</button>
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

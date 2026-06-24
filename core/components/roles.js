// <mz-roles></mz-roles> — configure roles and what each role's Marzy can do:
// its system prompt, the tools it may use, and per-object access. A role rail on
// the left, the selected role's config on the right. Self-contained over a
// sample set; edits update an in-memory model.
import { icon } from "./icons.js";

const TOOLS = [
  "Run payroll",
  "Reconcile invoices",
  "Check eligibility",
  "Send email",
  "Draft documents",
  "Manage calendar",
  "Sync connectors",
  "Export reports",
];
const OBJECTS = ["Tasks", "Projects", "Invoices", "Payroll", "Clients", "Documents", "Connectors"];
const LEVELS = ["None", "Read", "Edit"];

const allEdit = () => Object.fromEntries(OBJECTS.map((o) => [o, "Edit"]));
const allRead = () => Object.fromEntries(OBJECTS.map((o) => [o, "Read"]));

const ROLES = [
  {
    name: "Admin",
    desc: "Full access to everything.",
    prompt:
      "You are Marzy, an autonomous back-office operator for this workspace. Act decisively, keep an auditable trail of every action, and escalate only when a decision exceeds policy limits.",
    tools: new Set(TOOLS),
    objects: allEdit(),
  },
  {
    name: "Member",
    desc: "Day-to-day operations, approvals over the limit.",
    prompt:
      "You are Marzy, helping with day-to-day operations. Draft and prepare work, but hold anything above the approval limit for a human to review.",
    tools: new Set(["Reconcile invoices", "Check eligibility", "Draft documents", "Manage calendar", "Export reports"]),
    objects: { Tasks: "Edit", Projects: "Edit", Invoices: "Read", Payroll: "Read", Clients: "Read", Documents: "Edit", Connectors: "None" },
  },
  {
    name: "Viewer",
    desc: "Read-only oversight.",
    prompt: "You are Marzy in read-only mode. Answer questions and summarize, but never modify records or take any action.",
    tools: new Set(["Export reports"]),
    objects: allRead(),
  },
];

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzRoles extends HTMLElement {
  connectedCallback() {
    this.classList.add("roles");
    this._roles = ROLES.map((r) => ({ ...r, tools: new Set(r.tools), objects: { ...r.objects } }));
    this._i = 0;
    this._seq = 0;

    this.innerHTML = `
      <aside class="roles-rail">
        <div class="roles-rail-head t-caption">Roles</div>
        <div class="roles-list-nav"></div>
        <button type="button" class="btn btn-outline btn-sm roles-new">${icon("plus")}<span>New role</span></button>
      </aside>
      <div class="roles-config"></div>`;

    this._nav = this.querySelector(".roles-list-nav");
    this._cfg = this.querySelector(".roles-config");

    this.querySelector(".roles-new").addEventListener("click", () => this.addRole());
    this._nav.addEventListener("click", (e) => {
      const item = e.target.closest(".roles-item");
      if (!item) return;
      this._i = Number(item.dataset.i);
      this.renderRail();
      this.renderConfig();
    });
    // config interactions
    this._cfg.addEventListener("click", (e) => {
      const sw = e.target.closest(".switch[data-tool]");
      if (!sw) return;
      const on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", on ? "true" : "false");
      const tools = this.role().tools;
      on ? tools.add(sw.dataset.tool) : tools.delete(sw.dataset.tool);
    });
    this._cfg.addEventListener("change", (e) => {
      const sel = e.target.closest("[data-obj]");
      if (sel) this.role().objects[sel.dataset.obj] = sel.value;
    });
    this._cfg.addEventListener("input", (e) => {
      const f = e.target.closest("[data-f]");
      if (!f) return;
      this.role()[f.dataset.f] = e.target.value;
      // keep the rail label in sync with the name, without re-rendering (preserves focus)
      if (f.dataset.f === "name") {
        const b = this._nav.querySelector(".roles-item.is-active b");
        if (b) b.textContent = e.target.value || "Untitled role";
      }
    });

    this.renderRail();
    this.renderConfig();
  }

  role() {
    return this._roles[this._i];
  }

  renderRail() {
    this._nav.innerHTML = this._roles
      .map((r, i) => {
        const tools = r.tools.size;
        return `<button type="button" class="roles-item${i === this._i ? " is-active" : ""}" data-i="${i}">
          <b>${esc(r.name) || "Untitled role"}</b>
          <small>${tools} tool${tools === 1 ? "" : "s"} · ${esc(r.desc) || "No description"}</small>
        </button>`;
      })
      .join("");
  }

  renderConfig() {
    const r = this.role();
    const tools = TOOLS.map(
      (t) => `<div class="roles-row">
        <span class="roles-row-name">${t}</span>
        <button type="button" class="switch" role="switch" aria-checked="${r.tools.has(t)}" data-tool="${t}" aria-label="${t}"><span class="switch-knob"></span></button>
      </div>`
    ).join("");
    const objects = OBJECTS.map(
      (o) => `<div class="roles-row">
        <span class="roles-row-name">${o}</span>
        <div class="select-wrap roles-level">
          <select class="input select" data-obj="${o}" aria-label="${o} access">
            ${LEVELS.map((l) => `<option${l === r.objects[o] ? " selected" : ""}>${l}</option>`).join("")}
          </select>
          ${icon("chevron-down")}
        </div>
      </div>`
    ).join("");

    this._cfg.innerHTML = `
      <div class="roles-field">
        <label for="rl-name">Role name</label>
        <input class="input" id="rl-name" data-f="name" value="${esc(r.name)}" />
      </div>
      <div class="roles-field">
        <label for="rl-desc">Description</label>
        <input class="input" id="rl-desc" data-f="desc" value="${esc(r.desc)}" />
      </div>

      <section class="roles-sec">
        <div class="roles-sec-head">
          <h3>System prompt</h3>
          <p class="roles-sec-desc t-meta">Instructions that shape how this role's Marzy behaves.</p>
        </div>
        <textarea class="input roles-prompt" data-f="prompt" rows="5">${esc(r.prompt)}</textarea>
      </section>

      <section class="roles-sec">
        <div class="roles-sec-head">
          <h3>Tools</h3>
          <p class="roles-sec-desc t-meta">What this role's Marzy is allowed to do.</p>
        </div>
        <div class="roles-rows">${tools}</div>
      </section>

      <section class="roles-sec">
        <div class="roles-sec-head">
          <h3>Object access</h3>
          <p class="roles-sec-desc t-meta">Which records it can see and change.</p>
        </div>
        <div class="roles-rows">${objects}</div>
      </section>

      <div class="roles-actions">
        <button type="button" class="btn btn-primary btn-sm">Save changes</button>
      </div>`;
  }

  addRole() {
    this._roles.push({
      name: "New role",
      desc: "",
      prompt: "You are Marzy. Describe how this role should behave…",
      tools: new Set(),
      objects: Object.fromEntries(OBJECTS.map((o) => [o, "None"])),
    });
    this._i = this._roles.length - 1;
    this.renderRail();
    this.renderConfig();
    this._cfg.querySelector("#rl-name")?.focus();
  }
}
customElements.define("mz-roles", MzRoles);

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
// on-brand role dots (ink + Volt shades only)
const DOT = ["var(--color-volt)", "var(--color-ink-2)", "var(--color-volt-300)", "var(--color-muted)", "var(--color-volt-700)"];

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
        <div class="roles-rail-top">
          <span class="roles-rail-title t-caption">Roles</span>
          <button type="button" class="btn-icon roles-new" title="New role" aria-label="New role">${icon("plus")}</button>
        </div>
        <div class="roles-list-nav" role="tablist"></div>
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
      if (e.target.closest(".roles-delete")) {
        this.deleteRole();
        return;
      }
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
      // keep the active rail label in sync with the name (without re-rendering)
      if (f.dataset.f === "name") {
        const t = this._nav.querySelector(".roles-item.is-active .roles-item-name");
        if (t) t.textContent = e.target.value || "Untitled role";
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
      .map(
        (r, i) =>
          `<button type="button" class="roles-item${i === this._i ? " is-active" : ""}" data-i="${i}">
            <span class="roles-dot" style="background:${DOT[i % DOT.length]}"></span>
            <span class="roles-item-name">${esc(r.name) || "Untitled role"}</span>
          </button>`
      )
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
        <button type="button" class="btn btn-ghost btn-sm roles-delete">${icon("trash-2")}<span>Delete role</span></button>
        <button type="button" class="btn btn-primary btn-sm">Save changes</button>
      </div>`;
  }

  deleteRole() {
    this._roles.splice(this._i, 1);
    if (!this._roles.length) {
      this._i = 0;
      this.renderRail();
      this._cfg.innerHTML = `<mz-empty heading="No roles">Create a role to configure its Marzy.</mz-empty>`;
      return;
    }
    this._i = Math.min(this._i, this._roles.length - 1);
    this.renderRail();
    this.renderConfig();
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

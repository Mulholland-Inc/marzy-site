// <mz-app></mz-app>, a full-screen dashboard application: a left sidebar, a
// scrollable main area, and a full-height detail pane on the right that appears
// only when an object is open. On mobile the sidebar becomes a hamburger drawer
// and the pane becomes an overlay. Object pages render an <mz-collection>; the
// app owns the pane and fills it from collections' mz-select / mz-new events.
import { STATUSES, RECORDS, PRIO, TAGS, prioHTML, whoHTML, initials } from "./data.js";
import { SPARK } from "./spark.js";
import { icon } from "./icons.js";
import { animate, stagger, SPRING_SOFT, EASE_OUT, EASE_IN, reduce } from "./motion.js";

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const ICON = {
  chats: icon("message-square"),
  activity: icon("activity"),
  tasks: icon("square-kanban"),
  projects: icon("layout-grid"),
  calendar: icon("calendar"),
  connectors: icon("plug"),
  users: icon("users"),
  roles: icon("shield"),
  settings: icon("settings"),
};
const BURGER = icon("menu");
const PENCIL = icon("pencil");
const COPY = icon("copy");
const TRASH = icon("trash-2");

const people = [...new Set(RECORDS.map((r) => r.assignee))];

// Editable detail-pane fields. `opts` returns the choices for a select; `text`
// fields render a plain input. valueHTML/valueText render the read-only view and
// the plain-text used in the diff.
const FIELD_DEFS = [
  { key: "status", label: "Status", opts: () => STATUSES },
  { key: "priority", label: "Priority", opts: () => ["high", "medium", "low"], optLabel: (o) => PRIO[o] },
  { key: "assignee", label: "Assignee", opts: () => people },
  { key: "tag", label: "Team", opts: () => TAGS },
  { key: "due", label: "Due", date: true },
];
const valueHTML = (key, v) =>
  key === "status" ? `<span class="badge badge-neutral">${esc(v)}</span>`
  : key === "priority" ? prioHTML(v)
  : key === "assignee" ? whoHTML(v)
  : esc(String(v));
const valueText = (key, v) => (key === "priority" ? PRIO[v] : String(v));

// Due is stored as a short display string ("Jun 28"); the date <input> needs ISO.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dueToISO = (due) => {
  const m = String(due).match(/([A-Za-z]{3})\s+(\d{1,2})/);
  if (!m) return "";
  const mi = MONTHS.indexOf(m[1]);
  return mi < 0 ? "" : `2026-${String(mi + 1).padStart(2, "0")}-${String(Number(m[2])).padStart(2, "0")}`;
};
const isoToDue = (iso) => {
  const m = String(iso).match(/^\d{4}-(\d{2})-(\d{2})$/);
  return m ? `${MONTHS[Number(m[1]) - 1]} ${Number(m[2])}` : String(iso);
};

// Compact custom controls — searchable dropdown / calendar (read via `.value`).
const editControl = (f, v) => {
  if (f.date) return `<mz-datepicker class="ios-edit" size="sm" data-field="${f.key}" value="${dueToISO(v)}"></mz-datepicker>`;
  return `<mz-select class="ios-edit" size="sm" data-field="${f.key}" value="${esc(String(v))}">${f
    .opts()
    .map((o) => `<option value="${esc(o)}">${esc(f.optLabel ? f.optLabel(o) : o)}</option>`)
    .join("")}</mz-select>`;
};

const VIEWS = [
  { id: "chats", label: "Chat", render: () => `<mz-chats></mz-chats>` },
  { id: "activity", label: "Activity", render: () => `<mz-activity></mz-activity>` },
  { id: "tasks", label: "Tasks", dot: true, collection: { singular: "task", view: "board", views: "board,table,grid,gallery,todo,calendar" } },
  { id: "projects", label: "Projects", collection: { singular: "project", view: "grid", views: "grid,gallery,table,board" } },
  { id: "calendar", label: "Calendar", render: () => `<mz-calendar></mz-calendar>` },
  { id: "users", label: "Users", render: () => `<mz-users></mz-users>` },
  { id: "roles", label: "Access", render: () => `<mz-roles></mz-roles>` },
  {
    id: "settings",
    label: "Settings",
    render: () => `
      <mz-tabs>
        <mz-tab-panel label="Workspace">
          <mz-grid cols="2" align="start">
            <mz-field label="Workspace name" placeholder="Lazarco Inc." for="s-name"></mz-field>
            <mz-field label="Billing email" type="email" placeholder="ops@lazarco.com" for="s-email"></mz-field>
            <mz-select label="Timezone">
              <option>Pacific (PT)</option><option>Mountain (MT)</option>
              <option>Central (CT)</option><option>Eastern (ET)</option>
            </mz-select>
            <mz-select label="Default view">
              <option>Board</option><option>Table</option><option>Grid</option>
            </mz-select>
          </mz-grid>
        </mz-tab-panel>
        <mz-tab-panel label="Connections">
          <mz-connectors></mz-connectors>
        </mz-tab-panel>
        <mz-tab-panel label="Automation">
          <mz-stack gap="3">
            <mz-switch label="Auto-run trusted workflows" checked></mz-switch>
            <mz-switch label="Require approval over the limit" checked></mz-switch>
            <mz-switch label="Email me when review is needed"></mz-switch>
          </mz-stack>
        </mz-tab-panel>
        <mz-tab-panel label="Members">
          <mz-stack gap="3">
            <mz-switch label="Allow members to invite others"></mz-switch>
            <mz-switch label="Require 2-factor authentication" checked></mz-switch>
            <mz-actions><mz-btn variant="outline" size="sm">Manage members</mz-btn></mz-actions>
          </mz-stack>
        </mz-tab-panel>
        <mz-tab-panel label="Plan &amp; billing">
          <mz-stack gap="3">
            <p>You're on the <b>Team</b> plan, billed monthly.</p>
            <mz-actions><mz-btn variant="outline" size="sm">Change plan</mz-btn></mz-actions>
          </mz-stack>
        </mz-tab-panel>
      </mz-tabs>`,
  },
];

class MzApp extends HTMLElement {
  connectedCallback() {
    this.classList.add("app");
    this._singular = "item";
    const nav = VIEWS.map(
      (v, i) =>
        `<button class="sidebar-item${i === 0 ? " is-active" : ""}" type="button" data-view="${v.id}">${ICON[v.id]}<span>${v.label}</span>${v.dot ? `<span class="sidebar-dot"></span>` : ""}</button>`
    ).join("");
    this.innerHTML = `
      <aside class="sidebar">
        <mz-workspace></mz-workspace>
        <nav class="sidebar-nav" aria-label="Sidebar">${nav}</nav>
      </aside>
      <div class="app-main">
        <header class="app-bar">
          <button type="button" class="app-burger" aria-label="Menu">${BURGER}</button>
          <span class="app-bar-title"></span>
        </header>
        <div class="app-body" tabindex="-1"></div>
      </div>
      <aside class="app-pane" aria-label="Details"></aside>
      <div class="app-scrim" hidden></div>`;

    this._body = this.querySelector(".app-body");
    this._nav = this.querySelector(".sidebar-nav");
    this._pane = this.querySelector(".app-pane");
    this._scrim = this.querySelector(".app-scrim");
    this._barTitle = this.querySelector(".app-bar-title");

    this._nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".sidebar-item");
      if (!btn) return;
      this._nav.querySelectorAll(".sidebar-item").forEach((b) => b.classList.toggle("is-active", b === btn));
      this.closeNav();
      this.show(btn.dataset.view);
    });
    this.querySelector(".app-burger").addEventListener("click", () => this.toggleNav());
    this._scrim.addEventListener("click", () => {
      this.closeNav();
      this.hidePane();
    });
    // collections + views bubble these up to the app, which owns the pane
    this.addEventListener("mz-select", (e) => this.openDetail(e.detail));
    this.addEventListener("mz-new", () => this.openCreate());
    this._pane.addEventListener("click", (e) => {
      if (e.target.closest(".pane-cancel")) {
        this.hidePane();
        return;
      }
      const act = e.target.closest("[data-pane-act]");
      if (!act) return;
      const a = act.dataset.paneAct;
      if (a === "edit") this.enterEdit();
      else if (a === "save") this.saveEdit();
      else if (a === "cancel") this.cancelEdit();
      else if (a === "delete") this.hidePane();
    });

    this.show(VIEWS[0].id);
    requestAnimationFrame(() => this.buildIn());
  }

  // On first load, the workspace "builds": the sidebar (workspace switcher + nav
  // items) staggers in, then the main content settles up.
  buildIn() {
    if (reduce) return;
    const nodes = [this.querySelector("mz-workspace"), ...this.querySelectorAll(".sidebar-item")].filter(Boolean);
    nodes.forEach((el) => (el.style.opacity = "0"));
    animate(nodes, { opacity: [0, 1], x: [-10, 0] }, { delay: stagger(0.05), duration: 0.34, ease: EASE_OUT }).finished.then(
      () => nodes.forEach((el) => (el.style.opacity = ""))
    );
    if (this._body) {
      this._body.style.opacity = "0";
      animate(this._body, { opacity: [0, 1], y: [10, 0] }, { duration: 0.4, delay: 0.22, ease: EASE_OUT }).finished.then(
        () => (this._body.style.opacity = "")
      );
    }
  }

  toggleNav() {
    this.classList.toggle("nav-open");
    this.syncScrim();
  }
  closeNav() {
    this.classList.remove("nav-open");
    this.syncScrim();
  }
  hidePane() {
    // keep the element rendered (transform handles hide) so it can slide out
    const wasOpen = this.classList.contains("pane-open");
    this.classList.remove("pane-open");
    this.setCrumb(null);
    this.syncScrim();
    if (reduce || !wasOpen) {
      this._pane.style.transform = "";
      return;
    }
    animate(this._pane, { x: ["0%", "100%"] }, { duration: 0.26, ease: EASE_IN });
  }
  showPane() {
    this.classList.add("pane-open");
    this.syncScrim();
    if (reduce) {
      this._pane.style.transform = "none";
      return;
    }
    animate(this._pane, { x: ["100%", "0%"] }, SPRING_SOFT);
  }
  syncScrim() {
    this._scrim.hidden = !(this.classList.contains("nav-open") || this.classList.contains("pane-open"));
  }

  // Breadcrumb: Mulholland › View, plus an optional trailing segment (e.g. the
  // open object's title) — when present, the View crumb steps back to muted.
  crumbsHTML(view, extra) {
    const sep = `<span class="crumb-sep" aria-hidden="true">${icon("chevron-right")}</span>`;
    let html = `<span class="crumb crumb-muted">Mulholland</span>${sep}`;
    html += `<span class="crumb ${extra ? "crumb-muted" : "crumb-current"}"><span class="crumb-ico" aria-hidden="true">${ICON[view.id]}</span>${view.label}</span>`;
    if (extra) html += `${sep}<span class="crumb crumb-current">${extra}</span>`;
    return html;
  }

  // Update the trailing breadcrumb segment (the open object's title).
  setCrumb(extra) {
    const c = this._body.querySelector(".crumbs");
    if (c && this._view) c.innerHTML = this.crumbsHTML(this._view, extra || null);
  }

  show(id) {
    const view = VIEWS.find((v) => v.id === id) || VIEWS[0];
    this._view = view;
    this._barTitle.textContent = view.label;
    const head = `<header class="app-head">
        <nav class="crumbs" aria-label="Breadcrumb">${this.crumbsHTML(view, null)}</nav>
      </header>`;
    this._singular = view.collection ? view.collection.singular : "item";
    this._body.innerHTML = view.collection
      ? head + `<mz-collection singular="${view.collection.singular}" view="${view.collection.view}" views="${view.collection.views}"></mz-collection>`
      : head + view.render();
    this._body.scrollTop = 0;
    this.hidePane(); // nothing open yet
  }

  openDetail(r) {
    this._record = r; // the live record (mutated on save)
    this._detail = { ...r }; // working copy while editing
    this._editing = false;
    this._cid = 0;
    this._chain = this.seedChain(r);
    this.renderDetail();
    this.setCrumb(r.title);
    this.showPane();
  }

  // The starting commit history for a record.
  seedChain(r) {
    const cid = () => `c${++this._cid}`;
    return [
      { id: cid(), diffs: [{ label: "Status", from: "In progress", to: r.status }], who: "Marzy", time: "2h ago" },
      { id: cid(), diffs: [{ label: "Assignee", from: "Unassigned", to: r.assignee }], who: "Marzy", time: "1d ago" },
      { id: cid(), diffs: [{ label: "Priority", from: "Low", to: PRIO[r.priority] }], who: r.assignee, time: "3d ago" },
      { id: cid(), label: "Created", text: r.title, who: r.assignee, time: r.due },
    ];
  }

  chainItem(c) {
    const diff = (from, to) =>
      `<span class="chain-diff"><span class="chain-from">${esc(String(from))}</span>→<span class="chain-to">${esc(String(to))}</span></span>`;
    const rows = c.diffs
      ? c.diffs.map((d) => `<div class="chain-change"><span class="chain-field">${esc(d.label)}</span>${diff(d.from, d.to)}</div>`).join("")
      : `<div class="chain-change">${c.label ? `<span class="chain-field">${esc(c.label)}</span>` : ""}<span class="chain-diff">${esc(c.text)}</span></div>`;
    // the timeline node IS the person's avatar (Marzy gets the spark)
    const avatar =
      c.who === "Marzy"
        ? `<span class="chain-av chain-av-marzy" aria-hidden="true">${SPARK}</span>`
        : `<span class="chain-av" aria-hidden="true">${initials(c.who)}</span>`;
    return `<li class="chain-item${c.fresh ? " is-fresh" : ""}" data-cid="${c.id}">
        ${avatar}
        <div class="chain-content">
          <div class="chain-head"><span class="chain-name">${esc(c.who)}</span><time>${esc(c.time)}</time></div>
          <div class="chain-card"><div class="chain-changes">${rows}</div></div>
        </div>
      </li>`;
  }

  renderDetail() {
    const d = this._detail;
    const editing = this._editing;
    const tools = editing
      ? `<div class="pane-edit-bar">
          <button type="button" class="btn btn-ghost btn-sm" data-pane-act="cancel">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" data-pane-act="save">Save changes</button>
        </div>`
      : `<div class="pane-tools">
          <button type="button" class="btn-icon" data-pane-act="edit" title="Edit ${this._singular}" aria-label="Edit">${PENCIL}</button>
          <button type="button" class="btn-icon" data-pane-act="duplicate" title="Duplicate" aria-label="Duplicate">${COPY}</button>
          <button type="button" class="btn-icon" data-pane-act="delete" title="Delete" aria-label="Delete">${TRASH}</button>
        </div>`;
    const rows = FIELD_DEFS.map(
      (f) => `
        <div class="ios-row">
          <span class="ios-row-label">${f.label}</span>
          <span class="ios-row-value">${editing ? editControl(f, d[f.key]) : valueHTML(f.key, d[f.key])}</span>
        </div>`
    ).join("");
    this._pane.innerHTML = `
      <div class="pane-head">
        <span class="pane-eyebrow t-caption">${esc(d.tag)}</span>
        ${tools}
      </div>
      <h3 class="pane-title">${esc(d.title)}</h3>
      <div class="ios-section"><div class="ios-group">${rows}</div></div>
      <div class="ios-section"><ol class="chain">${this._chain.map((c) => this.chainItem(c)).join("")}</ol></div>`;
  }

  enterEdit() {
    this._editing = true;
    this.renderDetail();
    const first = this._pane.querySelector(".ios-edit");
    if (first) first.focus();
  }

  cancelEdit() {
    this._editing = false;
    this._detail = { ...this._record };
    this.renderDetail();
  }

  saveEdit() {
    // diff every field; all the changes from this save become ONE commit
    const diffs = [];
    FIELD_DEFS.forEach((f) => {
      const el = this._pane.querySelector(`[data-field="${f.key}"]`);
      if (!el) return;
      const nv = f.date ? isoToDue(el.value) : el.value;
      const ov = this._detail[f.key];
      if (String(nv) !== String(ov)) {
        diffs.push({ label: f.label, from: valueText(f.key, ov), to: valueText(f.key, nv) });
        this._detail[f.key] = nv;
      }
    });

    // nothing changed → just leave edit mode
    if (!diffs.length) {
      this._editing = false;
      this.renderDetail();
      return;
    }

    Object.assign(this._record, this._detail); // persist to the live record
    const commit = { id: `c${++this._cid}`, diffs, who: "You", time: "just now", fresh: true };

    // capture chain positions before the re-render so survivors can slide down (FLIP)
    const oldRects = new Map();
    this._pane.querySelectorAll(".chain-item").forEach((li) => oldRects.set(li.dataset.cid, li.getBoundingClientRect()));

    this._chain = [commit, ...this._chain];
    this._editing = false;
    this.renderDetail();
    this.animateChainAppend(oldRects);
  }

  // New commits drop in at the top while the existing ones slide down to make room.
  animateChainAppend(oldRects) {
    if (reduce) return;
    let i = 0;
    this._pane.querySelectorAll(".chain-item").forEach((li) => {
      if (li.classList.contains("is-fresh")) {
        li.style.opacity = "0";
        animate(li, { opacity: [0, 1], y: [-14, 0], scale: [0.97, 1] }, { ...SPRING_SOFT, delay: i * 0.06 }).finished.then(
          () => (li.style.opacity = "")
        );
        i++;
      } else {
        const prev = oldRects.get(li.dataset.cid);
        if (!prev) return;
        const now = li.getBoundingClientRect();
        const dy = prev.top - now.top;
        if (!dy) return;
        li.style.transform = `translateY(${dy}px)`;
        animate(li, { y: [dy, 0] }, SPRING_SOFT).finished.then(() => (li.style.transform = ""));
      }
    });
  }

  openCreate() {
    this._pane.innerHTML = `
      <div class="pane-head"><span class="pane-eyebrow t-caption">New ${this._singular}</span></div>
      <form class="pane-form" onsubmit="return false">
        <mz-field label="Title" placeholder="Untitled ${this._singular}" for="nc-title"></mz-field>
        <mz-select label="Status">${STATUSES.map((s) => `<option>${s}</option>`).join("")}</mz-select>
        <mz-select label="Assignee">${people.map((p) => `<option>${p}</option>`).join("")}</mz-select>
        <mz-select label="Priority">${Object.values(PRIO).map((p) => `<option>${p}</option>`).join("")}</mz-select>
        <mz-field label="Due date" type="date" for="nc-due"></mz-field>
        <mz-field label="Notes" type="textarea" placeholder="Anything worth noting…" for="nc-notes"></mz-field>
        <mz-actions align="end">
          <mz-btn variant="ghost" class="pane-cancel">Cancel</mz-btn>
          <mz-btn variant="primary">Create ${this._singular}</mz-btn>
        </mz-actions>
      </form>`;
    this.setCrumb("New " + this._singular);
    this.showPane();
  }
}
customElements.define("mz-app", MzApp);

// <mz-app></mz-app>, a full-screen dashboard application: a left sidebar, a
// scrollable main area, and a full-height detail pane on the right that appears
// only when an object is open. On mobile the sidebar becomes a hamburger drawer
// and the pane becomes an overlay.
//
// It is catalog-driven: the sidebar's object sections come from GET /ontology,
// each rendering an <mz-collection> over a real object type; the detail pane
// shows a real record's properties (FKs resolved via _links) and its version
// history (GET /objects/{type}/{id}/history). The app owns the pane and fills it
// from collections' mz-select / mz-new events.
import { SPARK } from "./spark.js";
import { icon } from "./icons.js";
import { animate, stagger, SPRING_SOFT, EASE_OUT, EASE_IN, reduce } from "./motion.js";
import { requireAuth, api } from "../auth.js";
import * as catalog from "../catalog.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const BURGER = icon("menu");
const COLLAPSE = icon("panel-left");
const TRASH = icon("trash-2");
const PENCIL = icon("pencil");

const initials = (name) =>
  String(name || "")
    .split(/[\s@.]+/)
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

// A coarse relative time for the version history (the commit's created_at).
const relTime = (iso) => {
  const t = Date.parse(iso);
  if (!t) return "";
  const s = Math.max(1, (Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// The fixed (non–object-type) sections. Object-type sections are spliced in
// between Activity and Calendar once the catalog loads.
const FIXED = [
  { id: "chats", label: "Chat", ic: "message-square", render: () => `<mz-chats></mz-chats>` },
  { id: "activity", label: "Activity", ic: "activity", render: () => `<mz-activity></mz-activity>` },
  { id: "calendar", label: "Calendar", ic: "calendar", render: () => `<mz-calendar></mz-calendar>` },
  { id: "users", label: "Users", ic: "users", render: () => `<mz-users></mz-users>` },
  { id: "roles", label: "Access", ic: "shield", render: () => `<mz-roles></mz-roles>` },
  { id: "settings", label: "Settings", ic: "settings", render: settingsHTML },
];

class MzApp extends HTMLElement {
  connectedCallback() {
    requireAuth();
    this.classList.add("app");
    this.innerHTML = `
      <aside class="sidebar">
        <mz-workspace></mz-workspace>
        <nav class="sidebar-nav" aria-label="Sidebar"></nav>
        <button class="sidebar-item sidebar-collapse" type="button" aria-label="Collapse sidebar" title="Collapse sidebar">${COLLAPSE}<span>Collapse</span></button>
      </aside>
      <div class="app-main">
        <header class="app-bar">
          <button type="button" class="app-burger" aria-label="Menu">${BURGER}</button>
          <span class="app-bar-title"></span>
          <mz-notifications></mz-notifications>
        </header>
        <div class="app-body" tabindex="-1"></div>
      </div>
      <aside class="app-pane" aria-label="Details"></aside>
      <div class="app-scrim" hidden></div>`;

    this._body = this.querySelector(".app-body");
    this._sidebar = this.querySelector(".sidebar");
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
    this.querySelector(".sidebar-collapse").addEventListener("click", () => this.toggleRail());
    this._scrim.addEventListener("click", () => {
      this.closeNav();
      if (this.classList.contains("pane-open")) this.closeDetail();
    });
    this.addEventListener("mz-select", (e) => this.openDetail(e.detail));
    this.addEventListener("mz-new", () => this.openCreate());
    this._pane.addEventListener("click", (e) => {
      if (e.target.closest(".pane-cancel")) return this.closeDetail();
      const a = e.target.closest("[data-pane-act]")?.dataset.paneAct;
      if (a === "edit") this.enterEdit();
      else if (a === "save") this.saveEdit();
      else if (a === "cancel") this.cancelEdit();
      else if (a === "delete") this.deleteRecord();
      else if (a === "create") this.submitCreate();
    });

    this._collapsed = false;
    let railPref = null;
    try {
      railPref = localStorage.getItem("mz-rail");
    } catch {}
    if (railPref === "1" && matchMedia("(min-width: 901px)").matches) this.setRail(true, false);

    this.init();
  }

  async init() {
    try {
      await catalog.load();
    } catch {
      this._body.innerHTML = `<mz-empty heading="Couldn’t load the workspace">The catalog failed to load. Try refreshing.</mz-empty>`;
      return;
    }
    // sections: Chat, Activity, <one per browsable type>, Calendar, Users, Access,
    // Settings. browsable() already hides interface implementers (you reach them
    // through the interface); we additionally drop infra types: users is the
    // identity projection and commit is the version-history log.
    const HIDDEN = new Set(["users", "commit"]);
    const typeSecs = catalog
      .browsable()
      .filter((t) => !HIDDEN.has(t.name))
      .map((t) => ({ id: "type:" + t.name, label: catalog.label(t.name), ic: t.icon, type: t.name }));
    this._sections = [...FIXED.slice(0, 2), ...typeSecs, ...FIXED.slice(2)];

    this._nav.innerHTML = this._sections
      .map(
        (s, i) =>
          `<button class="sidebar-item${i === 0 ? " is-active" : ""}" type="button" data-view="${s.id}" title="${esc(s.label)}">${icon(s.ic)}<span>${esc(s.label)}</span></button>`
      )
      .join("");

    addEventListener("popstate", () => this.route());
    this.route();
    this.buildIn();
  }

  // ── routing: URL ⟷ view (so pages are linkable + refresh-safe) ────────────────

  // The URL segment for a section: object types use their name (/deal), fixed
  // sections a stable slug (/chat, /access, …).
  sectionPath(sec) {
    if (sec.type) return "/" + sec.type;
    return { chats: "/chat", activity: "/activity", calendar: "/calendar", users: "/users", roles: "/access", settings: "/settings" }[sec.id] || "/" + sec.id;
  }

  sectionForSeg(seg) {
    return (this._sections || []).find((s) => this.sectionPath(s) === "/" + seg);
  }

  navigate(path) {
    if (location.pathname !== path) history.pushState({}, "", path);
  }

  // route renders the view named by the current URL (on load + back/forward),
  // without pushing a new history entry.
  route() {
    const parts = location.pathname.replace(/^\/+|\/+$/g, "").split("/");
    const sec = (parts[0] && this.sectionForSeg(parts[0])) || this._sections[0];
    this._nav.querySelectorAll(".sidebar-item").forEach((b) => b.classList.toggle("is-active", b.dataset.view === sec.id));
    this.show(sec.id, false);
    if (sec.type && parts[1]) this.openDetailById(sec.type, parts[1]);
  }

  async openDetailById(type, id) {
    try {
      const row = await api(`/objects/${type}/${id}`);
      if (row) this.openDetail(row, false);
    } catch {}
  }

  closeDetail() {
    this.hidePane();
    if (this._view) this.navigate(this.sectionPath(this._view));
  }

  section(id) {
    return (this._sections || []).find((s) => s.id === id) || this._sections?.[0];
  }

  // ── view rendering ────────────────────────────────────────────────────────────

  show(id, push = true) {
    const sec = this.section(id);
    if (!sec) return;
    this._view = sec;
    this._barTitle.textContent = sec.label;
    const head = `<header class="app-head">
        <nav class="crumbs" aria-label="Breadcrumb">${this.crumbsHTML(sec, null)}</nav>
        <mz-notifications></mz-notifications>
      </header>`;
    this._body.innerHTML = sec.type
      ? head + `<mz-collection type="${sec.type}" view="table" views="table"></mz-collection>`
      : head + sec.render();
    this._body.scrollTop = 0;
    this.hidePane();
    if (push) this.navigate(this.sectionPath(sec));
  }

  crumbsHTML(sec, extra) {
    const sep = `<span class="crumb-sep" aria-hidden="true">${icon("chevron-right")}</span>`;
    let html = `<span class="crumb crumb-muted">Mulholland</span>${sep}`;
    html += `<span class="crumb ${extra ? "crumb-muted" : "crumb-current"}"><span class="crumb-ico" aria-hidden="true">${icon(sec.ic)}</span>${esc(sec.label)}</span>`;
    if (extra) html += `${sep}<span class="crumb crumb-current">${esc(extra)}</span>`;
    return html;
  }

  setCrumb(extra) {
    const c = this._body.querySelector(".crumbs");
    if (c && this._view) c.innerHTML = this.crumbsHTML(this._view, extra || null);
  }

  collection() {
    return this._body.querySelector("mz-collection");
  }

  // ── detail pane (read-only; edit/create land in the write-path task) ───────────

  async openDetail(row, push = true) {
    if (!row) return;
    this._record = row;
    this._type = row._type;
    this.renderDetail(row);
    this.setCrumb(row[catalog.titleField(row._type)]);
    this.showPane();
    if (push && this._view) this.navigate(this.sectionPath(this._view) + "/" + row.id);
    // Re-fetch the full record by its concrete type — an interface listing only
    // carries the interface's columns, so a client browsed under "Organization"
    // would otherwise miss its own fields.
    const full = await api(`/objects/${row._type}/${row.id}`).catch(() => null);
    if (full && this._record === row) {
      this._record = full;
      this.renderDetail(full);
    }
    const cur = this._record;
    const hist = await api(`/objects/${cur._type}/${cur.id}/history`).catch(() => []);
    if (this._record === cur) this.renderChain(hist || []);
  }

  renderDetail(row, editing = false) {
    const type = row._type;
    const tf = catalog.titleField(type);
    const fields = catalog.props(type).filter((p) => !p.managed && p.name !== tf);
    const cell = (p) =>
      editing
        ? this.editControl(type, p, row[p.name])
        : (() => {
            const v = catalog.display(row, { name: p.name, kind: catalog.kind(type, p), link: !!catalog.linkOf(type, p.name) });
            return v ? esc(v) : "—";
          })();
    const tools = editing
      ? `<div class="pane-edit-bar"><button type="button" class="btn btn-ghost btn-sm" data-pane-act="cancel">Cancel</button><button type="button" class="btn btn-primary btn-sm" data-pane-act="save">Save</button></div>`
      : `<div class="pane-tools"><button type="button" class="btn-icon" data-pane-act="edit" title="Edit" aria-label="Edit">${PENCIL}</button><button type="button" class="btn-icon" data-pane-act="delete" title="Delete" aria-label="Delete">${TRASH}</button></div>`;
    const title = editing
      ? `<input class="pane-title pane-title-edit" data-field="${esc(tf)}" value="${esc(row[tf] ?? "")}" />`
      : `<h3 class="pane-title">${esc(row[tf])}</h3>`;
    this._pane.innerHTML = `
      <div class="pane-head"><span class="pane-eyebrow t-caption">${esc(catalog.label(type))}</span>${tools}</div>
      ${title}
      <div class="ios-section"><div class="ios-group">${fields
        .map((p) => `<div class="ios-row"><span class="ios-row-label">${esc(catalog.label(p.name))}</span><span class="ios-row-value">${cell(p)}</span></div>`)
        .join("")}</div></div>
      ${editing ? "" : `<div class="ios-section"><ol class="chain"></ol></div>`}`;
  }

  // editControl renders the right input for a property's kind. Links/enums are
  // selects; their options come from p.enum (catalog) and, for links, the target
  // type's rows fetched into _linkOpts on enterEdit/openCreate.
  editControl(type, p, value) {
    const f = esc(p.name);
    const k = catalog.kind(type, p);
    if (k === "enum")
      return `<mz-select class="ios-edit" size="sm" data-field="${f}" value="${esc(value ?? "")}"><option value=""></option>${(p.enum || [])
        .map((o) => `<option value="${esc(o)}">${esc(catalog.label(o))}</option>`)
        .join("")}</mz-select>`;
    if (k === "link") {
      const opts = this._linkOpts?.[p.name] || [];
      return `<mz-select class="ios-edit" size="sm" data-field="${f}" value="${esc(value ?? "")}"><option value=""></option>${opts
        .map((o) => `<option value="${esc(o.id)}">${esc(o.title)}</option>`)
        .join("")}</mz-select>`;
    }
    if (k === "date")
      return `<mz-datepicker class="ios-edit" size="sm" data-field="${f}" value="${esc(String(value ?? "").slice(0, 10))}"></mz-datepicker>`;
    if (k === "bool") return `<mz-switch class="ios-edit" data-field="${f}"${value ? " checked" : ""}></mz-switch>`;
    return `<input class="ios-edit ios-input" data-field="${f}" value="${esc(value ?? "")}" placeholder="—" />`;
  }

  // fetchLinkOpts loads the option rows ({id,title}) for a type's link fields.
  async fetchLinkOpts(type) {
    this._linkOpts = {};
    const links = catalog.props(type).filter((p) => catalog.linkOf(type, p.name));
    await Promise.all(
      links.map(async (p) => {
        const link = catalog.linkOf(type, p.name);
        try {
          const rows = await api(`/objects/${link.to}`);
          this._linkOpts[p.name] = rows.map((r) => ({ id: r.id, title: r[catalog.titleField(r._type)] || r.id }));
        } catch {
          this._linkOpts[p.name] = [];
        }
      })
    );
  }

  async enterEdit() {
    if (!this._record) return;
    await this.fetchLinkOpts(this._record._type);
    this.renderDetail(this._record, true);
    this._pane.querySelector(".ios-edit, .pane-title-edit")?.focus();
  }

  cancelEdit() {
    this.renderDetail(this._record, false);
    api(`/objects/${this._record._type}/${this._record.id}/history`)
      .then((h) => this.renderChain(h || []))
      .catch(() => this.renderChain([]));
  }

  fieldValue(p, type) {
    const el = this._pane.querySelector(`[data-field="${p.name}"]`);
    if (!el) return undefined;
    if (el.tagName === "MZ-SWITCH") return el.hasAttribute("checked") || !!el.checked;
    return el.value;
  }

  async saveEdit() {
    const type = this._record._type;
    const tf = catalog.titleField(type);
    const changed = {};
    [...catalog.props(type).filter((p) => !p.managed && p.name !== tf), { name: tf }].forEach((p) => {
      const nv = this.fieldValue(p, type);
      if (nv === undefined) return;
      const ov = this._record[p.name];
      if (String(nv ?? "") !== String(ov ?? "")) changed[p.name] = nv === "" ? null : nv;
    });
    if (Object.keys(changed).length) {
      try {
        await api(`/objects/${type}/${this._record.id}`, { method: "PATCH", body: changed });
      } catch {
        return;
      }
    }
    const full = await api(`/objects/${type}/${this._record.id}`).catch(() => this._record);
    this._record = full;
    this.renderDetail(full, false);
    const hist = await api(`/objects/${type}/${full.id}/history`).catch(() => []);
    this.renderChain(hist || []);
    this.collection()?.reload();
  }

  renderChain(commits) {
    const ol = this._pane.querySelector(".chain");
    if (!ol) return;
    ol.innerHTML = commits.length
      ? commits.map((c) => this.chainItem(c)).join("")
      : `<li class="chain-empty t-meta">No history yet.</li>`;
  }

  chainItem(c) {
    const who = c.author || "Marzy";
    const diff = (from, to) =>
      `<span class="chain-diff"><span class="chain-from">${esc(from)}</span>→<span class="chain-to">${esc(to)}</span></span>`;
    let body;
    if (c.op === "create") body = `<div class="chain-change"><span class="chain-field">Created</span></div>`;
    else if (c.op === "delete") body = `<div class="chain-change"><span class="chain-field">Deleted</span></div>`;
    else
      body = Object.entries(c.changes || {})
        .map(
          ([field, d]) =>
            `<div class="chain-change"><span class="chain-field">${esc(catalog.label(field))}</span>${diff(d?.from ?? "", d?.to ?? "")}</div>`
        )
        .join("");
    const avatar =
      who === "Marzy"
        ? `<span class="chain-av chain-av-marzy" aria-hidden="true">${SPARK}</span>`
        : `<span class="chain-av" aria-hidden="true">${initials(who)}</span>`;
    return `<li class="chain-item" data-cid="${esc(c.id)}">
        ${avatar}
        <div class="chain-content">
          <div class="chain-head"><span class="chain-name">${esc(who)}</span><time>${esc(relTime(c.created_at))}</time></div>
          <div class="chain-card"><div class="chain-changes">${body}</div></div>
        </div>
      </li>`;
  }

  async deleteRecord() {
    if (!this._record) return;
    try {
      await api(`/objects/${this._type}/${this._record.id}`, { method: "DELETE" });
    } catch {
      return;
    }
    this.closeDetail();
    this.collection()?.reload();
  }

  async openCreate() {
    const type = this._view?.type;
    if (!type) return;
    this._creating = type;
    await this.fetchLinkOpts(type);
    const fields = catalog.props(type).filter((p) => !p.managed);
    this._pane.innerHTML = `
      <div class="pane-head">
        <span class="pane-eyebrow t-caption">New ${esc(catalog.label(type))}</span>
        <div class="pane-edit-bar">
          <button type="button" class="btn btn-ghost btn-sm pane-cancel">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" data-pane-act="create">Create</button>
        </div>
      </div>
      <div class="ios-section"><div class="ios-group">${fields
        .map(
          (p) =>
            `<div class="ios-row"><span class="ios-row-label">${esc(catalog.label(p.name))}${p.required ? " *" : ""}</span><span class="ios-row-value">${this.editControl(type, p, "")}</span></div>`
        )
        .join("")}</div></div>`;
    this.setCrumb("New " + catalog.label(type));
    this.showPane();
  }

  async submitCreate() {
    const type = this._creating;
    if (!type) return;
    const body = {};
    catalog.props(type)
      .filter((p) => !p.managed)
      .forEach((p) => {
        const v = this.fieldValue(p, type);
        if (v !== undefined && v !== "") body[p.name] = v;
      });
    let created;
    try {
      created = await api(`/objects/${type}`, { method: "POST", body });
    } catch {
      return;
    }
    this.hidePane();
    this.collection()?.reload();
    if (created) this.openDetail(created);
  }

  // ── chrome (sidebar rail, nav drawer, pane slide) — unchanged behavior ──────────

  toggleRail() {
    this.setRail(!this._collapsed);
  }

  setRail(collapsed, animateIt = true) {
    if (this._collapsed === collapsed) return;
    this._collapsed = collapsed;
    try {
      localStorage.setItem("mz-rail", collapsed ? "1" : "0");
    } catch {}
    const sb = this._sidebar;
    const labels = sb.querySelectorAll(".sidebar-item > span:not(.sidebar-dot), .ws-meta, .ws-caret");
    if (reduce || !animateIt) {
      this.classList.toggle("nav-collapsed", collapsed);
      return;
    }
    const WIDTH_ANIM = { duration: 0.34, ease: EASE_OUT };
    if (collapsed) {
      animate(labels, { opacity: 0 }, { duration: 0.1, ease: EASE_IN });
      animate(sb, { width: ["208px", "64px"] }, WIDTH_ANIM).finished.then(() => {
        this.classList.add("nav-collapsed");
        sb.style.width = "";
        labels.forEach((l) => (l.style.opacity = ""));
      });
    } else {
      labels.forEach((l) => (l.style.opacity = "0"));
      this.classList.remove("nav-collapsed");
      sb.style.width = "64px";
      animate(sb, { width: ["64px", "208px"] }, WIDTH_ANIM).finished.then(() => (sb.style.width = ""));
      animate(labels, { opacity: [0, 1] }, { duration: 0.2, delay: 0.12, ease: EASE_OUT }).finished.then(() =>
        labels.forEach((l) => (l.style.opacity = ""))
      );
    }
  }

  buildIn() {
    if (reduce) return;
    const nodes = [this.querySelector("mz-workspace"), ...this.querySelectorAll(".sidebar-item")].filter(Boolean);
    nodes.forEach((el) => (el.style.opacity = "0"));
    if (this._body) this._body.style.opacity = "0";
    const play = () =>
      requestAnimationFrame(() => {
        animate(nodes, { opacity: [0, 1], x: [-12, 0] }, { delay: stagger(0.06), duration: 0.36, ease: EASE_OUT }).finished.then(() =>
          nodes.forEach((el) => (el.style.opacity = ""))
        );
        if (this._body) {
          animate(this._body, { opacity: [0, 1], y: [10, 0] }, { duration: 0.42, delay: 0.2, ease: EASE_OUT }).finished.then(
            () => (this._body.style.opacity = "")
          );
        }
      });
    if (document.body.classList.contains("mz-ready")) play();
    else {
      const mo = new MutationObserver(() => {
        if (document.body.classList.contains("mz-ready")) {
          mo.disconnect();
          play();
        }
      });
      mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
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
}
customElements.define("mz-app", MzApp);

function settingsHTML() {
  return `
    <mz-tabs>
      <mz-tab-panel label="Workspace">
        <mz-grid cols="2" align="start">
          <mz-field label="Workspace name" placeholder="Mulholland Inc." for="s-name"></mz-field>
          <mz-field label="Billing email" type="email" placeholder="ops@mulholland.inc" for="s-email"></mz-field>
        </mz-grid>
      </mz-tab-panel>
      <mz-tab-panel label="Connections">
        <mz-connectors></mz-connectors>
      </mz-tab-panel>
    </mz-tabs>`;
}

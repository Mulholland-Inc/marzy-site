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
import { requireAuth, api, whoami } from "../auth.js";
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
      const act = e.target.closest("[data-action]")?.dataset.action;
      if (act) this.runAction(act);
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
    // The workspace's display name (for the breadcrumb) — best-effort.
    try {
      const cfg = await api("/config");
      this._workspace = cfg?.name || "";
    } catch {}
    // A userId → name map so the version history shows people, not raw ids.
    this.loadMembers();
    // The viewer's roles gate which object actions show in the detail pane.
    whoami().then((me) => { this._viewerRoles = me.roles || []; });
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
    let html = `<span class="crumb crumb-muted">${esc(this._workspace || "Workspace")}</span>${sep}`;
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
      ${editing ? "" : this.actionsHTML(type)}
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

  async renderChain(commits) {
    const ol = this._pane.querySelector(".chain");
    if (!ol) return;
    await this.resolveLinks(commits);
    if (!this._pane.contains(ol)) return; // pane changed while resolving
    ol.innerHTML = commits.length
      ? commits.map((c) => this.chainItem(c)).join("")
      : `<li class="chain-empty t-meta">No history yet.</li>`;
  }

  // resolveLinks builds a uuid→name map for the FK fields that appear in the
  // history's diffs, so "client: <uuid> → <uuid>" reads as names. It fetches each
  // referenced target type's rows once (cached for the session).
  async resolveLinks(commits) {
    const type = this._record?._type;
    if (!type) return;
    this._uuidNames = this._uuidNames || {};
    this._fetchedTargets = this._fetchedTargets || new Set();
    const targets = new Set();
    commits.forEach((c) =>
      Object.keys(c.changes || {}).forEach((field) => {
        const link = catalog.linkOf(type, field);
        if (link && !this._fetchedTargets.has(link.to)) targets.add(link.to);
      })
    );
    await Promise.all(
      [...targets].map(async (tt) => {
        try {
          const rows = await api(`/objects/${tt}`);
          rows.forEach((r) => (this._uuidNames[r.id] = r[catalog.titleField(r._type)] || r.id));
        } catch {}
        this._fetchedTargets.add(tt);
      })
    );
  }

  async loadMembers() {
    try {
      const { members } = await api("/members");
      this._membersMap = {};
      // A commit's author is the viewer's Account: the WorkOS user id when the
      // access token carries no email, the email once the JWT template adds it.
      // Key the map by both so history resolves to a name across the transition.
      (members || []).forEach((mm) => {
        const name = mm.name || mm.email || mm.userId;
        if (mm.userId) this._membersMap[mm.userId] = name;
        if (mm.email) this._membersMap[mm.email.toLowerCase()] = name;
      });
    } catch {
      this._membersMap = {};
    }
  }

  chainItem(c) {
    const m = this._membersMap || {};
    const who = m[c.author] || (c.author ? (c.author.startsWith("user_") ? "Member" : c.author) : "Marzy");
    // FK values are raw uuids in the diff — resolve to the referenced object's
    // name (resolveLinks), falling back to a short form for unknowns.
    const names = this._uuidNames || {};
    const fmt = (v) => {
      const s = String(v ?? "");
      if (names[s]) return names[s];
      return /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s) ? s.slice(0, 8) + "…" : s || "—";
    };
    const diff = (from, to) =>
      `<span class="chain-diff"><span class="chain-from">${esc(fmt(from))}</span>→<span class="chain-to">${esc(fmt(to))}</span></span>`;
    const changeRows = Object.entries(c.changes || {})
      .map(
        ([field, d]) =>
          `<div class="chain-change"><span class="chain-field">${esc(catalog.label(field))}</span>${diff(d?.from ?? "", d?.to ?? "")}</div>`
      )
      .join("");
    let body;
    if (c.op === "create") body = `<div class="chain-change"><span class="chain-field">Created</span></div>`;
    else if (c.op === "delete") body = `<div class="chain-change"><span class="chain-field">Deleted</span></div>`;
    else if (c.op === "update") body = changeRows;
    // Any other op is an action invocation (op = the action name).
    else body = `<div class="chain-change"><span class="chain-field">Ran ${esc(catalog.label(c.op))}</span></div>${changeRows}`;
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

  // ── object-bound actions (catalog actions whose `on` is this type) ─────────────

  // actionsHTML renders a button per action bound to `type` that the viewer's
  // roles permit; the server re-checks on invoke.
  actionsHTML(type) {
    const acts = catalog
      .actionsOn(type)
      // Only actions that act ON this object (a uuid param the open record fills);
      // create-style actions (no target) belong to the agent / collection level.
      .filter((a) => (a.params || []).some((p) => p.type === "uuid"))
      .filter((a) => catalog.canRunAction(a, this._viewerRoles || []));
    if (!acts.length) return "";
    const btns = acts
      .map(
        (a) =>
          `<button type="button" class="btn btn-secondary btn-sm" data-action="${esc(a.name)}" title="${esc(a.desc || "")}">${esc(catalog.label(a.name))}</button>`
      )
      .join("");
    return `<div class="ios-section pane-actions"><div class="pane-actions-row">${btns}</div><span class="pane-actions-status t-meta" role="status"></span></div>`;
  }

  // actionBody fills the action's target (its uuid param) with the open record's
  // id, plus any collected extra params.
  actionBody(a, extra) {
    const body = { ...extra };
    const idParam = (a.params || []).find((p) => p.type === "uuid");
    if (idParam && this._record) body[idParam.name] = this._record.id;
    return body;
  }

  runAction(name) {
    const a = catalog.actionsOn(this._type).find((x) => x.name === name);
    if (!a || !this._record) return;
    const reqExtra = (a.params || []).filter((p) => p.type !== "uuid" && p.required);
    if (reqExtra.length) return this.openActionForm(a, reqExtra);
    this.invokeAction(a, this.actionBody(a, {}));
  }

  // For actions needing more than the target id, collect the required params with
  // a small inline form under the action buttons.
  openActionForm(a, reqExtra) {
    const host = this._pane.querySelector(".pane-actions");
    if (!host) return;
    host.querySelector(".pane-action-form")?.remove();
    const inputs = reqExtra
      .map(
        (p) =>
          `<label class="field"><span class="field-label">${esc(catalog.label(p.name))}</span><input class="input" data-pname="${esc(p.name)}" /></label>`
      )
      .join("");
    const form = document.createElement("div");
    form.className = "pane-action-form";
    form.innerHTML = `${inputs}<div class="pane-action-form-bar"><button type="button" class="btn btn-ghost btn-sm" data-aform="cancel">Cancel</button><button type="button" class="btn btn-primary btn-sm" data-aform="run">Run ${esc(catalog.label(a.name))}</button></div>`;
    host.appendChild(form);
    form.addEventListener("click", (e) => {
      const act = e.target.closest("[data-aform]")?.dataset.aform;
      if (act === "cancel") form.remove();
      else if (act === "run") {
        const extra = {};
        form.querySelectorAll("[data-pname]").forEach((i) => (extra[i.dataset.pname] = i.value));
        form.remove();
        this.invokeAction(a, this.actionBody(a, extra));
      }
    });
  }

  async invokeAction(a, body) {
    const status = this._pane.querySelector(".pane-actions-status");
    if (status) status.textContent = `Running ${catalog.label(a.name)}…`;
    try {
      const res = await api(`/actions/${encodeURIComponent(a.name)}`, { method: "POST", body });
      // If the action produced a file/link (e.g. an export), open it in a new
      // tab and leave a clickable fallback (popup blockers may swallow the open).
      const url = res && (res.file_url || res.url || res.link);
      if (status) {
        if (url) {
          status.innerHTML = `${esc(catalog.label(a.name))} done — <a href="${esc(url)}" target="_blank" rel="noopener">open</a>`;
          window.open(url, "_blank", "noopener");
        } else {
          status.textContent = `${catalog.label(a.name)} done.`;
        }
      }
      // The action recorded an audit commit (and may have changed the object);
      // refresh the history trail and the underlying collection.
      const cur = this._record;
      if (cur) {
        const hist = await api(`/objects/${cur._type}/${cur.id}/history`).catch(() => []);
        if (this._record === cur) this.renderChain(hist || []);
      }
      this.collection()?.reload();
    } catch (e) {
      if (status) status.textContent = e?.message || `${catalog.label(a.name)} failed.`;
    }
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
        <mz-settings></mz-settings>
      </mz-tab-panel>
      <mz-tab-panel label="Assistant">
        <mz-prompt-studio></mz-prompt-studio>
      </mz-tab-panel>
      <mz-tab-panel label="Connections">
        <mz-connectors></mz-connectors>
      </mz-tab-panel>
      <mz-tab-panel label="Identity">
        <mz-identity></mz-identity>
      </mz-tab-panel>
    </mz-tabs>`;
}

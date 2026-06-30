// core/catalog.js — the dashboard's data layer over the ontology backend.
//
// The backend is a per-tenant introspected catalog: GET /ontology describes the
// tenant's object types (fields, links, sets, roles), and /objects/{type} serves
// their rows. The dashboard is built FROM this — nav, columns, and detail fields
// all come from the catalog, so it works for any tenant with no per-client code.
import { api } from "./auth.js";

let _catalog = null;
let _pending = null;

// load fetches (and caches) the tenant catalog. Call refresh() to re-fetch.
export async function load() {
  if (_catalog) return _catalog;
  if (!_pending) _pending = api("/ontology").then((c) => (_catalog = c));
  return _pending;
}

export function refresh() {
  _catalog = null;
  _pending = null;
  return load();
}

// ── object types ──────────────────────────────────────────────────────────────

// types returns the concrete object types (not interfaces), in catalog order.
export function types() {
  return _catalog?.object_types ?? [];
}

// domainInterfaces are the abstract parent types (organization, product, …),
// excluding the universal `object` base. Reading one spans its implementers.
export function domainInterfaces() {
  return (_catalog?.interfaces ?? []).filter((i) => i.name !== "object");
}

// type resolves a name to its definition — an object type OR a domain interface
// (so props/columns/titleField work for both).
export function type(name) {
  return types().find((t) => t.name === name) || domainInterfaces().find((i) => i.name === name) || null;
}

// browsable are the nav-worthy types: standalone object types (those that don't
// implement a domain interface) plus the domain interfaces themselves. An
// interface's implementers are NOT listed individually — you browse them through
// the interface (e.g. all products under "Product", not one item per category).
export function browsable() {
  const ifaceNames = new Set(domainInterfaces().map((i) => i.name));
  const standalone = types().filter((t) => !(t.implements ?? []).some((n) => ifaceNames.has(n)));
  return [...standalone, ...domainInterfaces()];
}

// props returns a type's properties, excluding the base lifecycle columns the UI
// never edits (id/created_at/updated_at) — those are handled out of band.
const BASE = new Set(["id", "created_at", "updated_at"]);
export function props(name) {
  return (type(name)?.properties ?? []).filter((p) => !BASE.has(p.name));
}

// titleField is the property a row is named by (the `title:` comment, else name,
// else the first text property, else id).
export function titleField(name) {
  const t = type(name);
  if (t?.title) return t.title;
  const ps = props(name);
  return ps.find((p) => p.name === "name")?.name || ps.find((p) => p.type === "text")?.name || "id";
}

export function icon(name) {
  return type(name)?.icon || "box";
}

// ── links (foreign keys / declared relationships) ──────────────────────────────

// linkOf returns the link a property points along (so a FK value can be rendered
// as the target's display name from a row's _links, and edited with a picker of
// that target's rows).
export function linkOf(typeName, prop) {
  return (_catalog?.link_types ?? []).find((l) => l.from === typeName && l.property === prop) || null;
}

// ── sets (named, pre-filtered views) ───────────────────────────────────────────

export function setsOn(typeName) {
  return (_catalog?.object_sets ?? []).filter((s) => (s.on ?? []).includes(typeName));
}

// ── roles / access ─────────────────────────────────────────────────────────────

// can reports whether any of the viewer's roles grants a privilege on a type —
// the same ACL the server enforces, surfaced so the UI can hide what it can't do.
export function can(roles, typeName, priv) {
  const defs = _catalog?.roles ?? [];
  return (roles ?? []).some((r) => (defs.find((d) => d.name === r)?.grants?.[typeName] ?? []).includes(priv));
}

// ── calendar (date-bearing objects) ─────────────────────────────────────────────

// Infra projections that are object types but not real workspace records.
const NOT_EVENTS = new Set(["users", "commit"]);

// calendarProps returns a type's user-facing date/timestamp properties — the
// columns a row can be placed on a calendar by. Managed columns (created_at,
// updated_at) are excluded: they're audit metadata, not scheduled events.
export function calendarProps(typeName) {
  return props(typeName).filter((p) => !p.managed && kind(typeName, p) === "date");
}

// calendarTypes are the concrete object types carrying at least one date
// property, so the calendar knows which types to fetch and place.
export function calendarTypes() {
  return types().filter((t) => !NOT_EVENTS.has(t.name) && calendarProps(t.name).length);
}

// ── property kinds (how to render/edit a property) ─────────────────────────────

// kind maps a property to a UI control family. Enums (a fixed value set) come
// from the property's `enum` when the backend supplies one; links render as a
// reference to another type.
export function kind(typeName, p) {
  if (linkOf(typeName, p.name)) return "link";
  if (Array.isArray(p.enum) && p.enum.length) return "enum";
  switch (p.type) {
    case "date":
    case "timestamptz":
    case "timestamp":
      return "date";
    case "bool":
    case "boolean":
      return "bool";
    case "bigint":
    case "numeric":
    case "integer":
    case "money_usd":
      return "number";
    default:
      return "text";
  }
}

// ── data + presentation ─────────────────────────────────────────────────────────

// objects fetches a type's rows, applying the toolbar query: equality filters the
// backend ANDs server-side, plus a client-side free-text search across the row's
// values (the backend has no full-text search).
export async function objects(typeName, query = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query.filters || {})) if (v != null && v !== "") qs.set(k, v);
  let rows = await api(`/objects/${typeName}${qs.toString() ? "?" + qs : ""}`);
  const term = (query.search || "").trim().toLowerCase();
  if (term) {
    rows = rows.filter((r) =>
      Object.values(r).concat(Object.values(r._links || {})).join(" ").toLowerCase().includes(term)
    );
  }
  return rows;
}

export function label(s) {
  return String(s).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Long free-text columns clutter a table — keep them out of the column set (the
// detail pane still shows them). Heuristic by name since the catalog doesn't tag
// prose vs short values yet.
const PROSE = new Set([
  "notes", "body", "summary", "description", "desc", "scope", "success", "transcript",
  "metrics", "decision_criteria", "decision_process", "paper_process", "competition", "evidence", "solves",
]);

// viewModes infers the view modes a type supports from its catalog shape:
// table + grid always; board when there's an enum to group by (its order is the
// enum's values); calendar when there's a date field. Each mode carries the
// config the view component needs.
export function viewModes(typeName) {
  const t = type(typeName);
  const ps = props(typeName);
  const modes = [{ id: "table" }, { id: "grid" }];
  // Board columns: for an interface, group by the implementer subtype (the
  // "category" — e.g. lulu's product → lighting/seating); for a concrete type,
  // by its first enum (e.g. a deal's stage). calendar/gallery/files come later.
  const iface = domainInterfaces().some((i) => i.name === typeName);
  const enumField = ps.find((p) => !p.managed && !linkOf(typeName, p.name) && Array.isArray(p.enum) && p.enum.length);
  if (iface && (t?.implementers || []).length) {
    modes.push({ id: "board", groupBy: "_type", order: t.implementers, groupLabel: "Category" });
  } else if (enumField) {
    modes.push({ id: "board", groupBy: enumField.name, order: enumField.enum, groupLabel: label(enumField.name) });
  }
  return modes;
}

// columns picks a table's columns for a type: the title first, then up to six
// short scalar/link properties (managed + prose columns excluded).
export function columns(typeName) {
  const title = titleField(typeName);
  const cols = [];
  for (const p of props(typeName)) {
    if (p.managed || p.name === title || PROSE.has(p.name)) continue;
    cols.push({ name: p.name, label: label(p.name), kind: kind(typeName, p), link: !!linkOf(typeName, p.name) });
  }
  return { title: { name: title, label: label(title) }, cols: cols.slice(0, 6) };
}

// display renders a property's value for a row: links resolve to the target's
// name via _links; money is cents → $; dates are trimmed; everything else is raw.
export function display(row, col) {
  if (col.link) return row._links?.[col.name] ?? "";
  const v = row[col.name];
  if (v == null || v === "") return "";
  if (col.name.endsWith("_usd") || col.kind === "number" && /amount|value|usd|cents/.test(col.name))
    return "$" + (Number(v) / 100).toLocaleString();
  if (col.kind === "date") return String(v).slice(0, 10);
  return String(v);
}

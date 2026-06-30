// core/auth.js — authentication for the dashboard (WorkOS).
//
// The backend exposes a WorkOS auth service at api.marzy.com/auth/* with cookie
// sessions scoped to .marzy.com. The app lives on marzy.com, so every /auth/*
// call is cross-origin and must send credentials. Sessions can span several
// tenants; /auth/me returns the membership list and the active tenant. Data
// calls go to api.marzy.com/<activeTenant>/<path> with a Bearer access token
// fetched from /auth/token.

const C = (typeof window !== "undefined" && window.MZ_SITE) || {};
const isLocal = (h) => /(localhost|127\.0\.0\.1)/.test(h);

const ls = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lset = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch {} };

const apiHost = C.api || (isLocal(location.hostname) ? "http://localhost:8080" : "https://api.marzy.com");

// The active tenant — switcher selection (remembered) wins, then the site
// default, then whatever /auth/me reports (stored on first load).
const TKEY = "mz_tenant";
export const activeTenant = () => ls(TKEY) || C.tenant || "";
export const setActiveTenant = (t) => lset(TKEY, t);

// Per-tenant data base: api.marzy.com/<tenant>.
export const API_BASE = `${apiHost}/${activeTenant()}`;

const LOGIN = "/login";
const HOME = "/";
const HINT = "mz_auth_hint";

// Current user, broadcast to subscribers (the switcher) on every change.
let user = null;
const subs = new Set();
const report = (u) => { user = u; lset(HINT, u ? u.email || "1" : null); subs.forEach((f) => { try { f(u); } catch {} }); };
export const getUser = () => user;
export const onUser = (cb) => { subs.add(cb); if (user) cb(user); return () => subs.delete(cb); };
export const authHint = () => ls(HINT);

// GET /auth/me → { user, tenants, active } when signed in, else null. The result
// is cached (one fetch per page load, shared by every caller) and broadcast to
// subscribers.
let mePromise = null;
export function loadMe() {
  if (!mePromise) mePromise = fetchMe();
  return mePromise;
}
async function fetchMe() {
  try {
    const r = await fetch(`${apiHost}/auth/me`, { credentials: "include" });
    if (!r.ok) { report(null); return null; }
    const me = await r.json();
    const u = { ...(me.user || {}), tenants: me.tenants || [], active: me.active };
    if (me.active && !ls(TKEY)) setActiveTenant(me.active);
    report(u);
    return u;
  } catch {
    report(null);
    return null;
  }
}

// GET /auth/token → access_token (cached briefly in memory) or null.
let tokenCache = null;
let tokenAt = 0;
let tokenInFlight = null;
export async function getToken() {
  if (tokenCache && Date.now() - tokenAt < 30000) return tokenCache;
  // Dedupe concurrent refreshes. WorkOS rotates the refresh token on every
  // /auth/token call, so parallel callers (several components booting at once)
  // would race: the first rotates it and the rest 401 on the consumed token,
  // breaking the session. Share one in-flight request instead.
  if (tokenInFlight) return tokenInFlight;
  tokenInFlight = (async () => {
    try {
      const r = await fetch(`${apiHost}/auth/token`, { credentials: "include" });
      if (!r.ok) { tokenCache = null; return null; }
      const j = await r.json();
      tokenCache = j.access_token || null;
      tokenAt = Date.now();
      return tokenCache;
    } catch {
      tokenCache = null;
      return null;
    } finally {
      tokenInFlight = null;
    }
  })();
  return tokenInFlight;
}

// GET /whoami → the active tenant's viewer ({ account, roles }). Roles drive the
// UI's admin gating (e.g. who can administer members). Cached per page load.
let whoamiPromise = null;
export function whoami() {
  if (!whoamiPromise) whoamiPromise = api("/whoami").catch(() => ({ roles: [] }));
  return whoamiPromise;
}

export async function authHeaders() {
  const h = { "Content-Type": "application/json" };
  const t = await getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function api(path, { method = "GET", body } = {}) {
  const r = await fetch(API_BASE + path, {
    method,
    headers: await authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}`);
  return r.status === 204 ? undefined : r.json();
}

// The tenants the switcher offers — the caller's WorkOS memberships.
export async function loadTenants() {
  return (await loadMe())?.tenants || [];
}

// Boot auth: resolve the session, then report it. `onState(user|null)` fires
// once with the result; subscribers (via onUser) keep getting updates.
export async function initAuth(onState = () => {}) {
  const u = await loadMe();
  onState(u);
  return u;
}

// Dashboard guard: bounce to the login screen unless signed in.
export async function requireAuth() {
  if (!(await loadMe())) location.replace(LOGIN);
}

// Sign-in is a top-level navigation to the WorkOS hosted flow.
export const signIn = () => location.assign(`${apiHost}/auth/login`);

export async function signOutUser() {
  try { await fetch(`${apiHost}/auth/logout`, { method: "POST", credentials: "include" }); } catch {}
  report(null);
  location.assign(LOGIN);
}

// Switch workspaces: ask the backend to move the active tenant on the session,
// then reload into it.
export async function switchTo(tenant) {
  if (tenant === activeTenant()) return;
  const r = await fetch(`${apiHost}/auth/switch?tenant=${encodeURIComponent(tenant)}`, {
    method: "POST",
    credentials: "include",
  });
  if (!r.ok) return;
  setActiveTenant(tenant);
  location.assign(HOME);
}

export { LOGIN, HOME };

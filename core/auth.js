// core/auth.js — authentication for the dashboard.
//
// Identity Platform multi-tenancy is kept: each tenant is its own GIP tenant,
// and sign-in is scoped to it (the token only works against that tenant). A
// single Google account can belong to several tenants; the switcher re-auths
// into the target GIP tenant when you switch (the Google session makes that a
// near-instant popup).
//
// GET {API}/<tenant>/config returns that tenant's Firebase config (apiKey,
// authDomain, tenantId) — or a dev principal when Firebase isn't configured.
// The active tenant is the gateway's path argument (api.marzy.com/<tenant>/…),
// chosen via the switcher and remembered across loads.

const C = (typeof window !== "undefined" && window.MZ_SITE) || {};
const params = new URLSearchParams(location.search);
const isLocal = (h) => /(localhost|127\.0\.0\.1)/.test(h);

const ls = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lset = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch {} };

// The active tenant — switcher selection wins, then the remembered one, then the
// site default. ?tenant= overrides for testing.
const TKEY = "mz_tenant";
export const activeTenant = () => params.get("tenant") || ls(TKEY) || C.tenant || "";
export const setActiveTenant = (t) => lset(TKEY, t);

// One API host; the tenant is its path argument. ?api= overrides the whole base
// (remembered) for hitting a backend directly.
const qApi = params.get("api");
if (qApi) lset("mz_api", qApi);
const override = qApi || ls("mz_api");
const apiHost = C.api || (isLocal(location.hostname) ? "http://localhost:8080" : "https://api.marzy.com");
export const API_BASE = override
  ? override
  : activeTenant() && !isLocal(apiHost)
    ? `${apiHost.replace(/\/+$/, "")}/${activeTenant()}`
    : apiHost;

const LOGIN = (C.routes && C.routes.signin) || "/login";
const HOME = C.home || "/";
const FB = "https://www.gstatic.com/firebasejs/10.14.1";
const HINT = "mz_auth_hint";

let fb = null; // firebase Auth instance (prod)
let authMod = null; // the firebase-auth module (for building providers on switch)
let dev = null; // { roles, account } (dev mode)
let configCache = null;
let signInImpl = async () => {};
let signOutImpl = async () => {};
let getTokenImpl = async () => null;

// Current user, broadcast to subscribers (the switcher) on every change.
let user = null;
const subs = new Set();
const report = (u) => { user = u; lset(HINT, u ? u.email || "1" : null); subs.forEach((f) => { try { f(u); } catch {} }); };
export const getUser = () => user;
export const onUser = (cb) => { subs.add(cb); if (user) cb(user); return () => subs.delete(cb); };
export const authHint = () => ls(HINT);

export async function getConfig() {
  if (configCache) return configCache;
  const r = await fetch(`${API_BASE}/config`);
  if (!r.ok) throw new Error(`/config → ${r.status}`);
  configCache = await r.json();
  return configCache;
}

// Boot auth for the active tenant. `onState(user|null)` fires on every change.
export async function initAuth(onState = () => {}) {
  const tap = (u) => { report(u); onState(u); };
  const cfg = await getConfig();
  if (cfg.firebase) {
    const [{ initializeApp }, auth] = await Promise.all([
      import(`${FB}/firebase-app.js`),
      import(`${FB}/firebase-auth.js`),
    ]);
    authMod = auth;
    const app = initializeApp({ apiKey: cfg.firebase.apiKey, authDomain: cfg.firebase.authDomain });
    fb = auth.getAuth(app);
    if (cfg.firebase.tenantId) fb.tenantId = cfg.firebase.tenantId; // GIP tenant scope
    getTokenImpl = async () => (fb.currentUser ? fb.currentUser.getIdToken() : null);
    signInImpl = () => googleSignIn();
    signOutImpl = () => auth.signOut(fb);
    auth.onAuthStateChanged(fb, (u) => tap(u ? { email: u.email || "" } : null));
  } else {
    dev = { roles: cfg.roles && cfg.roles.length ? cfg.roles : ["admin"], account: cfg.account || "dev@local" };
    getTokenImpl = async () => null;
    signInImpl = async () => tap({ email: dev.account });
    signOutImpl = async () => tap(null);
    tap({ email: dev.account });
  }
  return cfg;
}

export const signIn = () => signInImpl();
export const signOutUser = () => signOutImpl();
export const getToken = () => getTokenImpl();

export async function authHeaders() {
  const h = { "Content-Type": "application/json" };
  const t = await getTokenImpl();
  if (t) h.Authorization = `Bearer ${t}`;
  else if (dev) { h["X-Ontology-Roles"] = dev.roles.join(","); h["X-Ontology-Account"] = dev.account; }
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

// Dashboard guard: bounce to the login screen unless signed in.
export function requireAuth() {
  initAuth((u) => { if (!u) location.replace(LOGIN); }).catch(() => location.replace(LOGIN));
}

// The tenants the switcher offers — the gateway's GIP-listed directory.
export async function loadTenants() {
  try { const r = await fetch(`${apiHost.replace(/\/+$/, "")}/tenants`); if (r.ok) return await r.json(); } catch {}
  return [];
}

// Google sign-in for the active GIP tenant. login_hint keeps it on the same
// account (no chooser); silent (prompt=none) re-auths invisibly when switching —
// the account is already consented, so Google completes it without UI.
function googleSignIn({ silent } = {}) {
  const provider = new authMod.GoogleAuthProvider();
  const params = {};
  if (user && user.email) params.login_hint = user.email;
  if (silent) params.prompt = "none";
  provider.setCustomParameters(params);
  return authMod.signInWithPopup(fb, provider);
}

// Switch workspaces: re-auth into the target GIP tenant (silently — same
// account), then reload into it. GIP tenants are isolated identity pools, so a
// token from one tenant isn't valid for another; this is the lightest re-auth.
export async function switchTo(tenant, tenantId) {
  if (tenant === activeTenant()) return;
  if (fb) {
    fb.tenantId = tenantId || null;
    try {
      await googleSignIn({ silent: true });
    } catch (e) {
      if (e && e.code === "auth/popup-closed-by-user") return;
      // Silent needs interaction (rare) — fall back to one visible sign-in.
      try { await googleSignIn(); }
      catch (e2) { if (e2 && e2.code === "auth/popup-closed-by-user") return; }
    }
  }
  setActiveTenant(tenant);
  location.assign(HOME);
}

export { LOGIN, HOME };

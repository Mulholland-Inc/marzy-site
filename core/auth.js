// core/auth.js — real authentication for the dashboard.
//
// Mirrors the contract the marzy Go service already serves (and the marzy/web
// app already proves): GET {API}/config returns either a Firebase/GIP config
// (prod) or a dev principal (no Firebase configured):
//
//   { name, firebase: { apiKey, authDomain, tenantId } }   ← prod
//   { name, roles: […], account }                          ← dev
//
// Prod signs in with a Firebase/GIP Google popup; the ID token rides on every
// API call as `Authorization: Bearer`. Dev has no popup — /config hands us a
// principal and we send X-Ontology-* headers instead.
//
// One API origin (api.marzy.com). The tenant is an argument the gateway
// resolves, not a subdomain — override the origin with MZ_SITE.api or ?api=…
// while the gateway is being stood up.

const C = (typeof window !== "undefined" && window.MZ_SITE) || {};

// A ?api=… override is remembered so it survives the login → dashboard hop while
// the gateway is being stood up. Order: query → remembered → site config → default.
const qApi = new URLSearchParams(location.search).get("api");
if (qApi) { try { localStorage.setItem("mz_api", qApi); } catch {} }
const rememberedApi = () => { try { return localStorage.getItem("mz_api"); } catch { return null; } };

export const API_BASE =
  qApi ||
  rememberedApi() ||
  C.api ||
  (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)
    ? "http://localhost:8080"
    : "https://api.marzy.com");

// Where the dashboard sends signed-out visitors, and where login returns them.
const LOGIN = (C.routes && C.routes.signin) || "login.html";
const HOME = C.home || "index.html";

// Firebase modular SDK over the gstatic ESM CDN — keeps the site build-step-free.
const FB = "https://www.gstatic.com/firebasejs/10.14.1";

// Last signed-in email, for a no-flash guard decision on the next load.
const HINT = "mz_auth_hint";

let fb = null; // firebase Auth instance (prod)
let dev = null; // { roles, account } (dev mode)
let configCache = null;
let signInImpl = async () => {};
let signOutImpl = async () => {};
let getTokenImpl = async () => null;

function setHint(v) {
  try {
    v ? localStorage.setItem(HINT, v) : localStorage.removeItem(HINT);
  } catch {}
}
export function authHint() {
  try {
    return localStorage.getItem(HINT);
  } catch {
    return null;
  }
}

export async function getConfig() {
  if (configCache) return configCache;
  const r = await fetch(`${API_BASE}/config`);
  if (!r.ok) throw new Error(`/config → ${r.status}`);
  configCache = await r.json();
  return configCache;
}

// Boot auth. `onState(user|null)` fires whenever the signed-in user changes
// (initial restore, sign-in, sign-out). Resolves to the /config payload.
export async function initAuth(onState = () => {}) {
  const cfg = await getConfig();
  if (cfg.firebase) {
    const [{ initializeApp }, auth] = await Promise.all([
      import(`${FB}/firebase-app.js`),
      import(`${FB}/firebase-auth.js`),
    ]);
    const app = initializeApp({ apiKey: cfg.firebase.apiKey, authDomain: cfg.firebase.authDomain });
    fb = auth.getAuth(app);
    if (cfg.firebase.tenantId) fb.tenantId = cfg.firebase.tenantId;
    getTokenImpl = async () => (fb.currentUser ? fb.currentUser.getIdToken() : null);
    signInImpl = () => auth.signInWithPopup(fb, new auth.GoogleAuthProvider());
    signOutImpl = () => auth.signOut(fb);
    auth.onAuthStateChanged(fb, (u) => {
      setHint(u ? u.email || "1" : null);
      onState(u ? { email: u.email || "" } : null);
    });
  } else {
    // Dev: /config hands us the principal; there's no session to restore.
    dev = { roles: cfg.roles && cfg.roles.length ? cfg.roles : ["admin"], account: cfg.account || "dev@local" };
    signInImpl = async () => { setHint(dev.account); onState({ email: dev.account }); };
    signOutImpl = async () => { setHint(null); onState(null); };
    setHint(dev.account);
    onState({ email: dev.account });
  }
  return cfg;
}

export const signIn = () => signInImpl();
export const signOutUser = () => signOutImpl();
export const getToken = () => getTokenImpl();

// Headers for an authed API call: Bearer in prod, dev headers otherwise.
export async function authHeaders() {
  const h = { "Content-Type": "application/json" };
  const t = await getTokenImpl();
  if (t) h.Authorization = `Bearer ${t}`;
  else if (dev) {
    h["X-Ontology-Roles"] = dev.roles.join(",");
    h["X-Ontology-Account"] = dev.account;
  }
  return h;
}

// Thin JSON helper over the API — used as the dashboard goes live.
export async function api(path, { method = "GET", body } = {}) {
  const r = await fetch(API_BASE + path, {
    method,
    headers: await authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}`);
  return r.status === 204 ? undefined : r.json();
}

// Dashboard pages call this on load: bounce to the login screen unless signed in.
export function requireAuth() {
  initAuth((user) => { if (!user) location.replace(LOGIN); }).catch(() => location.replace(LOGIN));
}

export { LOGIN, HOME };

// <mz-login></mz-login>, centered auth card over an animated pipe-maze
// background (auth environment).
import { SPARK } from "./spark.js";
import { buildPipes } from "./pipe.js";

const C = 38; // maze cell size
const NB = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const rint = (n) => Math.floor(Math.random() * n);

// Procedurally fill the area with a maze of pipes: lay many self-avoiding
// orthogonal walks, trace them into routes (running straight through
// junctions), then render as animated pipe bundles via buildPipes.
function buildMaze(W, H) {
  const cols = Math.ceil(W / C) + 2;
  const rows = Math.ceil(H / C) + 2;
  const cells = new Set();
  const key = (r, c) => r + "," + c;
  const has = (r, c) => cells.has(key(r, c));
  const inB = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols;

  const walks = Math.max(8, Math.round((cols * rows) / 20));
  for (let s = 0; s < walks; s++) {
    let r = rint(rows), c = rint(cols), di = rint(4);
    const len = 14 + rint(30);
    cells.add(key(r, c));
    let placed = 0, guard = 0;
    while (placed < len && guard++ < len * 8) {
      if (Math.random() < 0.4) di = (di + (Math.random() < 0.5 ? 1 : 3)) % 4;
      const [dr, dc] = NB[di];
      const nr = r + dr, nc = c + dc;
      if (!inB(nr, nc) || has(nr, nc)) { di = (di + 1) % 4; continue; }
      r = nr; c = nc; cells.add(key(r, c)); placed++;
    }
  }

  const adj = (r, c) => NB.map(([dr, dc]) => [r + dr, c + dc]).filter(([a, b]) => has(a, b));
  const eK = (a, b) => {
    const s1 = a[0] * cols + a[1], s2 = b[0] * cols + b[1];
    return s1 < s2 ? s1 + "-" + s2 : s2 + "-" + s1;
  };
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  const used = new Set();
  const list = [...cells].map((k) => k.split(",").map(Number));

  function walk(start, first) {
    const path = [start, first];
    used.add(eK(start, first));
    let prev = start, cur = first;
    while (true) {
      const inDir = [cur[0] - prev[0], cur[1] - prev[1]];
      const sC = [cur[0] + inDir[0], cur[1] + inDir[1]];
      let next = null;
      if (has(sC[0], sC[1]) && !used.has(eK(cur, sC))) next = sC;
      else if (adj(cur[0], cur[1]).length === 2)
        next = adj(cur[0], cur[1]).find((n) => !same(n, prev) && !used.has(eK(cur, n)));
      if (!next) break;
      used.add(eK(cur, next));
      prev = cur; cur = next; path.push(cur);
    }
    return path;
  }

  const routes = [];
  const tryStart = (r, c) =>
    adj(r, c).forEach((nb) => {
      if (!used.has(eK([r, c], nb))) routes.push(walk([r, c], nb));
    });
  for (const [r, c] of list) if (adj(r, c).length === 1) tryStart(r, c);
  for (const [r, c] of list) tryStart(r, c);

  // cell path → pixel points (shifted by -C so the maze overscans the edges),
  // dropping collinear midpoints
  const toPts = (p) => {
    const pts = p.map(([r, c]) => [c * C + C / 2 - C, r * C + C / 2 - C]);
    if (pts.length <= 2) return pts;
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const a = out[out.length - 1], b = pts[i], d = pts[i + 1];
      if (!((a[0] === b[0] && b[0] === d[0]) || (a[1] === b[1] && b[1] === d[1]))) out.push(b);
    }
    out.push(pts[pts.length - 1]);
    return out;
  };

  const rp = routes.map(toPts).filter((r) => r.length >= 2);
  if (!rp.length) return null;
  return buildPipes({
    routes: rp,
    width: W,
    height: H,
    n: 2,
    spacing: 5,
    radius: 14,
    fade: false,
    preserve: "none",
  });
}

class MzLogin extends HTMLElement {
  connectedCallback() {
    this.classList.add("auth");
    this.innerHTML = `
      <div class="auth-bg" aria-hidden="true"></div>
      <div class="auth-card">
        <div class="auth-brand"><span class="spark auth-mark" aria-hidden="true">${SPARK}</span></div>
        <h2>Sign in to Marzy</h2>
        <p class="auth-sub">Welcome back. Pick up where your workflows left off.</p>
        <form class="auth-form" onsubmit="return false">
          <mz-field label="Email" type="email" placeholder="you@company.com" for="mz-email"></mz-field>
          <mz-field label="Password" type="password" placeholder="••••••••" for="mz-pass"></mz-field>
          <div class="auth-row">
            <mz-muted style="font-size:var(--text-13)">Remember me</mz-muted>
            <a class="auth-forgot" href="#">Forgot password?</a>
          </div>
          <button class="btn btn-primary" type="submit">Sign in</button>
        </form>
        <div class="auth-divider">or</div>
        <button class="btn btn-outline" type="button" style="width:100%;justify-content:center">Continue with Google</button>
        <p class="auth-foot">New to Marzy? <a class="link" href="#">Request access</a></p>
      </div>`;

    const bg = this.querySelector(".auth-bg");
    let lw = 0, lh = 0;
    const draw = () => {
      const w = Math.round(this.clientWidth), h = Math.round(this.clientHeight);
      if (!w || !h) return;
      if (bg.firstChild && Math.abs(w - lw) < 24 && Math.abs(h - lh) < 24) return;
      lw = w; lh = h;
      const svg = buildMaze(w, h);
      if (svg) bg.replaceChildren(svg);
    };
    requestAnimationFrame(draw);
    if ("ResizeObserver" in window) {
      this._ro = new ResizeObserver(draw);
      this._ro.observe(this);
    }
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
  }
}
customElements.define("mz-login", MzLogin);

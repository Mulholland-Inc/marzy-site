// <mz-login></mz-login>, centered auth card over an animated pipe-maze
// background (auth environment).
import { SPARK } from "./spark.js";
import { buildPipes } from "./pipe.js";

// One continuous snake of pipes that twists through the whole area like the
// game Snake. A self-avoiding walk on a coarse grid, steered by Warnsdorff's
// heuristic (always move to the most-constrained cell) so it fills the space
// with constant turns and never crosses itself. Rendered as the same thick
// layered bundle as the site dividers.
const CELL = 96;
const NB = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const rint = (n) => Math.floor(Math.random() * n);

function snakePath(cols, rows) {
  const seen = new Set();
  const key = (r, c) => r + "," + c;
  const inB = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols;
  const free = (r, c) => inB(r, c) && !seen.has(key(r, c));
  const onward = (r, c) => NB.reduce((n, [dr, dc]) => n + (free(r + dr, c + dc) ? 1 : 0), 0);

  let r = rint(rows), c = rint(cols);
  seen.add(key(r, c));
  const path = [[r, c]];
  while (true) {
    const opts = NB.map(([dr, dc]) => [r + dr, c + dc]).filter(([nr, nc]) => free(nr, nc));
    if (!opts.length) break;
    // Warnsdorff: step to the neighbour with the fewest onward moves (random
    // tie-break) — yields long, twisty, near space-filling snakes
    let min = Infinity, pick = [];
    for (const [nr, nc] of opts) {
      const o = onward(nr, nc);
      if (o < min) { min = o; pick = [[nr, nc]]; }
      else if (o === min) pick.push([nr, nc]);
    }
    [r, c] = pick[rint(pick.length)];
    seen.add(key(r, c));
    path.push([r, c]);
  }
  return path;
}

function buildSnake(W, H) {
  // overscan the grid by a ring of cells so the snake bleeds off every edge
  const cols = Math.ceil(W / CELL) + 3;
  const rows = Math.ceil(H / CELL) + 3;
  const total = cols * rows;

  let best = [];
  for (let t = 0; t < 10 && best.length < total * 0.85; t++) {
    const p = snakePath(cols, rows);
    if (p.length > best.length) best = p;
  }

  // grid → pixel points (shifted so the overscan ring is off-screen), keeping
  // only the turn vertices
  const raw = best.map(([r, c]) => [c * CELL - CELL, r * CELL - CELL]);
  const pts = [raw[0]];
  for (let i = 1; i < raw.length - 1; i++) {
    const a = pts[pts.length - 1], b = raw[i], d = raw[i + 1];
    if (!((a[0] === b[0] && b[0] === d[0]) || (a[1] === b[1] && b[1] === d[1]))) pts.push(b);
  }
  pts.push(raw[raw.length - 1]);

  return buildPipes({
    routes: [pts],
    width: W,
    height: H,
    n: 7,
    spacing: 9,
    radius: 34,
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
      bg.replaceChildren(buildSnake(w, h));
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

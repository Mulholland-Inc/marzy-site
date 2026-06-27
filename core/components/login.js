// <mz-login></mz-login>, centered auth card over an animated pipe-maze
// background (auth environment).
import { SPARK } from "./spark.js";
import { buildPipes } from "./pipe.js";
import { ROUTES } from "./site-config.js";
import { animate, reduce, EASE_IN } from "./motion.js";

// Background is a single Hilbert curve — a space-filling curve that threads
// one continuous, non-crossing pipe through the whole area, bending at nearly
// every step. Rendered as the thick layered bundle used by the site dividers.
const CELL = 60;

// Hilbert d → (x, y) on a side×side grid (side must be a power of two).
function hilbert(side, d) {
  let x = 0, y = 0, t = d;
  for (let s = 1; s < side; s *= 2) {
    const rx = 1 & (t >> 1);
    const ry = 1 & (t ^ rx);
    if (ry === 0) {
      if (rx === 1) { x = s - 1 - x; y = s - 1 - y; }
      const tmp = x; x = y; y = tmp;
    }
    x += s * rx;
    y += s * ry;
    t >>= 2;
  }
  return [x, y];
}

function buildSnake(W, H) {
  // smallest power-of-two grid whose square covers the area; centre + overscan
  let side = 2;
  while (side * CELL < Math.max(W, H) && side < 64) side *= 2;
  const sidePx = side * CELL;
  const ox = (W - sidePx) / 2 + CELL / 2;
  const oy = (H - sidePx) / 2 + CELL / 2;

  const raw = [];
  for (let d = 0; d < side * side; d++) {
    const [gx, gy] = hilbert(side, d);
    raw.push([ox + gx * CELL, oy + gy * CELL]);
  }
  // keep only the corner vertices
  const pts = [raw[0]];
  for (let i = 1; i < raw.length - 1; i++) {
    const a = pts[pts.length - 1], b = raw[i], e = raw[i + 1];
    if (!((a[0] === b[0] && b[0] === e[0]) || (a[1] === b[1] && b[1] === e[1]))) pts.push(b);
  }
  pts.push(raw[raw.length - 1]);

  return buildPipes({
    routes: [pts],
    width: W,
    height: H,
    n: 7,
    spacing: 7,
    radius: 22,
    fade: false,
    preserve: "none",
  });
}

class MzLogin extends HTMLElement {
  connectedCallback() {
    this.classList.add("auth");
    // where to go after a (mock) successful sign-in
    const next = this.getAttribute("next") || "index.html";
    this.innerHTML = `
      <div class="auth-bg" aria-hidden="true"></div>
      <div class="auth-card">
        <div class="auth-brand"><span class="spark auth-mark" aria-hidden="true">${SPARK}</span></div>
        <h2>Sign in to Marzy</h2>
        <form class="auth-form">
          <mz-field label="Email" type="email" placeholder="you@company.com" for="mz-email"></mz-field>
          <mz-field label="Password" type="password" placeholder="••••••••" for="mz-pass"></mz-field>
          <div class="auth-row">
            <label class="auth-remember"><input type="checkbox" class="checkbox" /><span>Remember me</span></label>
            <a class="auth-forgot" href="#">Forgot password?</a>
          </div>
          <button class="btn btn-primary" type="submit">Sign in</button>
        </form>
        <button class="btn btn-outline auth-google" type="button">Continue with Google</button>
        <p class="auth-foot">New to Marzy? <a class="link" href="${ROUTES.contact || "#"}">Request access</a></p>
      </div>`;

    // mock auth: any submit (or Google) plays the exit, then proceeds to the app —
    // the card fades up and out, then the pipes dissolve.
    const go = (e) => {
      e.preventDefault();
      if (this._leaving) return;
      this._leaving = true;
      if (reduce) {
        window.location.href = next;
        return;
      }
      const card = this.querySelector(".auth-card");
      const bg = this.querySelector(".auth-bg");
      animate(card, { opacity: [1, 0], y: [0, -32], scale: [1, 0.97] }, { duration: 0.42, ease: EASE_IN });
      animate(bg, { opacity: [1, 0] }, { duration: 0.55, delay: 0.12, ease: EASE_IN });
      setTimeout(() => (window.location.href = next), 660);
    };
    this.querySelector(".auth-form").addEventListener("submit", go);
    this.querySelector(".auth-google").addEventListener("click", go);

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

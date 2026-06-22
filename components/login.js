// <mz-login></mz-login>, centered auth card over an animated pipe-maze
// background (auth environment).
import { SPARK } from "./spark.js";
import { buildPipes } from "./pipe.js";

// One continuous snake of pipes — a serpentine (boustrophedon) route that
// runs across, U-turns at the edge, drops a row, runs back, and so on. A
// single non-crossing path, rendered as the same thick layered bundle as the
// site dividers. radius = rowGap/2 makes the U-turns clean half-circles.
const ROW_GAP = 96;
const OVER_X = 90; // overshoot so the snake bleeds off the sides

function buildSnake(W, H) {
  const rows = Math.ceil((H + ROW_GAP) / ROW_GAP) + 1;
  const startY = -ROW_GAP / 2;
  const pts = [];
  let x = -OVER_X;
  for (let i = 0; i < rows; i++) {
    const y = startY + i * ROW_GAP;
    const other = x === -OVER_X ? W + OVER_X : -OVER_X;
    pts.push([x, y]);     // turn down into this row (vertical from the row above)
    pts.push([other, y]); // run across
    x = other;
  }
  return buildPipes({
    routes: [pts],
    width: W,
    height: H,
    n: 7,
    spacing: 9,
    radius: ROW_GAP / 2,
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

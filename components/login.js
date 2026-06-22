// <mz-login></mz-login>, centered auth card over an animated pipe-maze
// background (auth environment).
import { SPARK } from "./spark.js";
import { buildPipes } from "./pipe.js";

// One continuous snake of pipes — a vertical "comb": run down a column,
// U-turn, run up the next, U-turn, and so on across the width. The U-turns
// sit INSIDE the viewport (top & bottom), so you see a bend on every column —
// a maze-like pattern, not just straight lines. Single non-crossing path,
// rendered as the same thick layered bundle as the site dividers.
const COL_GAP = 112;

function buildSnake(W, H) {
  const yTop = 72, yBot = H - 72;
  const cols = Math.ceil((W + 2 * COL_GAP) / COL_GAP) + 1;
  const startX = -COL_GAP;
  const pts = [];
  for (let j = 0; j < cols; j++) {
    const x = startX + j * COL_GAP;
    if (j % 2 === 0) {
      pts.push([x, yTop], [x, yBot]); // run down
    } else {
      pts.push([x, yBot], [x, yTop]); // run up
    }
    // the segment to the next column's first point becomes the U-turn
  }
  return buildPipes({
    routes: [pts],
    width: W,
    height: H,
    n: 7,
    spacing: 9,
    radius: COL_GAP / 2,
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

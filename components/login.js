// <mz-login></mz-login>, centered auth card (auth environment).
import { SPARK } from "./spark.js";
import { buildPipes } from "./pipe.js";

const STRIPE_H = 18;

// Three animated pipes flowing left → right, built at the container's exact
// pixel width (1:1) so the strokes and dash flow never stretch.
function fillStripes(el) {
  const w = Math.round(el.getBoundingClientRect().width);
  if (!w) return;
  el.replaceChildren(
    buildPipes({
      routes: [[[-12, STRIPE_H / 2], [w + 12, STRIPE_H / 2]]],
      width: w,
      height: STRIPE_H,
      n: 3,
      spacing: 7,
      radius: 1,
      fade: false,
      preserve: "none",
    })
  );
}

class MzLogin extends HTMLElement {
  connectedCallback() {
    this.classList.add("auth");
    this.innerHTML = `
      <div class="auth-card">
        <div class="auth-brand"><span class="brand-stripes brand-stripes-l" aria-hidden="true"></span><span class="spark auth-mark" aria-hidden="true">${SPARK}</span><span class="brand-stripes brand-stripes-r" aria-hidden="true"></span></div>
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
    const l = this.querySelector(".brand-stripes-l");
    const r = this.querySelector(".brand-stripes-r");
    const draw = () => {
      fillStripes(l);
      fillStripes(r);
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

// <mz-login></mz-login>, centered auth card (auth environment).
import { SPARK } from "./spark.js";
import { buildPipes } from "./pipe.js";

// A short bundle of three animated pipes flowing left → right, used either
// side of the mark so flow appears to pass through it.
const stripes = () =>
  buildPipes({
    routes: [[[0, 9], [120, 9]]],
    width: 120,
    height: 18,
    n: 3,
    spacing: 6,
    radius: 1,
    fade: false,
    preserve: "none",
  });

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
    this.querySelector(".brand-stripes-l").appendChild(stripes());
    this.querySelector(".brand-stripes-r").appendChild(stripes());
  }
}
customElements.define("mz-login", MzLogin);

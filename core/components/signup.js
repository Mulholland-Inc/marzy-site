// <mz-signup></mz-signup>, waitlist / email capture band (marketing).
class MzSignup extends HTMLElement {
  connectedCallback() {
    this.classList.add("signup");
    this.innerHTML = `
      <h2>Put the back office on autopilot.</h2>
      <p class="signup-sub">Join the waitlist, we'll show you your own workflows automated.</p>
      <form class="signup-form" onsubmit="return false">
        <input class="input" type="email" placeholder="you@company.com" aria-label="Work email" />
        <button class="btn btn-primary" type="submit">Request access</button>
      </form>`;
  }
}
customElements.define("mz-signup", MzSignup);

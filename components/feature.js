// <mz-feature [reverse]></mz-feature> — feature split: copy + an animated card stack.
const CHECK = '<svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>';
const FEATS = [
  "Reads email, PDFs, and webhooks",
  "Acts through the tools you already use",
  "Stops to ask only when it matters",
];
class MzFeature extends HTMLElement {
  connectedCallback() {
    this.classList.add("feature");
    if (this.hasAttribute("reverse")) this.classList.add("reverse");
    const feats = FEATS.map((f) => `<li>${CHECK}<span>${f}</span></li>`).join("");
    this.innerHTML = `
      <div>
        <h2>Reads the work. Runs it.</h2>
        <ul class="feature-list">${feats}</ul>
      </div>
      <div>
        <div class="card" style="width: 100%; max-width: 400px">
          <b>June payroll</b>
          <p class="muted" style="font-size: var(--text-14); margin-top: var(--space-2)">Drafted from 14 inbox items — hours matched to employees.</p>
          <div class="actions" style="margin-top: var(--space-4)"><button class="btn btn-primary btn-sm" type="button">Approve run</button><button class="btn btn-outline btn-sm" type="button">Open</button></div>
        </div>
      </div>`;
  }
}
customElements.define("mz-feature", MzFeature);

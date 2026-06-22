// <mz-embed-doc></mz-embed-doc>, a compact display-only document preview card
// for embedding in Slack / MCP surfaces. Fades out at the bottom. No inputs.
const FILE =
  '<svg class="embed-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/></svg>';

class MzEmbedDoc extends HTMLElement {
  connectedCallback() {
    this.classList.add("embed", "embed-doc");
    this.innerHTML = `
      <div class="embed-head"><span class="embed-mark">${FILE}</span><span class="embed-title">Master Services Agreement</span><span class="embed-meta">PDF · 6p</span></div>
      <div class="embed-doc-body">
        <h4>1. Scope of services</h4>
        <p>Provider will deliver the back-office automation described in Exhibit A: payroll preparation, invoice reconciliation, and reporting.</p>
        <p>Each workflow runs under Client approval and is logged with a full, immutable audit trail retained for the term of this agreement.</p>
        <p>Client grants Provider scoped, revocable access to the systems listed in Exhibit B solely to perform the services.</p>
      </div>`;
  }
}
customElements.define("mz-embed-doc", MzEmbedDoc);

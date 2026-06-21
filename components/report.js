// <mz-report></mz-report>, long-form report / document page (sample).
class MzReport extends HTMLElement {
  connectedCallback() {
    this.classList.add("document");
    this.innerHTML = `
      <article class="doc">
        <h1>June operations report</h1>
        <div class="doc-meta"><span>Marzy · Lazarco workspace</span><span>June 1–30, 2026</span></div>
        <p class="lead">Marzy handled the bulk of routine back-office work this month, routing only the exceptions to your team. Payroll, billing, and record-keeping ran on schedule with no missed deadlines.</p>

        <h2>Payroll</h2>
        <p>Three pay runs were drafted from inbound timesheets and approved within the review window. Marzy matched hours to employees, flagged two anomalies for review, and filed each run to Gusto once approved.</p>
        <p>Average time from inbox to filed pay run dropped to under four hours, down from roughly two days a month ago.</p>

        <h2>Connections</h2>
        <p>All connectors stayed healthy except a brief QuickBooks token expiry, which was renewed the same day. Coverage this month spanned:</p>
        <ul>
          <li>Gusto, payroll &amp; benefits</li>
          <li>QuickBooks, billing &amp; ledger</li>
          <li>Sikka · FHIR, records sync</li>
        </ul>

        <h2>What's next</h2>
        <p>We recommend enabling auto-run on the payroll workflow now that it has cleared three consecutive review cycles without edits. This would remove the final manual step while preserving the full audit trail.</p>
      </article>`;
  }
}
customElements.define("mz-report", MzReport);

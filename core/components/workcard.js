// <mz-workcard></mz-workcard>, a single product work-item card (centered).
class MzWorkcard extends HTMLElement {
  connectedCallback() {
    this.classList.add("card", "workcard");
    this.innerHTML = `
      <div class="workcard-title">June payroll</div>
      <p>Drafted from 14 inbox items, hours matched to employees.</p>
      <mz-actions style="margin-top: var(--space-4)">
        <mz-btn variant="primary" size="sm">Approve run</mz-btn>
        <mz-btn variant="outline" size="sm">Open</mz-btn>
      </mz-actions>`;
  }
}
customElements.define("mz-workcard", MzWorkcard);

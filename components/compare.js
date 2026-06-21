// <mz-compare></mz-compare> — manual vs Marzy comparison (marketing).
const CHECK = '<svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>';
const X = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const OLD = [
  "Chase timesheets over email",
  "Re-key data between tools",
  "Manual approvals, easy to miss",
  "No trail when something slips",
];
const NEW = [
  "Inbox read automatically",
  "Systems kept in sync",
  "Trusted flows run themselves",
  "Every action logged with reasoning",
];
class MzCompare extends HTMLElement {
  connectedCallback() {
    this.classList.add("compare");
    const oldRows = OLD.map((o) => `<li class="bad">${X}<span>${o}</span></li>`).join("");
    const newRows = NEW.map((n) => `<li>${CHECK}<span>${n}</span></li>`).join("");
    this.innerHTML = `
      <div class="compare-card"><h3>The manual way</h3><ul class="compare-list">${oldRows}</ul></div>
      <div class="compare-card is-good"><h3>With Marzy</h3><ul class="compare-list">${newRows}</ul></div>`;
  }
}
customElements.define("mz-compare", MzCompare);

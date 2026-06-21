// <mz-compliance></mz-compliance>, three keycard-style compliance badges.
const ICON = {
  soc2: '<svg viewBox="0 0 48 48"><path d="M24 5 9 11v9c0 9 6.4 16.3 15 19 8.6-2.7 15-10 15-19v-9z"/><path d="m17 24 5 5 9-10"/></svg>',
  hipaa: '<svg viewBox="0 0 48 48"><path d="M24 39C12 31 7 23 7 16.5A8.5 8.5 0 0 1 24 12a8.5 8.5 0 0 1 17 4.5C41 23 36 31 24 39Z"/><path d="M13 23.5h6l3-5 4 10 3-5h6"/></svg>',
  iso: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15"/><path d="M9 24h30"/><path d="M24 9c5.5 4.5 5.5 25.5 0 30M24 9c-5.5 4.5-5.5 25.5 0 30"/><path d="M12 15c7.5 4 16.5 4 24 0M12 33c7.5-4 16.5-4 24 0"/></svg>',
};
const CERTS = [
  ["soc2", "SOC 2", "Type II"],
  ["hipaa", "HIPAA", "Compliant"],
  ["iso", "ISO 27001", "Certified"],
];
class MzCompliance extends HTMLElement {
  connectedCallback() {
    this.classList.add("compliance");
    const cards = CERTS.map(
      ([icon, name, sub]) => `<div class="keycard"><div class="keycard-top">${ICON[icon]}</div><div class="keycard-bottom"><span class="keycard-name">${name}</span><span class="keycard-sub">${sub}</span></div></div>`
    ).join("");
    this.innerHTML = `<div class="comp-cards">${cards}</div><div class="comp-foot"><a class="btn btn-primary" href="#">Visit trust portal</a></div>`;
  }
}
customElements.define("mz-compliance", MzCompliance);

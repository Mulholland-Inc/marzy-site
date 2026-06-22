// <mz-trust-banner></mz-trust-banner>, a dark compliance banner: the standards
// set as big type with a short trust line.
const ICON = {
  soc2: '<svg viewBox="0 0 48 48"><path d="M24 5 9 11v9c0 9 6.4 16.3 15 19 8.6-2.7 15-10 15-19v-9z"/><path d="m17 24 5 5 9-10"/></svg>',
  hipaa: '<svg viewBox="0 0 48 48"><path d="M24 39C12 31 7 23 7 16.5A8.5 8.5 0 0 1 24 12a8.5 8.5 0 0 1 17 4.5C41 23 36 31 24 39Z"/><path d="M13 23.5h6l3-5 4 10 3-5h6"/></svg>',
  iso: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15"/><path d="M9 24h30"/><path d="M24 9c5.5 4.5 5.5 25.5 0 30M24 9c-5.5 4.5-5.5 25.5 0 30"/><path d="M12 15c7.5 4 16.5 4 24 0M12 33c7.5-4 16.5-4 24 0"/></svg>',
};

class MzTrustBanner extends HTMLElement {
  connectedCallback() {
    this.classList.add("trustbanner");
    const dot = '<span class="trustbanner-dot">·</span>';
    this.innerHTML = `
      <div class="trustbanner-icons" aria-hidden="true">
        <span>${ICON.soc2}</span><span>${ICON.hipaa}</span><span>${ICON.iso}</span>
      </div>
      <h2 class="trustbanner-title">SOC 2 ${dot} HIPAA ${dot} ISO 27001</h2>
      <p class="trustbanner-sub">Independently audited, encrypted end to end, and always yours.</p>
      <div class="actions"><a class="btn ctaband-ghost" href="#">Visit trust portal</a></div>`;
  }
}
customElements.define("mz-trust-banner", MzTrustBanner);

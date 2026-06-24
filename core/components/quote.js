// <mz-quote author="…" role="…">Quote text…</mz-quote>
// A testimonial / pull-quote card (marketing).
class MzQuote extends HTMLElement {
  connectedCallback() {
    const text =
      this.innerHTML.trim() ||
      "Marzy closed our books in a day and flagged the three things that mattered. The audit trail alone paid for it.";
    const author = this.getAttribute("author") || "Dana Reyes";
    const role = this.getAttribute("role") || "COO, Lazarco Inc.";
    const initials = author.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    this.classList.add("quote");
    this.innerHTML = `
      <span class="quote-mark" aria-hidden="true">&ldquo;</span>
      <p class="quote-text">${text}</p>
      <div class="quote-author">
        <span class="quote-av">${initials}</span>
        <span class="quote-meta"><b>${author}</b><span class="t-meta">${role}</span></span>
      </div>`;
  }
}
customElements.define("mz-quote", MzQuote);

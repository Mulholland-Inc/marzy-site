// <mz-data-clean></mz-data-clean>, marketing section on the unglamorous work
// that makes AI usable: Marzy as the back-office data cleaner. Copy on the
// left, a before/after panel on the right showing messy records getting
// deduped, enriched and normalized into AI-ready rows.
import { SPARK } from "./spark.js";

const CHECK =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17.5 19 6.5"/></svg>';

// [marker, raw text, what Marzy did, cleaned text]
const ROWS = [
  ["dup", "Jon Smith · J. Smith", "merged", "Jonathan Smith"],
  ["—", "phone: missing", "enriched", "+1 415 555 0142"],
  ["≠", "03/04/26 · 4-Mar", "normalized", "2026-03-04"],
];

class MzDataClean extends HTMLElement {
  connectedCallback() {
    this.classList.add("dclean");

    const before = ROWS.map(
      ([mk, raw]) =>
        `<li class="dclean-row is-raw"><span class="dclean-mk">${mk}</span><span class="dclean-txt">${raw}</span></li>`
    ).join("");

    const after = ROWS.map(
      ([, , did, clean]) =>
        `<li class="dclean-row is-clean"><span class="dclean-ok">${CHECK}</span><span class="dclean-txt">${clean}<i>${did}</i></span></li>`
    ).join("");

    this.innerHTML = `
      <div class="dclean-copy">
        <h2 class="dclean-title">We clean your data,<br />so your AI actually works.</h2>
        <p class="lead">Most AI stalls on the back office it inherits — duplicate records, missing fields, formats that don't match. Marzy does the unglamorous part first: dedupe, enrich and normalize every record, so whatever you adopt next has something solid to stand on.</p>
        <div class="actions"><a class="btn btn-primary" href="#">Get AI-ready</a></div>
      </div>
      <div class="dclean-panel">
        <div class="dclean-stage">
          <span class="dclean-tag">Raw records</span>
          <ul class="dclean-rows">${before}</ul>
        </div>
        <div class="dclean-flow">
          <span class="dclean-spark" aria-hidden="true">${SPARK}</span>
          <span class="dclean-flow-label">Marzy cleans</span>
        </div>
        <div class="dclean-stage">
          <span class="dclean-tag dclean-tag-volt">AI-ready</span>
          <ul class="dclean-rows">${after}</ul>
        </div>
      </div>`;
  }
}
customElements.define("mz-data-clean", MzDataClean);

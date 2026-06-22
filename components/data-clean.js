// <mz-data-clean></mz-data-clean>, marketing section on the unglamorous work
// that makes AI usable: Marzy as the back-office data cleaner. A centered
// title/subtitle over two tables — raw records and AI-ready records — joined
// by animated pipes flowing from one into the next.
import { buildPipes } from "./pipe.js";

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
      <div class="dclean-head">
        <h2 class="dclean-title">We clean your data, so your AI actually works.</h2>
        <p class="lead dclean-sub">Most AI stalls on the back office it inherits — duplicate records, missing fields, formats that don't match. Marzy does the unglamorous part first: dedupe, enrich and normalize every record, so whatever you adopt next has something solid to stand on.</p>
      </div>
      <div class="dclean-flow">
        <div class="dclean-stage">
          <span class="dclean-tag">Raw records</span>
          <ul class="dclean-rows">${before}</ul>
        </div>
        <div class="dclean-pipes" aria-hidden="true"></div>
        <div class="dclean-stage">
          <span class="dclean-tag dclean-tag-volt">AI-ready</span>
          <ul class="dclean-rows">${after}</ul>
        </div>
      </div>`;

    // Animated pipes flowing left → right, from raw records into AI-ready.
    this.querySelector(".dclean-pipes").appendChild(
      buildPipes({
        routes: [[[-40, 60], [160, 60]]],
        width: 120,
        height: 120,
        n: 7,
        spacing: 8,
        radius: 1,
        preserve: "xMidYMid meet",
      })
    );
  }
}
customElements.define("mz-data-clean", MzDataClean);

// <mz-data-clean></mz-data-clean>, marketing section positioning Marzy as the
// back-office data cleaner. A single "reconciliation ledger": raw records on
// the left pass through a central Volt pipe (the brand motif, here the cleaning
// filter) and resolve into AI-ready records on the right. Type carries the
// transformation — raw values are set in mono (unresolved), cleaned values in
// the display face (composed).
import { buildPipes } from "./pipe.js";

// [field, raw value, what Marzy did, cleaned value]
const ROWS = [
  ["Name", "Jon Smith · J. Smith", "merged", "Jonathan Smith"],
  ["Phone", "— missing", "enriched", "+1 415 555 0142"],
  ["Date", "03/04/26 · 4-Mar", "normalized", "2026-03-04"],
];

class MzDataClean extends HTMLElement {
  connectedCallback() {
    this.classList.add("dclean");

    const raw = ROWS.map(
      ([field, value]) =>
        `<li class="dclean-row"><span class="dclean-field">${field}</span><span class="dclean-raw">${value}</span></li>`
    ).join("");

    const clean = ROWS.map(
      ([, , note, value]) =>
        `<li class="dclean-row"><span class="dclean-clean">${value}</span><span class="dclean-note">${note}</span></li>`
    ).join("");

    this.innerHTML = `
      <div class="dclean-head">
        <p class="dclean-kicker">Dedupe · Enrich · Normalize</p>
        <h2 class="dclean-title">We clean your data first.</h2>
        <p class="lead dclean-sub">AI breaks on the back office it inherits — duplicate records, missing fields, dates that don't agree. Marzy reconciles every record before a model ever touches it.</p>
      </div>
      <div class="dclean-card">
        <div class="dclean-grid">
          <div class="dclean-col">
            <span class="dclean-tag">Raw records</span>
            <ul class="dclean-rows">${raw}</ul>
          </div>
          <div class="dclean-seam" aria-hidden="true"></div>
          <div class="dclean-col is-clean">
            <span class="dclean-tag">AI-ready</span>
            <ul class="dclean-rows">${clean}</ul>
          </div>
        </div>
        <p class="dclean-foot">1,284 records reconciled this week — 0 left ambiguous.</p>
      </div>`;

    // Central vertical pipe — the brand motif as the cleaning filter. All
    // strokes are recolored Volt in CSS; it slices to fill the card height.
    this.querySelector(".dclean-seam").appendChild(
      buildPipes({
        routes: [[[32, -40], [32, 440]]],
        width: 64,
        height: 400,
        n: 5,
        spacing: 7,
        radius: 1,
        preserve: "xMidYMid slice",
      })
    );
  }
}
customElements.define("mz-data-clean", MzDataClean);

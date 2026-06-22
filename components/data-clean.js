// <mz-data-clean></mz-data-clean>, marketing section positioning Marzy as the
// back-office data cleaner. Two tables — raw records and AI-ready records —
// with an animated Volt pipe bundle flowing between them. Raw values read
// muted; cleaned values land in ink (black) with a small note tag.
import { buildPipes } from "./pipe.js";

// [field, raw value, cleaned value, what Marzy did]
const ROWS = [
  ["Name", "Jon Smith · J. Smith", "Jonathan Smith", "merged"],
  ["Phone", "— missing", "+1 415 555 0142", "enriched"],
  ["Date", "03/04/26 · 4-Mar", "2026-03-04", "normalized"],
  ["Address", "1 main st", "1 Main St, Austin TX", "standardized"],
];

class MzDataClean extends HTMLElement {
  connectedCallback() {
    this.classList.add("dclean");

    const rawRows = ROWS.map(
      ([field, raw]) =>
        `<tr><td class="dclean-field">${field}</td><td class="dclean-raw">${raw}</td></tr>`
    ).join("");

    const cleanRows = ROWS.map(
      ([, , clean, note]) =>
        `<tr><td class="dclean-clean">${clean} <span class="dclean-note">${note}</span></td></tr>`
    ).join("");

    this.innerHTML = `
      <div class="dclean-head">
        <h2 class="dclean-title">We clean your data first.</h2>
        <p class="lead dclean-sub">AI breaks on the back office it inherits — duplicate records, missing fields, dates that don't agree. Marzy reconciles every record before a model ever touches it.</p>
      </div>
      <div class="dclean-flow">
        <div class="dclean-card table-card">
          <table class="table dclean-table">
            <thead><tr><th>Field</th><th>Raw record</th></tr></thead>
            <tbody>${rawRows}</tbody>
          </table>
        </div>
        <div class="dclean-pipes" aria-hidden="true"></div>
        <div class="dclean-card table-card">
          <table class="table dclean-table">
            <thead><tr><th>AI-ready</th></tr></thead>
            <tbody>${cleanRows}</tbody>
          </table>
        </div>
      </div>`;

    // Animated Volt pipe bundle flowing left → right, raw into AI-ready.
    this.querySelector(".dclean-pipes").appendChild(
      buildPipes({
        routes: [[[-20, 30], [140, 30]]],
        width: 120,
        height: 60,
        n: 5,
        spacing: 7,
        radius: 1,
        fade: false,
        preserve: "xMidYMid meet",
      })
    );
  }
}
customElements.define("mz-data-clean", MzDataClean);

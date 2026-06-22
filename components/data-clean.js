// <mz-data-clean></mz-data-clean>, marketing section positioning Marzy as the
// back-office data cleaner. A proper table: each row is one field whose raw
// value flows through an animated Volt pipe and arrives AI-ready. Raw values
// read muted; cleaned values land in ink (black).
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

    const rows = ROWS.map(
      ([field, raw, clean, note]) =>
        `<tr>
          <td class="dclean-field">${field}</td>
          <td class="dclean-raw">${raw}</td>
          <td class="dclean-pipe" aria-hidden="true"></td>
          <td class="dclean-clean">${clean} <span class="dclean-note">${note}</span></td>
        </tr>`
    ).join("");

    this.innerHTML = `
      <div class="dclean-head">
        <h2 class="dclean-title">We clean your data first.</h2>
        <p class="lead dclean-sub">AI breaks on the back office it inherits — duplicate records, missing fields, dates that don't agree. Marzy reconciles every record before a model ever touches it.</p>
      </div>
      <div class="dclean-card table-card">
        <div class="table-scroll">
          <table class="table dclean-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Raw record</th>
                <th></th>
                <th>AI-ready</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="dclean-foot">1,284 records reconciled this week — 0 left ambiguous.</p>
      </div>`;

    // A short animated Volt pipe in each connector cell — raw flows to clean.
    this.querySelectorAll(".dclean-pipe").forEach((cell) =>
      cell.appendChild(
        buildPipes({
          routes: [[[-12, 11], [72, 11]]],
          width: 60,
          height: 22,
          n: 3,
          spacing: 5,
          radius: 1,
          fade: false,
          preserve: "xMidYMid meet",
        })
      )
    );
  }
}
customElements.define("mz-data-clean", MzDataClean);

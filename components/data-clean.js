// <mz-data-clean></mz-data-clean>, marketing section positioning Marzy as the
// back-office data cleaner. Two headerless multi-column tables — raw records
// and AI-ready records — bridged edge to edge by a dense animated Volt pipe
// field. Raw rows read muted; cleaned rows land in ink with a note tag.
import { buildPipes } from "./pipe.js";

// raw: [name, email, phone]  clean: [name, email, phone]  note
const RECORDS = [
  [["jon smith · J. Smith", "jon@lazarco", "—"], ["Jonathan Smith", "jon@lazarco.com", "+1 415 555 0142"], "merged"],
  [["ACME inc", "billing@acme", "missing"], ["Acme, Inc.", "billing@acme.com", "+1 512 555 0199"], "enriched"],
  [["maria GARCIA", "m.garcia@", "(415)5550181"], ["María García", "m.garcia@lazarco.com", "+1 415 555 0181"], "normalized"],
  [["Lin, G · G. Lin", "grace@", "—"], ["Grace Lin", "grace@lazarco.com", "+1 415 555 0150"], "deduped"],
];

class MzDataClean extends HTMLElement {
  connectedCallback() {
    this.classList.add("dclean");

    const rawRows = RECORDS.map(
      ([raw]) =>
        `<tr><td>${raw[0]}</td><td>${raw[1]}</td><td>${raw[2]}</td></tr>`
    ).join("");

    const cleanRows = RECORDS.map(
      ([, clean, note]) =>
        `<tr><td>${clean[0]}</td><td>${clean[1]}</td><td>${clean[2]}</td><td class="dclean-note-cell"><span class="dclean-note">${note}</span></td></tr>`
    ).join("");

    this.innerHTML = `
      <div class="dclean-head">
        <h2 class="dclean-title">We clean your data first.</h2>
        <p class="lead dclean-sub">AI breaks on the back office it inherits — duplicate records, missing fields, dates that don't agree. Marzy reconciles every record before a model ever touches it.</p>
      </div>
      <div class="dclean-flow">
        <div class="dclean-card table-card">
          <table class="table dclean-table is-raw">
            <tbody>${rawRows}</tbody>
          </table>
        </div>
        <div class="dclean-pipes" aria-hidden="true"></div>
        <div class="dclean-card table-card">
          <table class="table dclean-table is-clean">
            <tbody>${cleanRows}</tbody>
          </table>
        </div>
      </div>`;

    // Dense Volt pipe field spanning edge to edge between the two tables.
    this.querySelector(".dclean-pipes").appendChild(
      buildPipes({
        routes: [[[-20, 120], [92, 120]]],
        width: 72,
        height: 240,
        n: 17,
        spacing: 13,
        radius: 1,
        fade: false,
        preserve: "none",
      })
    );
  }
}
customElements.define("mz-data-clean", MzDataClean);

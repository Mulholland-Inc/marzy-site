// <mz-data-clean></mz-data-clean>, marketing section positioning Marzy as the
// back-office data cleaner. A real before/after data table: a raw records
// table and an AI-ready records table, bridged edge to edge by a dense
// animated Volt pipe field. Raw rows read muted; cleaned rows land in ink
// with a note tag describing the fix.
import { buildPipes } from "./pipe.js";

// [ [rawName, rawEmail, rawPhone], [cleanName, cleanEmail, cleanPhone], note ]
const RECORDS = [
  [["jon smith · J. Smith", "jon@lazarco", "—"], ["Jonathan Smith", "jon@lazarco.com", "+1 415 555 0142"], "merged"],
  [["ACME inc", "billing@acme", "missing"], ["Acme, Inc.", "billing@acme.com", "+1 512 555 0199"], "enriched"],
  [["maria GARCIA", "m.garcia@", "(415)5550181"], ["María García", "m.garcia@lazarco.com", "+1 415 555 0181"], "normalized"],
  [["Lin, G · G. Lin", "grace@", "—"], ["Grace Lin", "grace@lazarco.com", "+1 415 555 0150"], "deduped"],
  [["o'BRIEN, sean", "sean.obrien", "555.0173"], ["Sean O'Brien", "sean.obrien@lazarco.com", "+1 415 555 0173"], "normalized"],
  [["NORTHWIND dental", "ar@northwind", "missing"], ["Northwind Dental", "ar@northwind.com", "+1 206 555 0120"], "enriched"],
  [["k. asante / Kwame A.", "kwame@", "+14155550190"], ["Kwame Asante", "kwame@lazarco.com", "+1 415 555 0190"], "merged"],
  [["priya  nair", "priya@lazarco .com", "—"], ["Priya Nair", "priya@lazarco.com", "+1 415 555 0166"], "enriched"],
  [["TOM whitfield", "tom@", "415 555 0144"], ["Tom Whitfield", "tom@lazarco.com", "+1 415 555 0144"], "normalized"],
  [["Dupe: Russo S", "sofia@lazarco", "—"], ["Sofia Russo", "sofia@lazarco.com", "+1 415 555 0177"], "deduped"],
];

class MzDataClean extends HTMLElement {
  connectedCallback() {
    this.classList.add("dclean");

    const rawRows = RECORDS.map(
      ([raw]) => `<tr><td>${raw[0]}</td><td>${raw[1]}</td><td>${raw[2]}</td></tr>`
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
        n: 25,
        spacing: 10,
        radius: 1,
        fade: false,
        preserve: "none",
      })
    );
  }
}
customElements.define("mz-data-clean", MzDataClean);

// <mz-data-clean></mz-data-clean>, marketing section positioning Marzy as the
// back-office data cleaner. Left: a raw spreadsheet grid (cells with lines),
// messy and scattered. Right: the same records organized into neat rows. A
// dense Volt pipe field bridges them edge to edge. The pipe SVG is sized to
// the grid's exact pixel height in JS, so it never distorts, thickens, or
// clips.
import { buildPipes } from "./pipe.js";

// [ [rawName, rawEmail, rawPhone], [cleanName, cleanEmail, cleanPhone], note ]
const RECORDS = [
  [["jon smith · J. Smith", "jon@lazarco", "—"], ["Jonathan Smith", "jon@lazarco.com", "+1 415 555 0142"], "merged"],
  [["ACME inc", "billing@acme", "missing"], ["Acme, Inc.", "billing@acme.com", "+1 512 555 0199"], "enriched"],
  [["maria GARCIA", "m.garcia@", "(415)5550181"], ["María García", "maria@lazarco.com", "+1 415 555 0181"], "normalized"],
  [["Lin, G · G. Lin", "grace@", "—"], ["Grace Lin", "grace@lazarco.com", "+1 415 555 0150"], "deduped"],
  [["o'BRIEN, sean", "sean.obrien", "555.0173"], ["Sean O'Brien", "sean@lazarco.com", "+1 415 555 0173"], "normalized"],
  [["NORTHWIND dental", "ar@northwind", "missing"], ["Northwind Dental", "ar@northwind.com", "+1 206 555 0120"], "enriched"],
  [["k. asante / Kwame A.", "kwame@", "+14155550190"], ["Kwame Asante", "kwame@lazarco.com", "+1 415 555 0190"], "merged"],
  [["TOM whitfield", "tom@", "415 555 0144"], ["Tom Whitfield", "tom@lazarco.com", "+1 415 555 0144"], "normalized"],
];

const PIPE_W = 72;

class MzDataClean extends HTMLElement {
  connectedCallback() {
    this.classList.add("dclean");

    const gridRows = RECORDS.map(
      ([raw]) => `<tr><td>${raw[0]}</td><td>${raw[1]}</td><td>${raw[2]}</td></tr>`
    ).join("");

    const orgRows = RECORDS.map(
      ([, c, note]) =>
        `<tr><td><div class="dclean-row"><span class="dclean-rn">${c[0]}</span><span class="dclean-rm">${c[1]}</span><span class="dclean-rm">${c[2]}</span><span class="dclean-note">${note}</span></div></td></tr>`
    ).join("");

    this.innerHTML = `
      <div class="dclean-head">
        <h2 class="dclean-title">We clean your data first.</h2>
        <p class="lead dclean-sub">AI breaks on the back office it inherits — duplicate records, missing fields, dates that don't agree. Marzy reconciles every record into clean, consistent rows before a model ever touches it.</p>
      </div>
      <div class="dclean-flow">
        <table class="dclean-grid-table">
          <tbody>${gridRows}</tbody>
        </table>
        <div class="dclean-pipes" aria-hidden="true"></div>
        <table class="dclean-rows-table">
          <tbody>${orgRows}</tbody>
        </table>
      </div>`;

    const grid = this.querySelector(".dclean-grid-table");
    const pipes = this.querySelector(".dclean-pipes");

    // Build the pipe field at the grid's exact measured pixel height so the
    // viewBox is 1:1 with the element — no scaling, no distortion, no clip.
    const SPACING = 10;
    const mql = window.matchMedia("(max-width: 900px)");
    // Build the pipe field at exact measured px (1:1 viewBox) so it never
    // distorts. Desktop: horizontal pipes flowing left→right between the two
    // side-by-side tables. Mobile (stacked): a band of vertical pipes flowing
    // top→bottom between them.
    const draw = () => {
      if (mql.matches) {
        const w = Math.round(pipes.getBoundingClientRect().width);
        const h = Math.round(pipes.getBoundingClientRect().height);
        if (!w || !h) return;
        pipes.replaceChildren(
          buildPipes({
            routes: [[[w / 2, -12], [w / 2, h + 12]]],
            width: w,
            height: h,
            n: Math.ceil(w / SPACING) + 3,
            spacing: SPACING,
            radius: 1,
            fade: false,
            preserve: "none",
          })
        );
        return;
      }
      const h = Math.round(grid.getBoundingClientRect().height);
      if (!h) return;
      pipes.replaceChildren(
        buildPipes({
          routes: [[[-12, h / 2], [PIPE_W + 12, h / 2]]],
          width: PIPE_W,
          height: h,
          // overfill so the bundle runs past the edges (cropped), leaving no
          // white gap at the ends of the field
          n: Math.ceil(h / SPACING) + 3,
          spacing: SPACING,
          radius: 1,
          fade: false,
          preserve: "none",
        })
      );
    };

    requestAnimationFrame(draw);
    if ("ResizeObserver" in window) {
      this._ro = new ResizeObserver(draw);
      this._ro.observe(this);
    }
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
  }
}
customElements.define("mz-data-clean", MzDataClean);

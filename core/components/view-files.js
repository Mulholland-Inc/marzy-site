// <mz-view-files></mz-view-files>, a document-library perspective: each object as
// a file tile (type, name, size, owner). Files are derived from the record's team
// (Finance → spreadsheet, Legal → contract, …). Renders from setData.
import { RECORDS, byId, emitSelect, initials } from "./data.js";
import { icon } from "./icons.js";

// [kind label, icon name, extension] per team tag
const KIND = {
  Finance: ["Spreadsheet", "table", "xlsx"],
  Payroll: ["Spreadsheet", "table", "xlsx"],
  Legal: ["Contract", "file", "pdf"],
  Ops: ["Document", "file", "pdf"],
  People: ["Document", "file", "pdf"],
  Eng: ["Notes", "file", "md"],
  Clinic: ["Document", "file", "pdf"],
};
const fileName = (title, ext) =>
  title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "") + "." + ext;
const sizeFor = (id) => {
  const kb = 48 + ((id * 137) % 940);
  return kb > 999 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB";
};

class MzViewFiles extends HTMLElement {
  connectedCallback() {
    this.classList.add("view");
    this.addEventListener("click", (e) => {
      const f = e.target.closest(".file-item[data-id]");
      if (f) emitSelect(this, byId(f.dataset.id));
    });
    this.render();
  }
  setData(records) {
    this._records = records;
    this.render();
  }
  render() {
    const recs = this._records || RECORDS;
    if (!recs.length) {
      this.innerHTML = `<mz-empty heading="Nothing here">No items match the current filters.</mz-empty>`;
      return;
    }
    this.innerHTML = `<div class="files">${recs
      .map((r) => {
        const [, ic, ext] = KIND[r.tag] || ["Document", "file", "pdf"];
        const name = fileName(r.title, ext);
        return `<button type="button" class="file-item" data-id="${r.id}">
          <span class="file-thumb">${icon(ic)}<span class="file-ext">${ext}</span></span>
          <span class="file-foot">
            <span class="file-meta">
              <span class="file-name" title="${name}">${name}</span>
              <span class="file-sub">${sizeFor(r.id)} · ${r.due}</span>
            </span>
            <span class="who-av" title="${r.assignee}">${initials(r.assignee)}</span>
          </span>
        </button>`;
      })
      .join("")}</div>`;
  }
}
customElements.define("mz-view-files", MzViewFiles);

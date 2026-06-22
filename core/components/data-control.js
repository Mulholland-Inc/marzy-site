// <mz-data-control></mz-data-control>, marketing section on data access: copy
// on the left, an "ask your data" query panel on the right showing an operator
// getting a plain-language answer without SQL or exports.
import { SPARK } from "./spark.js";
import { ROUTES } from "./site-config.js";

const SEARCH =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>';

class MzDataControl extends HTMLElement {
  connectedCallback() {
    this.classList.add("datactrl");
    this.innerHTML = `
      <div class="datactrl-copy">
        <h2 class="datactrl-title">Your data, instantly queryable</h2>
        <p class="lead">Operators and clients get answers in plain language, no SQL, no CSV exports, no waiting on a report. Everything Marzy touches stays structured and searchable, ready the moment someone asks.</p>
        <div class="actions"><a class="btn btn-primary" href="${ROUTES.product}">Explore your data</a></div>
      </div>
      <div class="datactrl-panel dq">
        <div class="dq-bar"><span class="dq-icon">${SEARCH}</span><span class="dq-q">Which invoices are overdue this month?</span></div>
        <div class="dq-answer">
          <span class="dq-mark">${SPARK}</span>
          <div class="dq-answer-body">
            <div class="dq-result">14 invoices overdue</div>
            <ul class="dq-rows">
              <li><span>Northwind Dental</span><b>$6,240</b></li>
              <li><span>Lazarco Inc.</span><b>$4,180</b></li>
              <li><span>Meridian Health</span><b>$3,900</b></li>
            </ul>
          </div>
        </div>
      </div>`;
  }
}
customElements.define("mz-data-control", MzDataControl);

// <mz-spark>, the Marzy mark. Inherits color via currentColor; size is set
// by context (.logo .spark, .orch-core .spark, etc.). SPARK is exported so
// other components can inline the same glyph.
export const SPARK =
  '<svg viewBox="0 0 108.19 84.17" fill="currentColor" aria-hidden="true" style="width:100%;height:auto;display:block"><path d="M96.06,76.41l-17.82-17.82c-4.09-4.09-1.19-11.08,4.59-11.08h25.36v-10.82h-25.36c-5.78,0-8.68-6.99-4.59-11.08l17.93-17.93L88.52.02l-22.87,22.87c-6.38,6.38-16.72,6.38-23.1,0L19.65,0l-7.65,7.65,17.96,17.96c4.09,4.09,1.19,11.08-4.59,11.08H0v10.82h25.36c5.78,0,8.68,6.99,4.59,11.08l-17.94,17.94,7.65,7.65,22.87-22.87c6.38-6.38,16.72-6.38,23.1,0l22.76,22.76,7.65-7.65Z"/></svg>';

class MzSpark extends HTMLElement {
  connectedCallback() {
    this.classList.add("spark");
    this.innerHTML = SPARK;
  }
}
customElements.define("mz-spark", MzSpark);

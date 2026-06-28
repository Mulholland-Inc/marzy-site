// <mz-embed-image></mz-embed-image>, a display-only image card for embedding in
// Marzy's replies. Self-contained: the "image" is an on-brand SVG area chart
// (Volt palette), so there's no external asset to load. No inputs.
import { SPARK } from "./spark.js";

// A 6-point area chart — reads as a generated cash-flow visual.
const CHART = `
  <svg class="embed-chart" viewBox="0 0 320 160" role="img" aria-label="Cash flow, last 6 months">
    <defs>
      <linearGradient id="mz-embed-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--color-volt)" stop-opacity="0.18" />
        <stop offset="100%" stop-color="var(--color-volt)" stop-opacity="0" />
      </linearGradient>
    </defs>
    <line x1="16" y1="130" x2="304" y2="130" stroke="var(--color-line)" stroke-width="1" />
    <path d="M16 100 L74 84 L131 92 L189 60 L246 70 L304 36 L304 130 L16 130 Z" fill="url(#mz-embed-area)" />
    <path d="M16 100 L74 84 L131 92 L189 60 L246 70 L304 36" fill="none"
      stroke="var(--color-volt)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="304" cy="36" r="3.5" fill="var(--color-surface)" stroke="var(--color-volt)" stroke-width="2" />
  </svg>`;

class MzEmbedImage extends HTMLElement {
  connectedCallback() {
    this.classList.add("embed", "embed-image");
    this.innerHTML = `
      <div class="embed-head"><span class="embed-mark">${SPARK}</span><span class="embed-title">Cash flow</span><span class="embed-meta">+18% MoM</span></div>
      <div class="embed-figure">${CHART}</div>`;
  }
}
customElements.define("mz-embed-image", MzEmbedImage);

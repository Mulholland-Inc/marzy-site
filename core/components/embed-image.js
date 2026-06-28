// <mz-embed-image></mz-embed-image>, an image-attachment card for Marzy's
// replies — styled like a tile in the files view, with an image preview filling
// the thumbnail. Self-contained: the preview is an on-brand abstract SVG, so
// there's no external asset to load. No inputs.

// An abstract on-brand "image" (Volt + neutrals) that fills the thumbnail.
const PREVIEW = `
  <svg class="embed-file-img" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Image preview">
    <defs>
      <linearGradient id="mz-img-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#eef1f6" />
        <stop offset="1" stop-color="#dfe6ff" />
      </linearGradient>
    </defs>
    <rect width="320" height="240" fill="url(#mz-img-bg)" />
    <circle cx="92" cy="96" r="74" fill="#1b43ff" opacity="0.14" />
    <circle cx="226" cy="156" r="96" fill="#1b43ff" opacity="0.20" />
    <circle cx="168" cy="64" r="42" fill="#1b43ff" opacity="0.30" />
  </svg>`;

class MzEmbedImage extends HTMLElement {
  connectedCallback() {
    this.classList.add("file-item", "embed-file");
    this.innerHTML = `
      <span class="file-thumb embed-file-thumb">${PREVIEW}</span>
      <span class="file-foot">
        <span class="file-meta">
          <span class="file-name">q2-overview.png</span>
          <span class="file-sub">PNG · 1.2 MB</span>
        </span>
      </span>`;
  }
}
customElements.define("mz-embed-image", MzEmbedImage);

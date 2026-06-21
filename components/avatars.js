// <mz-avatars names="A B,C D,…" max="4"></mz-avatars>
// An overlapping stack of initial avatars with a "+N" overflow chip.
class MzAvatars extends HTMLElement {
  connectedCallback() {
    this.classList.add("avatars");
    const names = (this.getAttribute("names") ||
      "Amara Okonkwo,Diego Marín,Priya Nair,Tom Whitfield,Lena Hofer,Marcus Bell")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const max = parseInt(this.getAttribute("max") || "4", 10);
    const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const shown = names.slice(0, max);
    const extra = names.length - shown.length;
    let html = shown.map((n) => `<span class="av" title="${n}">${initials(n)}</span>`).join("");
    if (extra > 0) html += `<span class="av av-more">+${extra}</span>`;
    this.innerHTML = html;
  }
}
customElements.define("mz-avatars", MzAvatars);

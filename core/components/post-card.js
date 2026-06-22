// <mz-post-card href="…" date="…" title="…" [featured] [cta="…"]>excerpt…</mz-post-card>
// A blog/archive block: a hover card with a meta line, linked title, excerpt,
// and a read link. `featured` makes it a larger (h2) lead block. Drop several
// into a <mz-grid> for an archive, or use one standalone as the featured post.
class MzPostCard extends HTMLElement {
  connectedCallback() {
    const href = this.getAttribute("href") || "#";
    const date = this.getAttribute("date") || "";
    const title = this.getAttribute("title") || "";
    const featured = this.hasAttribute("featured");
    const cta = this.getAttribute("cta") || (featured ? "Read the post" : "Read");
    const excerpt = this.innerHTML.trim();
    const H = featured ? "h2" : "h3";
    this.classList.add("card", "card-hover");
    this.innerHTML = `<div class="stack stack-${featured ? "4" : "3"}">
      ${date ? `<span class="muted">${date}</span>` : ""}
      <${H}><a href="${href}">${title}</a></${H}>
      ${excerpt ? `<p>${excerpt}</p>` : ""}
      <a class="link" href="${href}">${cta}</a>
    </div>`;
  }
}
customElements.define("mz-post-card", MzPostCard);

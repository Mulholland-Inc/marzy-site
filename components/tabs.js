// <mz-tabs>
//   <mz-tab-panel label="Overview">…</mz-tab-panel>
//   <mz-tab-panel label="Activity">…</mz-tab-panel>
// </mz-tabs>
class MzTabs extends HTMLElement {
  connectedCallback() {
    const panels = Array.from(this.querySelectorAll(":scope > mz-tab-panel"));
    const list = document.createElement("div");
    list.className = "tabs-list";
    list.setAttribute("role", "tablist");
    list.innerHTML = panels
      .map((p, i) => `<button class="tab${i === 0 ? " is-active" : ""}" role="tab" type="button" data-i="${i}">${p.getAttribute("label") || ""}</button>`)
      .join("");
    const wrap = document.createElement("div");
    wrap.className = "tab-panels";
    panels.forEach((p, i) => { p.hidden = i !== 0; wrap.appendChild(p); });
    this.append(list, wrap);
    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab");
      if (!btn) return;
      const i = Number(btn.dataset.i);
      list.querySelectorAll(".tab").forEach((b, bi) => b.classList.toggle("is-active", bi === i));
      panels.forEach((p, pi) => (p.hidden = pi !== i));
    });
  }
}
class MzTabPanel extends HTMLElement {}
customElements.define("mz-tabs", MzTabs);
customElements.define("mz-tab-panel", MzTabPanel);

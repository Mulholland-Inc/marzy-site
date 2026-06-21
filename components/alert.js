// <mz-alert variant="info|success|warning|danger"><b>Title</b><p>Body</p></mz-alert>
const A_ICON = {
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  success: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.4 2.4L15.5 9.5"/></svg>',
  warning: '<svg viewBox="0 0 24 24"><path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/></svg>',
  danger: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
};
class MzAlert extends HTMLElement {
  connectedCallback() {
    const v = this.getAttribute("variant") || "info";
    this.classList.add("alert", `alert-${v}`);
    this.innerHTML = `${A_ICON[v] || A_ICON.info}<div>${this.innerHTML}</div>`;
  }
}
customElements.define("mz-alert", MzAlert);

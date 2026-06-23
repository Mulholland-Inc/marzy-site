// <mz-workspace></mz-workspace>, a Slack-style workspace switcher for the top of
// the app sidebar: shows the current workspace + user, and opens a dropdown to
// switch workspaces.
const CHEVRON = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>';
const ADD = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';
const SIGNOUT = '<svg viewBox="0 0 24 24"><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3"/><path d="M10 8l-4 4 4 4M6 12h10"/></svg>';

const WORKSPACES = [
  ["Mulholland", "mulholland.inc"],
  ["Lazarco", "lazarco.com"],
  ["Northwind Dental", "northwind.com"],
];
const USER = "Houdini";

class MzWorkspace extends HTMLElement {
  connectedCallback() {
    this.classList.add("ws");
    this._i = 0;
    this.render();
    this._onDoc = (e) => {
      if (!this.contains(e.target)) this.close();
    };
    this._onKey = (e) => {
      if (e.key === "Escape") this.close();
    };
    document.addEventListener("click", this._onDoc);
    document.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onDoc);
    document.removeEventListener("keydown", this._onKey);
  }

  render() {
    const [name] = WORKSPACES[this._i];
    this.innerHTML = `
      <button type="button" class="ws-btn" aria-haspopup="true" aria-expanded="false">
        <span class="ws-av">${name.charAt(0)}</span>
        <span class="ws-meta"><b>${name}</b><span>${USER}</span></span>
        <span class="ws-caret" aria-hidden="true">${CHEVRON}</span>
      </button>
      <div class="ws-menu" hidden role="menu">
        <div class="ws-menu-head">Workspaces</div>
        ${WORKSPACES.map(
          ([n, s], i) =>
            `<button type="button" class="ws-item${i === this._i ? " is-active" : ""}" data-i="${i}" role="menuitemradio" aria-checked="${i === this._i}">
              <span class="ws-av">${n.charAt(0)}</span>
              <span class="ws-item-meta"><b>${n}</b><span>${s}</span></span>
              ${i === this._i ? `<span class="ws-check" aria-hidden="true">${CHECK}</span>` : ""}
            </button>`
        ).join("")}
        <div class="ws-menu-div"></div>
        <button type="button" class="ws-action" data-act="add"><span class="ws-action-ico" aria-hidden="true">${ADD}</span>Add a workspace</button>
        <button type="button" class="ws-action" data-act="signout"><span class="ws-action-ico" aria-hidden="true">${SIGNOUT}</span>Sign out</button>
      </div>`;

    this._btn = this.querySelector(".ws-btn");
    this._menu = this.querySelector(".ws-menu");
    this._btn.addEventListener("click", () => this.toggle());
    this._menu.addEventListener("click", (e) => {
      const item = e.target.closest(".ws-item");
      if (item) {
        this._i = Number(item.dataset.i);
        this.render(); // rebuilds with the new active workspace, menu closed
        return;
      }
      if (e.target.closest(".ws-action")) this.close();
    });
  }

  toggle() {
    const open = this._menu.hidden;
    this._menu.hidden = !open;
    this._btn.setAttribute("aria-expanded", String(open));
  }

  close() {
    if (!this._menu) return;
    this._menu.hidden = true;
    this._btn.setAttribute("aria-expanded", "false");
  }
}
customElements.define("mz-workspace", MzWorkspace);

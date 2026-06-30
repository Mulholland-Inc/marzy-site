// <mz-prompt-studio></mz-prompt-studio> — the workspace assistant instructions
// in the context of the EXACT full prompt the model receives. Pick a member to
// inject their role + personal layers; the document shows base · workspace ·
// role · personal, with only the workspace (org) layer editable. The right pane
// chats the draft as the selected member (POST /chat/preview — a dry run, so
// write actions are simulated and nothing is saved or changed). Admin-only.
import { api, whoami } from "../auth.js";
import { icon } from "./icons.js";
import { label } from "../catalog.js";
import "./chats.js"; // the preview reuses the Chat component

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzPromptStudio extends HTMLElement {
  connectedCallback() {
    this.classList.add("studio");
    this._members = [];
    this._account = "";
    this._role = "";
    this.innerHTML = `
      <section class="studio-pane">
        <div class="studio-doc">
          <div class="studio-doc-head">
            <span class="studio-layer-tag studio-head-tag">Workspace instructions</span>
            <span class="studio-pick-select"></span>
          </div>
          <div class="studio-doc-body">
            <div class="studio-layer studio-layer-edit">
              <textarea class="studio-prompt" placeholder="e.g. We're a dental group — be precise about patient data and never guess at clinical details." aria-label="Workspace instructions"></textarea>
            </div>
            <div class="studio-base"></div>
            <div class="studio-extra"></div>
          </div>
          <div class="studio-doc-foot">
            <span class="studio-status t-meta" role="status"></span>
            <button type="button" class="chats-send studio-save" data-act="save" aria-label="Save instructions">${icon("check")}</button>
          </div>
        </div>
      </section>
      <section class="studio-pane studio-preview">
        <mz-chats no-attach greeting="Try your draft" placeholder="Ask the assistant…"></mz-chats>
      </section>`;

    this._prompt = this.querySelector(".studio-prompt");
    this._base = this.querySelector(".studio-base");
    this._extra = this.querySelector(".studio-extra");

    this.addEventListener("click", (e) => {
      if (e.target.closest("[data-act='save']")) this.save();
    });
    this.addEventListener("change", (e) => {
      const sel = e.target.closest("[data-pick]");
      if (sel) this.pick(sel.value);
    });

    // Reuse the Chat component for the preview — same composer, dock animation,
    // and word-by-word streaming — pointed at the draft (/chat/preview) and run
    // as the selected member.
    this.querySelector("mz-chats").responder = async (text, history) => {
      const res = await api("/chat/preview", {
        method: "POST",
        body: { text, org: this._prompt.value, account: this._account, roles: this._role ? [this._role] : [], history },
      });
      return (res && res.reply) || "…";
    };

    this.load();
  }

  async load() {
    const [me, m, prompts] = await Promise.all([
      whoami().catch(() => ({})),
      api("/members").catch(() => ({ members: [] })),
      api("/prompts").catch(() => ({})),
    ]);
    this._prompt.value = prompts.org || "";
    // Members who can be impersonated (have an email); default to the viewer.
    this._members = (m.members || []).filter((x) => x.email);
    this._account = me.account || this._members[0]?.email || "";
    this._role = (me.roles || [])[0] || this._members.find((x) => x.email === this._account)?.role || "";
    this.renderPicker();
    this.compose();
  }

  renderPicker() {
    const opts = this._members
      .map((x) => `<option value="${esc(x.email)}"${x.email === this._account ? " selected" : ""}>${esc(x.name || x.email)}</option>`)
      .join("");
    this.querySelector(".studio-pick-select").innerHTML = `<mz-select size="sm" search data-pick value="${esc(this._account)}" aria-label="Preview as">${opts}</mz-select>`;
  }

  pick(account) {
    this._account = account;
    this._role = this._members.find((x) => x.email === account)?.role || "";
    this.compose();
  }

  // Fetch and render the read-only layers (base + that member's role + personal)
  // around the editable org layer.
  async compose() {
    const q = `?account=${encodeURIComponent(this._account)}&role=${encodeURIComponent(this._role)}`;
    const c = await api("/prompts/compose" + q).catch(() => ({}));
    this._base.innerHTML = c.base ? this.layer("System base", c.base) : "";
    const extra = [];
    if (c.role && c.role.trim()) extra.push(this.layer(`${label(this._role || "role")} role`, c.role));
    if (c.user && c.user.trim()) extra.push(this.layer("Personal context", c.user));
    this._extra.innerHTML = extra.join("");
  }

  layer(tag, body) {
    return `<div class="studio-layer"><span class="studio-layer-tag">${esc(tag)}</span><div class="studio-layer-body">${esc(body)}</div></div>`;
  }

  async save() {
    const status = this.querySelector(".studio-status");
    status.textContent = "Saving…";
    try {
      await api("/prompts/org", { method: "PUT", body: { body: this._prompt.value } });
      status.textContent = "Saved.";
    } catch {
      status.textContent = "Couldn’t save.";
    }
  }

}
customElements.define("mz-prompt-studio", MzPromptStudio);

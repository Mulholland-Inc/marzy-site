// <mz-settings></mz-settings> — the workspace's runtime configuration, backed by
// the shared key/value setting store (GET /settings, PUT /settings/{key}). The
// fields are the keys the tenant seeded — there's no per-client form. Editing is
// admin-only (the backend enforces it too); everyone else sees read-only values.
//
// The workspace name is shown read-only: it's deploy-time branding (the
// WORKSPACE_NAME env, served by /config), not a runtime setting.
import { api, whoami } from "../auth.js";
import { label } from "../catalog.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzSettings extends HTMLElement {
  connectedCallback() {
    this.classList.add("settings");
    this._settings = [];
    this._admin = false;
    this._workspace = "";
    this.innerHTML = `<div class="settings-body"></div>`;
    this._bodyEl = this.querySelector(".settings-body");
    this.load();
  }

  async load() {
    try {
      const [s, me, cfg] = await Promise.all([api("/settings"), whoami(), api("/config").catch(() => ({}))]);
      this._settings = s.settings || [];
      this._admin = (me.roles || []).includes("admin");
      this._workspace = cfg?.name || "";
      this._error = false;
    } catch {
      this._error = true;
    }
    this.render();
  }

  render() {
    if (this._error) {
      this._bodyEl.innerHTML = `<mz-empty heading="Couldn’t load settings">Try refreshing.</mz-empty>`;
      return;
    }
    const ro = !this._admin;
    const wsField = `<mz-field label="Workspace name" hint="Set at deployment." for="s-workspace"></mz-field>`;
    const settingFields = this._settings
      .map(
        (s) =>
          `<div class="field"><label class="field-label" for="set-${esc(s.key)}">${esc(label(s.key))}</label>
            <input class="input" id="set-${esc(s.key)}" data-key="${esc(s.key)}" value="${esc(s.value)}"${ro ? " disabled" : ""} />
          </div>`
      )
      .join("");
    this._bodyEl.innerHTML = `
      <mz-grid cols="2" align="start">${wsField}${settingFields}</mz-grid>
      ${this._settings.length ? "" : `<p class="t-meta settings-empty">No configurable settings for this workspace.</p>`}
      ${ro || !this._settings.length ? "" : `<div class="settings-actions"><button type="button" class="btn btn-primary" data-act="save">Save changes</button><span class="settings-status t-meta" role="status"></span></div>`}`;

    // The workspace name is read-only branding — show it, but never let it be edited.
    const wsInput = this.querySelector("#s-workspace");
    if (wsInput) { wsInput.value = this._workspace; wsInput.disabled = true; }

    const save = this.querySelector('[data-act="save"]');
    if (save) save.addEventListener("click", () => this.save());
  }

  async save() {
    const btn = this.querySelector('[data-act="save"]');
    const status = this.querySelector(".settings-status");
    const inputs = [...this.querySelectorAll("input[data-key]")];
    const changed = inputs.filter((i) => i.value !== (this._settings.find((s) => s.key === i.dataset.key)?.value ?? ""));
    if (!changed.length) { if (status) status.textContent = "Nothing to save."; return; }
    if (btn) btn.disabled = true;
    if (status) status.textContent = "Saving…";
    try {
      await Promise.all(
        changed.map((i) =>
          api(`/settings/${encodeURIComponent(i.dataset.key)}`, { method: "PUT", body: { value: i.value } })
        )
      );
      for (const i of changed) {
        const s = this._settings.find((s) => s.key === i.dataset.key);
        if (s) s.value = i.value;
      }
      if (status) status.textContent = "Saved.";
    } catch {
      if (status) status.textContent = "Couldn’t save.";
    } finally {
      if (btn) btn.disabled = false;
    }
  }
}
customElements.define("mz-settings", MzSettings);

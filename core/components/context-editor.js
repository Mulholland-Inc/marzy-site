// A focused overlay to edit a member's personal assistant context
// (PUT /prompts/user). With no ref it edits the signed-in user's own context;
// an admin passes a ref (the member's account/email) to edit someone else's,
// e.g. from the Users table.
import { api } from "../auth.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function openContextEditor({ ref = "", name = "" } = {}) {
  const data = await api("/prompts" + (ref ? `?user=${encodeURIComponent(ref)}` : "")).catch(() => ({}));
  const whose = name ? `${esc(name)}’s` : "Your";
  const note = ref
    ? `Personal notes the assistant uses when it helps ${esc(name || "this member")}.`
    : "Personal notes the assistant uses when it helps you — your role, preferences, anything it should know. Only you see this.";
  const ov = document.createElement("div");
  ov.className = "ctx-overlay";
  ov.innerHTML = `<div class="ctx-card" role="dialog" aria-modal="true" aria-label="${whose} assistant context">
      <h3>${whose} assistant context</h3>
      <p class="t-meta">${note}</p>
      <textarea class="input ctx-input" rows="6" placeholder="e.g. I'm in finance; default to numbers-first answers and flag anything over $10k.">${esc(data.user || "")}</textarea>
      <div class="ctx-bar"><span class="ctx-status t-meta" role="status"></span><button type="button" class="btn btn-ghost btn-sm" data-ctx="close">Close</button><button type="button" class="btn btn-primary btn-sm" data-ctx="save">Save</button></div>
    </div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener("click", (e) => {
    if (e.target === ov || e.target.closest('[data-ctx="close"]')) return close();
    if (e.target.closest('[data-ctx="save"]')) {
      const status = ov.querySelector(".ctx-status");
      status.textContent = "Saving…";
      api("/prompts/user", { method: "PUT", body: { ref, body: ov.querySelector(".ctx-input").value } })
        .then(close)
        .catch(() => (status.textContent = "Couldn’t save."));
    }
  });
}

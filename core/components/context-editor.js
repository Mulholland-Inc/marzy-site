// A small popover to edit a member's personal assistant context
// (PUT /prompts/user), anchored to the trigger. `ref` is the member's
// account/email; `anchor` is the element it points at (a Users-table button).
import { api } from "../auth.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function openContextEditor({ ref = "", name = "", anchor = null } = {}) {
  const data = await api("/prompts" + (ref ? `?user=${encodeURIComponent(ref)}` : "")).catch(() => ({}));
  const wrap = document.createElement("div");
  wrap.className = "ctx-pop-wrap";
  wrap.innerHTML = `<div class="ctx-pop" role="dialog" aria-label="Assistant context for ${esc(name || "member")}">
      <div class="ctx-pop-head t-meta">${esc(name || "Member")} · assistant context</div>
      <textarea class="input ctx-input" rows="4" placeholder="e.g. In finance — numbers-first, flag anything over $10k.">${esc(data.user || "")}</textarea>
      <div class="ctx-bar"><span class="ctx-status t-meta" role="status"></span><button type="button" class="btn btn-ghost btn-sm" data-ctx="close">Cancel</button><button type="button" class="btn btn-primary btn-sm" data-ctx="save">Save</button></div>
    </div>`;
  document.body.appendChild(wrap);

  // Anchor the popover under the trigger, right-aligned; flip above if it would
  // overflow the viewport bottom, and clamp to the edges.
  const pop = wrap.querySelector(".ctx-pop");
  if (anchor) {
    const r = anchor.getBoundingClientRect();
    const w = pop.offsetWidth || 320;
    const h = pop.offsetHeight || 200;
    const left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8));
    const top = r.bottom + h + 8 > window.innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }

  const close = () => {
    wrap.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
  };
  document.addEventListener("keydown", onKey);
  wrap.addEventListener("mousedown", (e) => {
    if (e.target === wrap) close(); // click outside the card
  });
  wrap.addEventListener("click", (e) => {
    if (e.target.closest('[data-ctx="close"]')) return close();
    if (e.target.closest('[data-ctx="save"]')) {
      const status = wrap.querySelector(".ctx-status");
      status.textContent = "Saving…";
      api("/prompts/user", { method: "PUT", body: { ref, body: wrap.querySelector(".ctx-input").value } })
        .then(close)
        .catch(() => (status.textContent = "Couldn’t save."));
    }
  });
  wrap.querySelector(".ctx-input").focus();
}

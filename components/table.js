// <mz-table></mz-table> — a rich, interactive data table (app environment).
// Search, segmented status filter, sortable columns, row selection, row
// actions, and pagination — all client-side over a sample dataset.

const ICON = {
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
  kebab:
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg>',
};

const STATUS = {
  active: ["Active", "success"],
  pending: ["Pending", "warning"],
  leave: ["On leave", "info"],
  inactive: ["Inactive", "neutral"],
};

const DATA = [
  { id: 1, name: "Amara Okonkwo", email: "amara@lazarco.com", role: "Operations", status: "active", pay: 6400, last: "2026-06-15" },
  { id: 2, name: "Diego Marín", email: "diego@lazarco.com", role: "Warehouse", status: "active", pay: 4200, last: "2026-06-15" },
  { id: 3, name: "Priya Nair", email: "priya@lazarco.com", role: "Finance", status: "pending", pay: 7100, last: "2026-06-01" },
  { id: 4, name: "Tom Whitfield", email: "tom@lazarco.com", role: "Logistics", status: "active", pay: 3900, last: "2026-06-15" },
  { id: 5, name: "Lena Hofer", email: "lena@lazarco.com", role: "Support", status: "leave", pay: 3600, last: "2026-05-15" },
  { id: 6, name: "Marcus Bell", email: "marcus@lazarco.com", role: "Warehouse", status: "active", pay: 4100, last: "2026-06-15" },
  { id: 7, name: "Sofia Russo", email: "sofia@lazarco.com", role: "Operations", status: "pending", pay: 5800, last: "2026-06-01" },
  { id: 8, name: "Kwame Asante", email: "kwame@lazarco.com", role: "Finance", status: "active", pay: 6900, last: "2026-06-15" },
  { id: 9, name: "Hannah Cole", email: "hannah@lazarco.com", role: "Support", status: "inactive", pay: 0, last: "2026-03-15" },
  { id: 10, name: "Yuki Tanaka", email: "yuki@lazarco.com", role: "Logistics", status: "active", pay: 4300, last: "2026-06-15" },
  { id: 11, name: "Omar Haddad", email: "omar@lazarco.com", role: "Warehouse", status: "active", pay: 4000, last: "2026-06-15" },
  { id: 12, name: "Grace Lin", email: "grace@lazarco.com", role: "Operations", status: "leave", pay: 5200, last: "2026-05-15" },
  { id: 13, name: "Noah Bergström", email: "noah@lazarco.com", role: "Finance", status: "pending", pay: 7400, last: "2026-06-01" },
  { id: 14, name: "Ivy Mensah", email: "ivy@lazarco.com", role: "Support", status: "active", pay: 3700, last: "2026-06-15" },
];

const money = (n) => "$" + n.toLocaleString("en-US");
const date = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const initials = (name) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class MzTable extends HTMLElement {
  connectedCallback() {
    this.state = { q: "", status: "all", sortKey: "name", sortDir: "asc", page: 1, perPage: 8, selected: new Set() };
    this.classList.add("table-card");
    this.innerHTML = `
      <div class="table-toolbar">
        <label class="table-search">${ICON.search}<input class="input" type="search" placeholder="Search employees…" aria-label="Search" /></label>
        <div class="seg" role="tablist" data-seg>
          <button data-status="all" class="is-active">All</button>
          <button data-status="active">Active</button>
          <button data-status="pending">Pending</button>
          <button data-status="inactive">Inactive</button>
        </div>
        <div class="table-toolbar-spacer"></div>
        <button class="btn btn-primary" type="button">Add employee</button>
      </div>
      <div class="table-scroll">
        <table class="table">
          <thead>
            <tr>
              <th class="col-check"><input class="checkbox" type="checkbox" data-all aria-label="Select all" /></th>
              <th class="is-sortable" data-sort="name">Employee <span class="sort"></span></th>
              <th>Status</th>
              <th>Role</th>
              <th class="is-sortable" data-sort="pay">Pay <span class="sort"></span></th>
              <th class="is-sortable" data-sort="last">Last paid <span class="sort"></span></th>
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody data-body></tbody>
        </table>
      </div>
      <div class="table-foot">
        <span data-count></span>
        <div class="pager">
          <span data-range></span>
          <div class="pager-btns">
            <button class="btn-icon" data-prev type="button" aria-label="Previous page">${ICON.prev}</button>
            <button class="btn-icon" data-next type="button" aria-label="Next page">${ICON.next}</button>
          </div>
        </div>
      </div>`;

    this.querySelector(".table-search input").addEventListener("input", (e) => {
      this.state.q = e.target.value.toLowerCase();
      this.state.page = 1;
      this.render();
    });
    this.querySelector("[data-seg]").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-status]");
      if (!btn) return;
      this.state.status = btn.dataset.status;
      this.state.page = 1;
      this.querySelectorAll("[data-seg] button").forEach((b) => b.classList.toggle("is-active", b === btn));
      this.render();
    });
    this.querySelectorAll("th.is-sortable").forEach((th) =>
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (this.state.sortKey === key) {
          this.state.sortDir = this.state.sortDir === "asc" ? "desc" : "asc";
        } else {
          this.state.sortKey = key;
          this.state.sortDir = "asc";
        }
        this.render();
      })
    );
    this.querySelector("[data-all]").addEventListener("change", (e) => {
      const ids = this.pageRows().map((r) => r.id);
      if (e.target.checked) ids.forEach((id) => this.state.selected.add(id));
      else ids.forEach((id) => this.state.selected.delete(id));
      this.render();
    });
    this.querySelector("[data-body]").addEventListener("change", (e) => {
      const cb = e.target.closest("input[data-row]");
      if (!cb) return;
      const id = Number(cb.dataset.row);
      if (cb.checked) this.state.selected.add(id);
      else this.state.selected.delete(id);
      this.render();
    });
    this.querySelector("[data-prev]").addEventListener("click", () => {
      if (this.state.page > 1) { this.state.page--; this.render(); }
    });
    this.querySelector("[data-next]").addEventListener("click", () => {
      if (this.state.page < this.pageCount()) { this.state.page++; this.render(); }
    });

    this.render();
  }

  filtered() {
    const { q, status } = this.state;
    return DATA.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (q && !(`${r.name} ${r.email} ${r.role}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }

  sorted() {
    const { sortKey, sortDir } = this.state;
    const dir = sortDir === "asc" ? 1 : -1;
    return this.filtered().sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  pageCount() {
    return Math.max(1, Math.ceil(this.filtered().length / this.state.perPage));
  }

  pageRows() {
    const { page, perPage } = this.state;
    const start = (page - 1) * perPage;
    return this.sorted().slice(start, start + perPage);
  }

  render() {
    const { selected, sortKey, sortDir, perPage } = this.state;
    const total = this.filtered().length;
    if (this.state.page > this.pageCount()) this.state.page = this.pageCount();
    const rows = this.pageRows();

    // sort indicators
    this.querySelectorAll("th.is-sortable").forEach((th) => {
      const active = th.dataset.sort === sortKey;
      th.classList.toggle("is-sorted", active);
      th.querySelector(".sort").textContent = active ? (sortDir === "asc" ? "↑" : "↓") : "";
    });

    // body
    const body = this.querySelector("[data-body]");
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="7" class="table-empty">No employees match your filters.</td></tr>`;
    } else {
      body.innerHTML = rows
        .map((r) => {
          const [label, variant] = STATUS[r.status];
          const sel = selected.has(r.id);
          return `<tr class="${sel ? "is-selected" : ""}">
            <td class="col-check"><input class="checkbox" type="checkbox" data-row="${r.id}" ${sel ? "checked" : ""} aria-label="Select ${esc(r.name)}" /></td>
            <td><div class="cell-user"><span class="avatar" aria-hidden="true">${initials(r.name)}</span><span><b>${esc(r.name)}</b><small>${esc(r.email)}</small></span></div></td>
            <td><span class="badge badge-${variant}">${label}</span></td>
            <td class="cell-muted">${esc(r.role)}</td>
            <td class="cell-num">${r.pay ? money(r.pay) : "—"}</td>
            <td class="cell-muted">${date(r.last)}</td>
            <td><div class="row-actions"><button class="btn btn-outline btn-sm" type="button">View</button><button class="btn-icon" type="button" aria-label="More actions">${ICON.kebab}</button></div></td>
          </tr>`;
        })
        .join("");
    }

    // select-all state
    const all = this.querySelector("[data-all]");
    const pageIds = rows.map((r) => r.id);
    const selCount = pageIds.filter((id) => selected.has(id)).length;
    all.checked = pageIds.length > 0 && selCount === pageIds.length;
    all.indeterminate = selCount > 0 && selCount < pageIds.length;

    // footer
    const start = total ? (this.state.page - 1) * perPage + 1 : 0;
    const end = Math.min(this.state.page * perPage, total);
    this.querySelector("[data-count]").textContent =
      selected.size ? `${selected.size} selected` : `${total} employee${total === 1 ? "" : "s"}`;
    this.querySelector("[data-range]").textContent = `${start}–${end} of ${total}`;
    this.querySelector("[data-prev]").disabled = this.state.page <= 1;
    this.querySelector("[data-next]").disabled = this.state.page >= this.pageCount();
  }
}

customElements.define("mz-table", MzTable);

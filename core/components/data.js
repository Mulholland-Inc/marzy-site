// Shared sample dataset. Every mz-view-* renders a different perspective of
// this same collection of objects, so switching views never changes the data.
export const STATUSES = ["Backlog", "In progress", "Review", "Done"];

export const RECORDS = [
  { id: 1, title: "Reconcile Q2 invoices", status: "Backlog", assignee: "Dana Reyes", priority: "high", tag: "Finance", due: "Jun 28" },
  { id: 2, title: "Onboard new hire", status: "Backlog", assignee: "Marcus Lin", priority: "low", tag: "People", due: "Jul 1" },
  { id: 3, title: "Renew QuickBooks token", status: "Backlog", assignee: "Priya Anand", priority: "medium", tag: "Ops", due: "Jun 24" },
  { id: 4, title: "June payroll run", status: "In progress", assignee: "Dana Reyes", priority: "high", tag: "Payroll", due: "Jun 30" },
  { id: 5, title: "Sikka sync fix", status: "In progress", assignee: "Sam Okafor", priority: "medium", tag: "Eng", due: "Jun 26" },
  { id: 6, title: "Eligibility checks, Tuesday clinic", status: "In progress", assignee: "Sam Okafor", priority: "medium", tag: "Clinic", due: "Jun 26" },
  { id: 7, title: "Pay instructions, batch 14", status: "Review", assignee: "Priya Anand", priority: "high", tag: "Payroll", due: "Jun 25" },
  { id: 8, title: "Q2 board deck", status: "Review", assignee: "Dana Reyes", priority: "medium", tag: "Finance", due: "Jun 27" },
  { id: 9, title: "May payroll filed", status: "Done", assignee: "Dana Reyes", priority: "low", tag: "Payroll", due: "Jun 5" },
  { id: 10, title: "Connect Gusto", status: "Done", assignee: "Marcus Lin", priority: "medium", tag: "Ops", due: "Jun 3" },
  { id: 11, title: "Close March books", status: "Done", assignee: "Priya Anand", priority: "high", tag: "Finance", due: "Jun 2" },
  { id: 12, title: "Draft vendor contract", status: "Backlog", assignee: "Marcus Lin", priority: "low", tag: "Legal", due: "Jul 3" },
];

export const PRIO = { high: "High", medium: "Medium", low: "Low" };

export const initials = (name) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export const byId = (id) => RECORDS.find((r) => String(r.id) === String(id));

// Views dispatch this when an object is opened; mz-collection shows the detail.
export function emitSelect(el, record) {
  el.dispatchEvent(new CustomEvent("mz-select", { detail: record, bubbles: true }));
}

// Small reusable bits views share.
export const prioHTML = (p) =>
  `<span class="prio"><span class="prio-dot prio-${p}"></span>${PRIO[p]}</span>`;
export const whoHTML = (name) =>
  `<span class="who"><span class="who-av">${initials(name)}</span>${name}</span>`;
export const avatarHTML = (name) => `<span class="who-av" title="${name}">${initials(name)}</span>`;

// Icons — every Lucide icon (https://lucide.dev, ISC license), rendered from
// lucide-icons.js's icon-node data so any kebab-case Lucide name just works —
// no per-icon hand-maintenance. One source of truth: components call icon(name).
// Stroke is currentColor; size/stroke-width come from each context's CSS.
import { ICONS } from "./lucide-icons.js";

// Names this app uses that predate Lucide's current naming (or are our own
// backend vocabulary, e.g. the ontology's `icon:` metadata) — mapped onto the
// real Lucide name.
const ALIASES = {
  "align-left": "text-align-start",
  "bar-chart": "chart-no-axes-column",
  chat: "message-square",
  "clipboard-text": "clipboard-list",
  comments: "messages-square",
  envelope: "mail",
  money: "banknote",
};

export function icon(name) {
  const nodes = ICONS[ALIASES[name] || name] || [];
  const svg = nodes
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")}/>`)
    .join("");
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg>`;
}

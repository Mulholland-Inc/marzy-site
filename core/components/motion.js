// Shared animation layer, built on Motion (motion.dev), vendored locally.
// One place for professional curves/springs so components don't hand-roll them.
import { animate, spring, inView, stagger, press, hover } from "../assets/vendor/motion.js";

export { animate, spring, inView, stagger, press, hover };

// Honor the OS "reduce motion" setting everywhere.
export const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// House curves.
export const EASE_OUT = [0.22, 1, 0.36, 1]; // soft, decisive ease-out
export const EASE_IN = [0.4, 0, 1, 1];
export const SPRING = { type: "spring", stiffness: 560, damping: 34 }; // snappy UI spring
export const SPRING_SOFT = { type: "spring", stiffness: 320, damping: 30 };

// Popover / menu / dropdown enter — scale + fade from an edge origin.
// `dir` is the vertical offset sign (-1 grows down from a top anchor).
export function popIn(el, dir = -1) {
  if (reduce) return;
  el.style.transformOrigin = dir < 0 ? "top center" : "bottom center";
  animate(
    el,
    { opacity: [0, 1], scale: [0.96, 1], y: [dir * 6, 0] },
    { duration: 0.18, ease: EASE_OUT },
  );
}

// Popover / menu exit — returns the animation's finished promise so callers
// can flip `hidden` only after it plays out.
export function popOut(el) {
  if (reduce) return Promise.resolve();
  return animate(el, { opacity: [1, 0], scale: [1, 0.97] }, { duration: 0.12, ease: EASE_IN }).finished;
}

// Content enter — fade up. Used when a view's content swaps in.
export function fadeIn(el, y = 8) {
  if (reduce || !el) return;
  animate(el, { opacity: [0, 1], y: [y, 0] }, { duration: 0.24, ease: EASE_OUT });
}

// A quick attention pop (e.g. a checkmark landing).
export function pop(el) {
  if (reduce) return;
  animate(el, { scale: [0.6, 1] }, { ...SPRING, stiffness: 700, damping: 18 });
}

// The tick path — identical to the `.checkbox:checked` CSS background mark.
const CHECK_D = "M20 6 9 17l-5-5";

// Pen-stroke checkmark: overlays a temporary SVG sized to match the box's tick
// and draws the stroke first-point-to-last, then settles onto the static CSS
// check. `.is-drawing` hides the background mark while the stroke plays.
export function drawCheck(box) {
  if (reduce) return;
  const r = box.getBoundingClientRect();
  if (!r.width) return pop(box);
  const size = 11; // matches the `.checkbox:checked` background size
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  Object.assign(svg.style, {
    position: "fixed",
    left: `${r.left + (r.width - size) / 2}px`,
    top: `${r.top + (r.height - size) / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    pointerEvents: "none",
    zIndex: "9999",
  });
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", CHECK_D);
  path.setAttribute("stroke", "white");
  path.setAttribute("stroke-width", "3.5");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);
  document.body.appendChild(svg);
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  box.classList.add("is-drawing");
  animate(path, { strokeDashoffset: [len, 0] }, { duration: 0.3, ease: EASE_OUT }).finished
    .then(() => {
      box.classList.remove("is-drawing");
      svg.remove();
    });
}

// House default: any checkbox that lands checked gets a checkmark animation —
// no per-component wiring. Custom `.checkbox` ticks get the pen-stroke draw;
// native checkboxes (no styled SVG mark) get the quick pop. Override per box
// with `data-check="draw"` or `data-check="pop"`.
let checksWired = false;
export function initCheckmarks() {
  if (checksWired) return;
  checksWired = true;
  document.addEventListener("change", (e) => {
    const box = e.target;
    if (!(box instanceof HTMLInputElement) || box.type !== "checkbox" || !box.checked) return;
    const mode = box.closest("[data-check]")?.dataset.check;
    const draw = mode ? mode === "draw" : box.classList.contains("checkbox");
    if (draw) drawCheck(box);
    else pop(box);
  });
}

// Spring the switch knob between off (0) and on (20px). Explicit keyframes so
// the CSS aria-checked rule doesn't snap it before Motion takes over.
export function flipKnob(btn, on) {
  if (reduce) return;
  const knob = btn.querySelector(".switch-knob");
  if (knob) animate(knob, { x: [on ? 0 : 20, on ? 20 : 0] }, SPRING);
}

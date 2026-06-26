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

// Spring the switch knob between off (0) and on (20px). Explicit keyframes so
// the CSS aria-checked rule doesn't snap it before Motion takes over.
export function flipKnob(btn, on) {
  if (reduce) return;
  const knob = btn.querySelector(".switch-knob");
  if (knob) animate(knob, { x: [on ? 0 : 20, on ? 20 : 0] }, SPRING);
}

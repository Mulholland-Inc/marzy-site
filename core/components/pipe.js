// Shared pipe-bundle renderer. Draws N equally-spaced parallel strokes offset
// perpendicular to a polyline route (so spacing stays constant through bends),
// with rounded corners and animated dash flow. Used by <mz-pipes> and
// <mz-timeline> so both share one "pipes" look.
const dirOf = (a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  return [dx / l, dy / l];
};
const perpOf = (d) => [-d[1], d[0]];

// One offset copy of a route, offset by `d` along the perpendicular, with
// rounded corners of radius `R`.
function offsetRoute(pts, d, R) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const P = pts[i];
    const o = i < pts.length - 1 ? dirOf(pts[i], pts[i + 1]) : null;
    const n = i > 0 ? dirOf(pts[i - 1], pts[i]) : null;
    if (i === 0) {
      const p = perpOf(o);
      out.push(`M${P[0] + p[0] * d} ${P[1] + p[1] * d}`);
    } else if (!o) {
      const p = perpOf(n);
      out.push(`L${P[0] + p[0] * d} ${P[1] + p[1] * d}`);
    } else {
      const pi = perpOf(n), po = perpOf(o);
      out.push(`L${P[0] - n[0] * R + pi[0] * d} ${P[1] - n[1] * R + pi[1] * d}`);
      const ex = P[0] + o[0] * R + po[0] * d, ey = P[1] + o[1] * R + po[1] * d;
      const cross = n[0] * o[1] - n[1] * o[0];
      const sweep = cross > 0 ? 1 : 0;
      const r = Math.max(1, R - (cross > 0 ? 1 : -1) * d);
      out.push(`A${r} ${r} 0 0 ${sweep} ${ex} ${ey}`);
    }
  }
  return out.join(" ");
}

// Build an <svg> with one bundle per route. Inner strokes are Volt, outer
// strokes neutral; each flows via the shared `.mz-pipe` dash animation.
export function buildPipes({ routes, width, height, n = 7, spacing = 9, radius = 20, preserve = "xMidYMid meet", fade = true }) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("preserveAspectRatio", preserve);
  svg.setAttribute("aria-hidden", "true");
  const half = (n - 1) / 2;
  for (const route of routes) {
    for (let i = 0; i < n; i++) {
      const dist = Math.abs(i - half);
      const inner = dist <= 1;
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", offsetRoute(route, (i - half) * spacing, radius));
      p.setAttribute("class", `mz-pipe ${inner ? "mz-pipe-v" : "mz-pipe-n"}`);
      p.style.opacity = fade ? (inner ? 0.95 - dist * 0.15 : 0.4 + (half - dist) * 0.05) : 1;
      p.style.animationDuration = 2.6 + (i % 5) * 0.2 + "s";
      svg.appendChild(p);
    }
  }
  return svg;
}

// Concentric ring of pipes (same strokes/flow as buildPipes) in a square svg.
export function buildRing({ size, n = 7, spacing = 10, pad = 8, fade = true }) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("aria-hidden", "true");
  const cx = size / 2;
  const half = (n - 1) / 2;
  // outermost circle = size/2 - pad; inner ones step inward by `spacing`
  const baseR = size / 2 - pad - (n - 1) * spacing;
  for (let i = 0; i < n; i++) {
    const dist = Math.abs(i - half);
    const inner = dist <= 1;
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", cx);
    c.setAttribute("cy", cx);
    c.setAttribute("r", Math.max(1, baseR + i * spacing));
    c.setAttribute("class", `mz-pipe ${inner ? "mz-pipe-v" : "mz-pipe-n"}`);
    c.style.opacity = fade ? (inner ? 0.95 - dist * 0.15 : 0.4 + (half - dist) * 0.05) : 1;
    c.style.animationDuration = 2.6 + (i % 5) * 0.2 + "s";
    svg.appendChild(c);
  }
  return svg;
}

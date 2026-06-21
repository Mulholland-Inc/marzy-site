// <mz-pipes></mz-pipes>, animated pipes divider (multi-line stroke-dasharray
// flow). Ported from mulholland-site and recolored to the Marzy palette.
let PIPE_ID = 0;
class MzPipes extends HTMLElement {
  connectedCallback() {
    this.classList.add("pipes");
    const id = PIPE_ID++;
    const w = 1200, h = 240, N = 7, S = 9, R = 44, SW = 2.5;
    const styles = getComputedStyle(document.documentElement);
    const innerColor = styles.getPropertyValue("--color-volt").trim() || "#1b43ff";
    const outerColor = styles.getPropertyValue("--color-line-strong").trim() || "#d2d7e0";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pts = [
      [-60, 120], [180, 120], [180, 200], [400, 200],
      [400, 60], [620, 60], [620, 180], [840, 180],
      [840, 50], [1060, 50], [1060, 150], [1280, 150],
    ];
    const dirFrom = (a, b) => {
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.sqrt(dx * dx + dy * dy);
      return [dx / len, dy / len];
    };
    const perp = (d) => [-d[1], d[0]];
    const buildPath = (d) => {
      const parts = [];
      for (let i = 0; i < pts.length; i++) {
        const P = pts[i];
        const dirOut = i < pts.length - 1 ? dirFrom(pts[i], pts[i + 1]) : null;
        const dirIn = i > 0 ? dirFrom(pts[i - 1], pts[i]) : null;
        if (i === 0) {
          const n = perp(dirOut);
          parts.push("M" + (P[0] + n[0] * d) + "," + (P[1] + n[1] * d));
        } else if (!dirOut) {
          const n = perp(dirIn);
          parts.push("L" + (P[0] + n[0] * d) + "," + (P[1] + n[1] * d));
        } else {
          const nIn = perp(dirIn), nOut = perp(dirOut);
          parts.push("L" + (P[0] - dirIn[0] * R + nIn[0] * d) + "," + (P[1] - dirIn[1] * R + nIn[1] * d));
          const arcEndX = P[0] + dirOut[0] * R + nOut[0] * d;
          const arcEndY = P[1] + dirOut[1] * R + nOut[1] * d;
          const cross = dirIn[0] * dirOut[1] - dirIn[1] * dirOut[0];
          const sweep = cross > 0 ? 1 : 0;
          const arcR = Math.max(1, R - (cross > 0 ? 1 : -1) * d);
          parts.push("A" + arcR + "," + arcR + " 0 0 " + sweep + " " + arcEndX + "," + arcEndY);
        }
      }
      return parts.join(" ");
    };

    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");

    const half = (N - 1) / 2;
    let keyframes = "";
    for (let i = 0; i < N; i++) {
      const dist = Math.abs(i - half);
      const isInner = dist <= 1;
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", buildPath((i - half) * S));
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", isInner ? innerColor : outerColor);
      p.setAttribute("stroke-width", SW);
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("opacity", isInner ? 0.95 - dist * 0.15 : 0.4 + (half - dist) * 0.05);
      svg.appendChild(p);

      const len = p.getTotalLength();
      const gapLen = 90 + Math.random() * 120;
      p.style.strokeDasharray = len + " " + gapLen;
      if (!reduce) {
        const name = "pipes-" + id + "-" + i;
        keyframes += "@keyframes " + name + "{from{stroke-dashoffset:0}to{stroke-dashoffset:-" + (len + gapLen) + "}}";
        p.style.animation = name + " " + (5 + Math.random() * 3) + "s linear infinite";
      }
    }
    if (keyframes) {
      const styleTag = document.createElement("style");
      styleTag.textContent = keyframes;
      document.head.appendChild(styleTag);
    }
    this.appendChild(svg);
  }
}
customElements.define("mz-pipes", MzPipes);

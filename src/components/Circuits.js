"use client";

import { animate, svg, stagger } from "animejs";
import { useReveal, prefersReducedMotion } from "@/lib/anim";

/**
 * Decorative circuit-board divider: traces draw themselves in on scroll,
 * then glowing "data packets" travel the paths forever (anime.js
 * createDrawable + createMotionPath).
 */
const PATHS = [
  "M0 120 H240 L290 70 H620 L670 120 H1020 L1070 170 H1440",
  "M0 170 H160 L210 220 H540 L590 170 H940 L990 120 H1440",
  "M0 70 H110 L160 20 H430 L480 70 H820 L870 20 H1180 L1230 70 H1440",
];

// [x, y, accent?] — junction pads sitting on path vertices
const NODES = [
  [240, 120, true],
  [620, 70, false],
  [670, 120, false],
  [1070, 170, true],
  [210, 220, false],
  [590, 170, true],
  [990, 120, false],
  [160, 20, false],
  [480, 70, true],
  [870, 20, false],
  [1230, 70, false],
];

export default function Circuits({ flip = false }) {
  const ref = useReveal(
    (el) => {
      const paths = el.querySelectorAll(".circuit-path");
      const nodes = el.querySelectorAll(".circuit-node");
      const dots = el.querySelectorAll(".circuit-dot");

      if (prefersReducedMotion()) {
        [...paths, ...nodes].forEach((n) => (n.style.opacity = 1));
        return;
      }

      paths.forEach((p) => (p.style.opacity = 1));
      animate(svg.createDrawable(paths), {
        draw: ["0 0", "0 1"],
        duration: 2400,
        delay: stagger(260),
        ease: "inOutQuad",
      });

      animate(nodes, {
        opacity: [0, 1],
        scale: [0, 1],
        duration: 450,
        delay: stagger(55, { start: 900 }),
        ease: "outBack",
      });

      dots.forEach((dot, i) => {
        const path = paths[i % paths.length];
        const { translateX, translateY } = svg.createMotionPath(path);
        animate(dot, {
          opacity: [0, 1],
          duration: 600,
          delay: 2300 + i * 350,
          ease: "outQuad",
        });
        animate(dot, {
          translateX,
          translateY,
          duration: 9000 + i * 2600,
          delay: 2300 + i * 350,
          loop: true,
          ease: "linear",
        });
      });
    },
    { threshold: 0.3 }
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`mx-auto max-w-7xl px-6 py-6 md:px-10 ${
        flip ? "-scale-x-100" : ""
      }`}
    >
      <svg viewBox="0 0 1440 240" fill="none" className="h-auto w-full opacity-80">
        {PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            className="circuit-path"
            stroke="var(--border-bright)"
            strokeWidth="1"
            style={{ opacity: 0 }}
          />
        ))}
        {NODES.map(([x, y, accent], i) => (
          <rect
            key={i}
            className="circuit-node"
            x={x - 3}
            y={y - 3}
            width="6"
            height="6"
            rx="1"
            fill="var(--surface-raised)"
            stroke={accent ? "var(--accent)" : "var(--text-faint)"}
            style={{ opacity: 0 }}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i} className="circuit-dot" style={{ opacity: 0 }}>
            <circle r="7" fill="var(--accent)" opacity="0.18" />
            <circle r="2.5" fill="var(--accent)" />
          </g>
        ))}
      </svg>
    </div>
  );
}

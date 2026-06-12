"use client";

import { useEffect, useRef } from "react";
import site from "@/data/site.json";
import { prefersReducedMotion, isFinePointer } from "@/lib/anim";

/**
 * Circular glassmorphism lens that follows the cursor and magnifies
 * whatever sits beneath it. Chromium gets true refraction via an SVG
 * displacement map in backdrop-filter; other engines fall back to a
 * frosted-glass circle. Config: site.json → theme.lens.
 */
function makeDisplacementMap(size) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  const c = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - c) / c;
      const dy = (y - c) / c;
      const r = Math.min(1, Math.hypot(dx, dy));
      // convex lens: mild zoom at center, stronger refraction at the rim
      const w = 0.75 + 0.45 * r * r;
      const i = (y * size + x) * 4;
      img.data[i] = 128 - dx * 127 * w;
      img.data[i + 1] = 128 - dy * 127 * w;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

export default function CursorLens() {
  const wrapRef = useRef(null);
  const glassRef = useRef(null);
  const feImageRef = useRef(null);
  const feDispRef = useRef(null);

  useEffect(() => {
    const cfg = site.theme.lens || {};
    if (cfg.enabled === false) return;
    if (!isFinePointer() || prefersReducedMotion()) return;

    const wrap = wrapRef.current;
    const glass = glassRef.current;
    const size = cfg.size || 140;
    const strength = cfg.strength ?? 1;
    wrap.style.width = `${size}px`;
    wrap.style.height = `${size}px`;

    // SVG filters in backdrop-filter only render in Chromium engines
    const chromium = typeof window !== "undefined" && "chrome" in window;
    if (chromium && feImageRef.current) {
      feImageRef.current.setAttribute("href", makeDisplacementMap(256));
      feDispRef.current.setAttribute("scale", String(46 * strength));
      glass.style.backdropFilter =
        "url(#cursor-lens-filter) saturate(1.35) brightness(1.06)";
    } else {
      glass.style.backdropFilter = "blur(2.5px) saturate(1.45) brightness(1.08)";
      glass.style.webkitBackdropFilter =
        "blur(2.5px) saturate(1.45) brightness(1.08)";
    }

    // pops like a bubble over anything clickable, re-inflates on leave
    const INTERACTIVE =
      "a, button, [role='button'], input, textarea, select, summary";

    let mx = -1000;
    let my = -1000;
    let x = mx;
    let y = my;
    let shown = false;
    let popped = false;
    let raf;

    const apply = () => {
      if (shown && !popped) {
        glass.style.transitionDuration = "300ms";
        glass.style.opacity = "1";
        glass.style.transform = "scale(1)";
      } else if (popped) {
        // burst: briefly over-inflate while fading out
        glass.style.transitionDuration = "180ms";
        glass.style.opacity = "0";
        glass.style.transform = "scale(1.35)";
      } else {
        glass.style.transitionDuration = "300ms";
        glass.style.opacity = "0";
        glass.style.transform = "scale(0.6)";
      }
    };

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        x = mx;
        y = my;
        shown = true;
        apply();
      }
    };

    const onOver = (e) => {
      const hit = e.target.closest?.(INTERACTIVE);
      if (!!hit !== popped) {
        popped = !!hit;
        // when re-inflating, restart from the small state so it grows back
        // instead of shrinking down from the burst size
        if (!popped) {
          glass.style.transitionDuration = "0ms";
          glass.style.transform = "scale(0.6)";
          void glass.offsetWidth; // flush so the next transition runs
        }
        apply();
      }
    };

    const onLeave = (e) => {
      if (!e.relatedTarget) {
        shown = false;
        apply();
      }
    };

    const loop = () => {
      x += (mx - x) * 0.22;
      y += (my - y) * 0.22;
      wrap.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <svg className="pointer-events-none fixed h-0 w-0" aria-hidden="true">
        <filter
          id="cursor-lens-filter"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            ref={feImageRef}
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            ref={feDispRef}
            in="SourceGraphic"
            in2="map"
            scale="46"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div
        ref={wrapRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[75]"
      >
        <div
          ref={glassRef}
          className="h-full w-full rounded-full transition-[opacity,transform] duration-300 ease-out"
          style={{
            opacity: 0,
            transform: "scale(0.6)",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -8px 24px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.35)",
            background:
              "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.08), transparent 46%)",
          }}
        />
      </div>
    </>
  );
}

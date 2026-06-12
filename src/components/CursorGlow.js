"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, isFinePointer } from "@/lib/anim";

export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    const el = ref.current;
    let mx = -1000;
    let my = -1000;
    let x = mx;
    let y = my;
    let visible = false;
    let raf;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
    };

    const loop = () => {
      x += (mx - x) * 0.08;
      y += (my - y) * 0.08;
      el.style.transform = `translate(${x - 250}px, ${y - 250}px)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[5] h-[500px] w-[500px] rounded-full opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(circle, var(--accent-faint) 0%, transparent 65%)",
        mixBlendMode: "screen",
      }}
    />
  );
}

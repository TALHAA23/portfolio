"use client";

import { useRef } from "react";
import { animate, utils, createSpring } from "animejs";
import { isFinePointer, prefersReducedMotion } from "@/lib/anim";

/** Wraps children in a magnetic field: follows the cursor, springs back on leave. */
export default function Magnetic({ children, strength = 0.3, className = "" }) {
  const ref = useRef(null);

  const onMove = (e) => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    utils.set(el, {
      translateX: (e.clientX - (r.left + r.width / 2)) * strength,
      translateY: (e.clientY - (r.top + r.height / 2)) * strength,
    });
  };

  const onLeave = () => {
    animate(ref.current, {
      translateX: 0,
      translateY: 0,
      ease: createSpring({ stiffness: 120, damping: 12 }),
    });
  };

  return (
    <span
      ref={ref}
      className={`inline-block ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </span>
  );
}

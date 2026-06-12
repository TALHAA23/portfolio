"use client";

import { animate, stagger } from "animejs";
import SplitText from "@/components/SplitText";
import { useReveal, prefersReducedMotion } from "@/lib/anim";

export default function SectionHeading({ index, label, title }) {
  const ref = useReveal((el) => {
    if (prefersReducedMotion()) {
      el.querySelectorAll(".sh-fade, .split-char").forEach((n) => {
        n.style.opacity = 1;
        n.style.transform = "none";
      });
      return;
    }
    animate(el.querySelectorAll(".sh-fade"), {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 700,
      ease: "outExpo",
    });
    animate(el.querySelectorAll(".split-char"), {
      translateY: ["120%", "0%"],
      duration: 1000,
      delay: stagger(24),
      ease: "outExpo",
    });
  });

  return (
    <div ref={ref} className="mb-14 md:mb-20">
      <div
        className="sh-fade flex items-center gap-4 font-mono text-[11px] tracking-[0.3em] text-accent"
        style={{ opacity: 0 }}
      >
        <span className="text-faint">{index}</span>
        <span>{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <h2 className="mt-5 font-display text-[clamp(2.2rem,6vw,4.2rem)] font-bold leading-[1.02] tracking-tight">
        <SplitText text={title} />
      </h2>
    </div>
  );
}

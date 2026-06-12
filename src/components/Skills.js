"use client";

import { useRef } from "react";
import { animate, stagger } from "animejs";
import site from "@/data/site.json";
import SectionHeading from "@/components/SectionHeading";
import { useReveal, prefersReducedMotion } from "@/lib/anim";

function SkillGroup({ group, idx }) {
  const chipsRef = useRef(null);

  const ripple = (i) => {
    if (prefersReducedMotion()) return;
    animate(chipsRef.current.querySelectorAll(".skill-chip"), {
      translateY: [
        { to: -6, duration: 200, ease: "outQuad" },
        { to: 0, duration: 550, ease: "outElastic(1, .6)" },
      ],
      delay: stagger(26, { from: i }),
    });
  };

  return (
    <div
      className="skill-group border-t border-line py-7"
      style={{ opacity: 0 }}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-mono text-[11px] tracking-[0.3em] text-accent">
          {group.name}
        </h3>
        <span className="font-mono text-[11px] text-faint">
          {String(group.items.length).padStart(2, "0")}
        </span>
      </div>
      <div ref={chipsRef} className="mt-5 flex flex-wrap gap-2.5">
        {group.items.map((item, i) => (
          <span
            key={item}
            onMouseEnter={() => ripple(i)}
            className="skill-chip cursor-default rounded-full border border-line bg-surface/50 px-4 py-1.5 text-sm text-dim transition-colors duration-300 hover:border-accent hover:text-text"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills({ index }) {
  const data = site.skills;

  const ref = useReveal((el) => {
    if (prefersReducedMotion()) {
      el.querySelectorAll(".skill-group").forEach((n) => {
        n.style.opacity = 1;
        n.style.transform = "none";
      });
      return;
    }
    animate(el.querySelectorAll(".skill-group"), {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 900,
      delay: stagger(90),
      ease: "outExpo",
    });
  });

  return (
    <section
      id="skills"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40"
    >
      <SectionHeading index={index} label={data.label} title={data.title} />
      <div ref={ref} className="grid gap-x-14 md:grid-cols-2">
        {data.groups.map((group, i) => (
          <SkillGroup key={group.name} group={group} idx={i} />
        ))}
      </div>
    </section>
  );
}

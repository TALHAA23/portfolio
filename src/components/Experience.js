"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import site from "@/data/site.json";
import SectionHeading from "@/components/SectionHeading";
import { useReveal, prefersReducedMotion } from "@/lib/anim";

export default function Experience({ index }) {
  const data = site.experience;
  const railRef = useRef(null);
  const fillRef = useRef(null);

  const listRef = useReveal((el) => {
    if (prefersReducedMotion()) {
      el.querySelectorAll(".xp-item").forEach((n) => {
        n.style.opacity = 1;
        n.style.transform = "none";
      });
      return;
    }
    animate(el.querySelectorAll(".xp-item"), {
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 1000,
      delay: stagger(140),
      ease: "outExpo",
    });
  });

  // scroll-linked rail fill + node activation
  useEffect(() => {
    const rail = railRef.current;
    const fill = fillRef.current;
    if (!rail || !fill) return;

    const onScroll = () => {
      const rect = rail.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(
        1,
        Math.max(0, (vh * 0.7 - rect.top) / rect.height)
      );
      fill.style.transform = `scaleY(${progress})`;

      rail.parentElement.querySelectorAll(".xp-node").forEach((node) => {
        const top = node.getBoundingClientRect().top;
        node.classList.toggle("xp-node-on", top < vh * 0.7);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      id="experience"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40"
    >
      <SectionHeading index={index} label={data.label} title={data.title} />

      <div ref={listRef} className="relative">
        <div
          ref={railRef}
          className="absolute bottom-0 left-0 top-0 w-px bg-line"
        >
          <div
            ref={fillRef}
            className="h-full w-px origin-top bg-accent"
            style={{ transform: "scaleY(0)" }}
          />
        </div>

        <div className="space-y-16 md:space-y-20">
          {data.items.map((job) => (
            <article
              key={job.company + job.period}
              className="xp-item relative pl-10 md:pl-16"
              style={{ opacity: 0 }}
            >
              <span className="xp-node absolute -left-[3.5px] top-2 h-2 w-2 rounded-full bg-faint transition-all duration-500" />

              <div className="font-mono text-[11px] tracking-[0.25em] text-accent">
                {job.period}
              </div>

              <h3 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
                {job.role}
              </h3>

              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {job.url ? (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dim underline-offset-4 transition-colors hover:text-accent hover:underline"
                  >
                    {job.company} ↗
                  </a>
                ) : (
                  <span className="text-dim">{job.company}</span>
                )}
                <span className="font-mono text-[11px] tracking-widest text-faint">
                  {job.stack.toUpperCase()} · {job.location.toUpperCase()}
                </span>
              </div>

              <ul className="mt-5 max-w-2xl space-y-2.5">
                {job.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-[15px] leading-relaxed text-dim"
                  >
                    <span className="mt-[2px] select-none font-mono text-accent-dim">
                      ▸
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

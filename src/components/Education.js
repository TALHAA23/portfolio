"use client";

import { animate, stagger } from "animejs";
import site from "@/data/site.json";
import SectionHeading from "@/components/SectionHeading";
import { useReveal, prefersReducedMotion } from "@/lib/anim";

export default function Education({ index }) {
  const data = site.education;

  const ref = useReveal((el) => {
    if (prefersReducedMotion()) {
      el.querySelectorAll(".edu-item").forEach((n) => {
        n.style.opacity = 1;
        n.style.transform = "none";
      });
      return;
    }
    animate(el.querySelectorAll(".edu-item"), {
      opacity: [0, 1],
      translateY: [36, 0],
      duration: 900,
      delay: stagger(110),
      ease: "outExpo",
    });
  });

  return (
    <section
      id="education"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40"
    >
      <SectionHeading index={index} label={data.label} title={data.title} />

      <div ref={ref} className="grid gap-16 md:grid-cols-2">
        <div>
          <h3 className="mb-8 font-mono text-[11px] tracking-[0.3em] text-faint">
            EDUCATION
          </h3>
          <div className="space-y-10">
            {data.items.map((item) => (
              <div key={item.degree} className="edu-item" style={{ opacity: 0 }}>
                <div className="font-mono text-[11px] tracking-[0.25em] text-accent">
                  {item.period}
                </div>
                <h4 className="mt-2 font-display text-xl font-semibold">
                  {item.degree}
                </h4>
                <div className="mt-1 text-sm text-dim">{item.school}</div>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-faint">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-8 font-mono text-[11px] tracking-[0.3em] text-faint">
            CERTIFICATIONS
          </h3>
          <div className="space-y-6">
            {data.certifications.map((cert) => (
              <a
                key={cert.name}
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="edu-item group block rounded-xl border border-line bg-surface/50 p-6 transition-colors duration-300 hover:border-accent"
                style={{ opacity: 0 }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-display text-lg font-semibold transition-colors duration-300 group-hover:text-accent">
                    {cert.name}
                  </h4>
                  <span className="font-mono text-xs text-faint transition-colors duration-300 group-hover:text-accent">
                    ↗
                  </span>
                </div>
                <div className="mt-1 font-mono text-[11px] tracking-widest text-dim">
                  {cert.issuer.toUpperCase()}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-faint">
                  {cert.detail}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

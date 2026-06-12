"use client";

import { useRef } from "react";
import Image from "next/image";
import { animate } from "animejs";
import site from "@/data/site.json";
import SectionHeading from "@/components/SectionHeading";
import { useReveal, prefersReducedMotion, isFinePointer } from "@/lib/anim";

function ProjectCard({ project, idx }) {
  const innerRef = useRef(null);

  const ref = useReveal((el) => {
    if (prefersReducedMotion()) {
      el.style.opacity = 1;
      el.style.transform = "none";
      return;
    }
    animate(el, {
      opacity: [0, 1],
      translateY: [70, 0],
      duration: 1100,
      ease: "outExpo",
    });
  });

  const onMove = (e) => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    innerRef.current.style.transform = `perspective(1000px) rotateX(${(-py * 2.5).toFixed(2)}deg) rotateY(${(px * 3.5).toFixed(2)}deg)`;
  };

  const onLeave = () => {
    innerRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ opacity: 0 }}
      className="spotlight group relative rounded-2xl border border-line bg-surface/70 backdrop-blur-sm transition-colors duration-500 hover:border-line-bright"
    >
      <div
        ref={innerRef}
        className="p-8 transition-transform duration-300 ease-out md:p-12"
      >
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs tracking-[0.3em] text-faint">
                {String(idx + 1).padStart(3, "0")}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
                {project.subtitle}
              </span>
            </div>

            <h3 className="mt-4 font-display text-3xl font-bold tracking-tight transition-colors duration-300 md:text-5xl">
              {project.title}
            </h3>

            <p className="mt-5 leading-relaxed text-dim">
              {project.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line px-3.5 py-1 font-mono text-[11px] tracking-wider text-dim"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-8 md:items-end">
            {project.image && (
              <div className="w-48 -rotate-2 transition-transform duration-500 ease-out group-hover:rotate-0 md:w-60">
                <Image
                  src={project.image}
                  alt={`${project.title} — avatar illustration`}
                  width={1024}
                  height={1536}
                  sizes="(max-width: 768px) 192px, 240px"
                  className="h-auto w-full rounded-xl border border-line"
                />
              </div>
            )}
            <div className="flex flex-row gap-6 md:flex-col md:items-end md:gap-4">
              {project.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-dim underline-offset-4 transition-colors hover:text-accent hover:underline"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Projects({ index }) {
  const data = site.projects;
  return (
    <section
      id="projects"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40"
    >
      <SectionHeading index={index} label={data.label} title={data.title} />
      <div className="space-y-6 md:space-y-8">
        {data.items.map((project, i) => (
          <ProjectCard key={project.title} project={project} idx={i} />
        ))}
      </div>
    </section>
  );
}

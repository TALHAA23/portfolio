"use client";

import Image from "next/image";
import { animate, stagger, utils } from "animejs";
import site from "@/data/site.json";
import SectionHeading from "@/components/SectionHeading";
import { useReveal, prefersReducedMotion } from "@/lib/anim";

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split body copy into words, flagging the ones inside highlight phrases. */
function toWords(body, highlights) {
  const parts = highlights?.length
    ? body.split(new RegExp(`(${highlights.map(escapeRe).join("|")})`, "g"))
    : [body];
  const words = [];
  for (const part of parts) {
    if (!part) continue;
    const hl = highlights?.includes(part) ?? false;
    for (const w of part.split(" ")) {
      if (w) words.push({ w, hl });
    }
  }
  return words;
}

export default function About({ index }) {
  const data = site.about;
  const words = toWords(data.body, data.highlights);

  const bodyRef = useReveal((el) => {
    if (prefersReducedMotion()) {
      el.querySelectorAll(".about-word, .about-portrait").forEach((n) => {
        n.style.opacity = 1;
        n.style.transform = "none";
      });
      return;
    }
    animate(el.querySelectorAll(".about-word"), {
      opacity: [0.12, 1],
      duration: 600,
      delay: stagger(14),
      ease: "outQuad",
    });
    const portrait = el.querySelector(".about-portrait");
    if (portrait) {
      animate(portrait, {
        opacity: [0, 1],
        translateY: [50, 0],
        rotate: [3, 0],
        duration: 1200,
        ease: "outExpo",
      });
    }
  });

  const statsRef = useReveal((el) => {
    const nodes = el.querySelectorAll(".about-stat-value");
    nodes.forEach((node) => {
      const target = Number(node.dataset.value);
      const suffix = node.dataset.suffix || "";
      if (prefersReducedMotion()) {
        node.textContent = target + suffix;
        return;
      }
      const obj = { v: 0 };
      animate(obj, {
        v: target,
        duration: 1400,
        ease: "outExpo",
        modifier: utils.round(0),
        onUpdate: () => {
          node.textContent = obj.v + suffix;
        },
      });
    });
    if (!prefersReducedMotion()) {
      animate(el.querySelectorAll(".about-stat"), {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 800,
        delay: stagger(120),
        ease: "outExpo",
      });
    } else {
      el.querySelectorAll(".about-stat").forEach((n) => (n.style.opacity = 1));
    }
  });

  return (
    <section
      id="about"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40"
    >
      <SectionHeading index={index} label={data.label} title={data.title} />

      <div
        ref={bodyRef}
        className="grid items-center gap-12 lg:grid-cols-[1fr_320px] lg:gap-20"
      >
        <p className="max-w-4xl text-xl leading-relaxed md:text-[1.7rem] md:leading-[1.5]">
          {words.map(({ w, hl }, i) => (
            <span key={i}>
              <span
                className={`about-word ${
                  hl ? "font-medium text-accent" : "text-text"
                }`}
                style={{ opacity: 0.12 }}
              >
                {w}
              </span>{" "}
            </span>
          ))}
        </p>

        {data.image && (
          <div
            className="about-portrait group relative mx-auto w-64 max-w-full lg:mx-0 lg:w-full"
            style={{ opacity: 0 }}
          >
            <div className="overflow-hidden rounded-2xl border border-line bg-surface/70 transition-colors duration-500 group-hover:border-line-bright">
              <Image
                src={data.image}
                alt={`${site.personal.name} — stylized portrait with laptop`}
                width={1024}
                height={1536}
                sizes="(max-width: 1023px) 256px, 320px"
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-4 -bottom-3 h-8 rounded-full bg-accent-faint blur-xl" />
          </div>
        )}
      </div>

      <div
        ref={statsRef}
        className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3"
      >
        {data.stats.map((stat) => (
          <div
            key={stat.label}
            className="about-stat bg-surface p-8 md:p-10"
            style={{ opacity: 0 }}
          >
            <div
              className="about-stat-value font-display text-5xl font-bold text-text md:text-6xl"
              data-value={stat.value}
              data-suffix={stat.suffix}
            >
              0
            </div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { animate, stagger } from "animejs";
import site from "@/data/site.json";
import SplitText from "@/components/SplitText";
import Magnetic from "@/components/Magnetic";
import { useReveal, prefersReducedMotion } from "@/lib/anim";

export default function Contact({ index }) {
  const data = site.contact;
  const [copied, setCopied] = useState(false);

  const ref = useReveal((el) => {
    if (prefersReducedMotion()) {
      el.querySelectorAll(".split-char, .contact-fade").forEach((n) => {
        n.style.opacity = 1;
        n.style.transform = "none";
      });
      return;
    }
    animate(el.querySelectorAll(".split-char"), {
      translateY: ["120%", "0%"],
      duration: 1100,
      delay: stagger(20),
      ease: "outExpo",
    });
    animate(el.querySelectorAll(".contact-fade"), {
      opacity: [0, 1],
      translateY: [22, 0],
      duration: 900,
      delay: stagger(120, { start: 400 }),
      ease: "outExpo",
    });
  });

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.personal.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${site.personal.email}`;
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="relative mx-auto max-w-7xl px-6 pb-10 pt-28 md:px-10 md:pt-40"
    >
      <div className="flex items-center gap-4 font-mono text-[11px] tracking-[0.3em] text-accent">
        <span className="text-faint">{index}</span>
        <span>{data.label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <h2 className="mt-8 font-display text-[clamp(2.6rem,8vw,7rem)] font-bold leading-[0.98] tracking-tight">
        {data.titleLines.map((line, i) => (
          <span key={i} className="split-line">
            <SplitText text={line} />
          </span>
        ))}
      </h2>

      <p
        className="contact-fade mt-8 max-w-md leading-relaxed text-dim"
        style={{ opacity: 0 }}
      >
        {data.blurb}
      </p>

      <div className="contact-fade mt-12" style={{ opacity: 0 }}>
        <Magnetic strength={0.2}>
          <button
            onClick={copyEmail}
            className="group flex items-center gap-4 font-display text-[clamp(1.3rem,4vw,2.6rem)] font-semibold tracking-tight transition-colors duration-300 hover:text-accent"
          >
            {data.emailCta}
            <span className="font-mono text-xs tracking-[0.25em] text-faint transition-colors duration-300 group-hover:text-accent">
              {copied ? "COPIED ✓" : "[ CLICK TO COPY ]"}
            </span>
          </button>
        </Magnetic>
        <div className="mt-2 font-mono text-[11px] tracking-widest text-faint">
          {site.personal.phone} · {site.personal.location.toUpperCase()}
        </div>
      </div>

      <div
        className="contact-fade mt-12 flex flex-wrap gap-x-8 gap-y-3"
        style={{ opacity: 0 }}
      >
        {data.socials.map((social) => (
          <a
            key={social.label}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-dim underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            {social.label} ↗
          </a>
        ))}
      </div>

      <footer className="mt-24 flex flex-col gap-3 border-t border-line py-8 font-mono text-[10px] tracking-[0.2em] text-faint sm:flex-row sm:items-center sm:justify-between md:text-[11px]">
        <span>
          © {site.footer.year} — {site.footer.line.toUpperCase()}
        </span>
        <span>{site.footer.credits.toUpperCase()}</span>
        <a
          href="#top"
          className="transition-colors hover:text-accent"
        >
          BACK TO TOP ↑
        </a>
      </footer>
    </section>
  );
}

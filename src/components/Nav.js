"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import site from "@/data/site.json";
import { useBoot, prefersReducedMotion } from "@/lib/anim";

function LocalTime() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: site.personal.timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{time}</span>;
}

export default function Nav() {
  const ref = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useBoot(() => {
    if (prefersReducedMotion()) {
      ref.current.style.opacity = 1;
      return;
    }
    animate(ref.current.querySelectorAll(".nav-item"), {
      opacity: [0, 1],
      translateY: [-14, 0],
      duration: 700,
      delay: stagger(60),
      ease: "outExpo",
    });
    ref.current.style.opacity = 1;
  });

  const [logoLeft, logoRight] = site.nav.logo.split("//");

  return (
    <header
      ref={ref}
      style={{ opacity: 0 }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ${
        scrolled
          ? "border-b border-line bg-bg/70 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        <a
          href="#top"
          className="nav-item font-mono text-sm font-medium tracking-widest"
          style={{ opacity: 0 }}
        >
          {logoLeft}
          <span className="text-accent">{"//"}</span>
          <span className="text-dim">{logoRight}</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {site.nav.links.map((link) => (
            <li key={link.href} className="nav-item" style={{ opacity: 0 }}>
              <a
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim transition-colors duration-300 hover:text-text"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div
          className="nav-item flex items-center gap-3 font-mono text-[11px] tracking-widest text-dim"
          style={{ opacity: 0 }}
        >
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="hidden sm:inline">{site.personal.availability}</span>
          <span className="text-faint">
            <LocalTime />
          </span>
        </div>
      </nav>
    </header>
  );
}

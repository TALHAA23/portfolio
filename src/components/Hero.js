"use client";

import { useRef } from "react";
import Image from "next/image";
import { createTimeline, animate, stagger } from "animejs";
import site from "@/data/site.json";
import SplitText from "@/components/SplitText";
import Magnetic from "@/components/Magnetic";
import { useBoot, prefersReducedMotion } from "@/lib/anim";

export default function Hero() {
  const ref = useRef(null);
  const hero = site.hero;

  useBoot(() => {
    const root = ref.current;
    if (prefersReducedMotion()) {
      root
        .querySelectorAll(".hero-fade, .split-char, .hero-avatar")
        .forEach((el) => {
          el.style.opacity = 1;
          el.style.transform = "none";
        });
      return;
    }

    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    tl.add(root.querySelector(".hero-kicker"), {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 600,
    })
      .add(
        root.querySelectorAll(".hero-name .split-char"),
        {
          translateY: ["120%", "0%"],
          duration: 1200,
          delay: stagger(38),
        },
        "-=400"
      )
      .add(
        root.querySelector(".hero-avatar"),
        { opacity: [0, 1], translateY: [60, 0], scale: [0.94, 1], duration: 1300 },
        "-=1000"
      )
      .add(
        root.querySelector(".hero-role"),
        { opacity: [0, 1], translateY: [26, 0], duration: 900 },
        "-=1100"
      )
      .add(
        root.querySelector(".hero-tagline"),
        { opacity: [0, 1], translateY: [20, 0], duration: 800 },
        "-=700"
      )
      .add(
        root.querySelectorAll(".hero-cta"),
        {
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 700,
          delay: stagger(110),
        },
        "-=600"
      )
      .add(
        root.querySelectorAll(".hero-meta"),
        { opacity: [0, 1], duration: 900, delay: stagger(120) },
        "-=400"
      );

    // ambient glow breathing behind the name
    animate(root.querySelector(".hero-glow"), {
      opacity: [0.35, 0.7],
      scale: [1, 1.18],
      duration: 4200,
      alternate: true,
      loop: true,
      ease: "inOutSine",
    });

    // avatar floats forever once it has landed
    const avatar = root.querySelector(".hero-avatar");
    if (avatar) {
      animate(avatar.querySelector("img"), {
        translateY: [-10, 10],
        duration: 3600,
        alternate: true,
        loop: true,
        ease: "inOutSine",
      });
    }
  });

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-screen flex-col justify-center px-6 md:px-10"
    >
      <div
        className="hero-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[45vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, var(--accent-faint) 0%, transparent 70%)",
          opacity: 0.35,
        }}
      />

      {hero.image && (
        <div className="pointer-events-none absolute right-[1%] top-1/2 hidden w-[30vw] max-w-[460px] translate-y-[-54%] lg:block xl:right-[4%]">
          <div className="hero-avatar" style={{ opacity: 0 }}>
            <Image
              src={hero.image}
              alt={`${site.personal.name} — stylized avatar`}
              width={1024}
              height={1536}
              priority
              sizes="(max-width: 1023px) 1px, 30vw"
              className="h-auto w-full"
              style={{
                maskImage:
                  "radial-gradient(ellipse 72% 70% at 50% 42%, black 48%, transparent 76%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 72% 70% at 50% 42%, black 48%, transparent 76%)",
              }}
            />
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <p
          className="hero-kicker hero-fade mb-6 font-mono text-[11px] tracking-[0.35em] text-accent md:text-xs"
          style={{ opacity: 0 }}
        >
          {hero.kicker}
        </p>

        <h1 className="hero-name font-display text-[clamp(3.6rem,14vw,11.5rem)] font-bold uppercase leading-[0.92] tracking-tight">
          {hero.name.map((line, i) => (
            <span key={i} className="split-line">
              <SplitText text={line} />
            </span>
          ))}
        </h1>

        <p
          className="hero-role hero-fade mt-8 font-display text-[clamp(1.3rem,3vw,2.1rem)] font-medium"
          style={{ opacity: 0 }}
        >
          {hero.roleLine.endsWith(".") ? (
            <>
              {hero.roleLine.slice(0, -1)}
              <span className="text-accent">.</span>
            </>
          ) : (
            hero.roleLine
          )}
        </p>

        <p
          className="hero-tagline hero-fade mt-5 max-w-xl text-base leading-relaxed text-dim md:text-lg"
          style={{ opacity: 0 }}
        >
          {hero.tagline}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {hero.ctas.map((cta) => (
            <Magnetic key={cta.label} className="hero-cta" >
              <a
                href={cta.href}
                target={cta.external ? "_blank" : undefined}
                rel={cta.external ? "noopener noreferrer" : undefined}
                className={
                  cta.style === "primary"
                    ? "inline-block rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-bg transition-shadow duration-300 hover:shadow-[0_0_35px_var(--accent-dim)]"
                    : "inline-block rounded-full border border-line-bright px-7 py-3.5 text-sm font-medium text-dim transition-colors duration-300 hover:border-accent hover:text-accent"
                }
              >
                {cta.label}
                {cta.external ? " ↗" : ""}
              </a>
            </Magnetic>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-6 bottom-7 flex items-end justify-between font-mono text-[10px] tracking-[0.25em] text-faint md:inset-x-10 md:text-[11px]">
        <span className="hero-meta" style={{ opacity: 0 }}>
          {site.personal.location.toUpperCase()}
        </span>
        <span
          className="hero-meta flex flex-col items-center gap-2"
          style={{ opacity: 0 }}
        >
          <span className="scroll-line block h-10 w-px bg-line-bright" />
          {hero.scrollHint}
        </span>
        <span className="hero-meta" style={{ opacity: 0 }}>
          {site.personal.role.toUpperCase()}
        </span>
      </div>
    </section>
  );
}

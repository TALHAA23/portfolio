"use client";

import { useEffect, useRef, useState } from "react";
import { createTimeline, stagger, utils } from "animejs";
import site from "@/data/site.json";
import { prefersReducedMotion } from "@/lib/anim";

export default function Preloader() {
  const boot = site.hero.boot;
  const [gone, setGone] = useState(false);
  const rootRef = useRef(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const finish = () => {
      window.__booted = true;
      window.dispatchEvent(new Event("boot:done"));
      document.documentElement.style.overflow = "";
    };

    if (!boot.enabled || prefersReducedMotion()) {
      finish();
      requestAnimationFrame(() => setGone(true));
      return;
    }

    document.documentElement.style.overflow = "hidden";
    const root = rootRef.current;
    const counter = { v: 0 };
    const counterEl = root.querySelector(".boot-counter");

    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    tl.add(root.querySelectorAll(".boot-line"), {
      opacity: [0, 1],
      translateX: [-12, 0],
      duration: 350,
      delay: stagger(130),
    })
      .add(
        counter,
        {
          v: 100,
          duration: 1500,
          ease: "inOutQuad",
          modifier: utils.round(0),
          onUpdate: () => {
            counterEl.textContent = String(counter.v).padStart(3, "0");
          },
        },
        "-=1000"
      )
      .add(
        root.querySelector(".boot-bar-fill"),
        { scaleX: [0, 1], duration: 1500, ease: "inOutQuad" },
        "<<"
      )
      .add(root.querySelector(".boot-done"), {
        opacity: [0, 1],
        duration: 220,
      })
      .add(root, {
        translateY: ["0%", "-100%"],
        duration: 900,
        ease: "inOutExpo",
        delay: 250,
        onBegin: finish,
        onComplete: () => setGone(true),
      });

    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [boot.enabled]);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[90] flex flex-col justify-between bg-bg p-6 md:p-10"
    >
      <div className="font-mono text-xs tracking-widest text-faint">
        {`${site.personal.shortName} // BOOT_SEQUENCE`}
      </div>

      <div className="flex items-end justify-between gap-8">
        <div className="space-y-1.5">
          {boot.lines.map((line, i) => (
            <div
              key={i}
              className="boot-line font-mono text-[11px] text-dim md:text-xs"
              style={{ opacity: 0 }}
            >
              {line}
            </div>
          ))}
          <div
            className="boot-done pt-2 font-mono text-xs tracking-widest text-accent"
            style={{ opacity: 0 }}
          >
            ● {boot.done}
          </div>
        </div>
        <div className="boot-counter font-display text-7xl font-medium tabular-nums leading-none md:text-8xl">
          000
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-px w-full bg-line">
        <div
          className="boot-bar-fill h-full w-full origin-left bg-accent"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}

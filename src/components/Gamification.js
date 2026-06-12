"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import site from "@/data/site.json";
import { useBoot, prefersReducedMotion } from "@/lib/anim";

const STORAGE_KEY = "talha-achievements-v1";
const KONAMI = [
  "arrowup", "arrowup", "arrowdown", "arrowdown",
  "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a",
];
const GOD_MODE_VARS = {
  "--accent": "#ff2d96",
  "--accent-dim": "rgba(255, 45, 150, 0.35)",
  "--accent-faint": "rgba(255, 45, 150, 0.07)",
};

function Toast({ ach, onDone }) {
  const ref = useRef(null);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    const el = ref.current;
    animate(el, {
      opacity: [0, 1],
      translateX: [-32, 0],
      duration: 600,
      ease: "outExpo",
    });
    const t = setTimeout(() => {
      animate(el, {
        opacity: 0,
        translateX: -32,
        duration: 450,
        ease: "inExpo",
        onComplete: () => doneRef.current(),
      });
    }, 4200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      ref={ref}
      style={{ opacity: 0 }}
      className="flex items-center gap-3.5 rounded-xl border border-line bg-surface/90 px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-md"
    >
      <span className="font-mono text-base text-accent">{ach.icon}</span>
      <div>
        <div className="font-mono text-[9px] tracking-[0.3em] text-accent">
          ACHIEVEMENT UNLOCKED
        </div>
        <div className="mt-0.5 font-display text-sm font-semibold">
          {ach.title}
        </div>
        <div className="font-mono text-[10px] text-dim">{ach.desc}</div>
      </div>
    </div>
  );
}

export default function Gamification() {
  const cfg = site.gamification;
  const [unlocked, setUnlocked] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [open, setOpen] = useState(false);
  const unlockedRef = useRef(new Set());
  const hudRef = useRef(null);
  const panelRef = useRef(null);
  const flashRef = useRef(null);

  useBoot(() => {
    if (!cfg?.enabled) return;
    animate(hudRef.current, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 800,
      ease: "outExpo",
    });
  });

  // restore persisted unlocks
  useEffect(() => {
    if (!cfg?.enabled) return;
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      saved = [];
    }
    unlockedRef.current = new Set(saved);
    if (saved.length) requestAnimationFrame(() => setUnlocked(saved));
  }, [cfg?.enabled]);

  // all trackers live here; unlock() is defined inside so the effect has no deps
  useEffect(() => {
    if (!cfg?.enabled) return;
    const cleanups = [];

    const unlock = (id) => {
      if (unlockedRef.current.has(id)) return;
      const ach = cfg.achievements.find((a) => a.id === id);
      if (!ach) return;
      unlockedRef.current.add(id);
      const arr = [...unlockedRef.current];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      } catch {}
      setUnlocked(arr);
      setToasts((t) => [...t, { key: `${Date.now()}-${id}`, ach }]);
    };

    // 1. witnessed the boot
    if (window.__booted) {
      setTimeout(() => unlock("boot"), 1500);
    } else {
      const onBoot = () => setTimeout(() => unlock("boot"), 1500);
      window.addEventListener("boot:done", onBoot, { once: true });
      cleanups.push(() => window.removeEventListener("boot:done", onBoot));
    }

    // 2. visited every content section
    const sectionIds = site.sections.order.filter(
      (k) => !["hero", "marquee"].includes(k) && !k.startsWith("circuits")
    );
    const seen = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            seen.add(e.target.id);
            if (seen.size === sectionIds.length) {
              unlock("explorer");
              io.disconnect();
            }
          }
        }
      },
      { threshold: 0.15 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    cleanups.push(() => io.disconnect());

    // 3. reached the very bottom
    const onScroll = () => {
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 80
      ) {
        unlock("deep-diver");
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // 4. hovered 10 distinct skill chips
    const probed = new Set();
    const onOver = (e) => {
      const chip = e.target.closest?.(".skill-chip");
      if (!chip) return;
      probed.add(chip.textContent);
      if (probed.size >= 10) {
        unlock("curious");
        document.removeEventListener("mouseover", onOver);
      }
    };
    document.addEventListener("mouseover", onOver, { passive: true });
    cleanups.push(() => document.removeEventListener("mouseover", onOver));

    // 5. copied the email (Contact dispatches this)
    const onCopy = () => unlock("recruiter");
    window.addEventListener("game:email-copied", onCopy);
    cleanups.push(() => window.removeEventListener("game:email-copied", onCopy));

    // 6. night visit
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 5) {
      const t = setTimeout(() => unlock("night-owl"), 6000);
      cleanups.push(() => clearTimeout(t));
    }

    // 7. konami code → god mode
    let seq = [];
    const onKey = (e) => {
      seq = [...seq, e.key.toLowerCase()].slice(-KONAMI.length);
      if (KONAMI.every((k, i) => seq[i] === k)) {
        unlock("konami");
        // god mode: accent palette flips, screen flashes
        for (const [k, v] of Object.entries(GOD_MODE_VARS)) {
          document.documentElement.style.setProperty(k, v);
        }
        if (!prefersReducedMotion() && flashRef.current) {
          animate(flashRef.current, {
            opacity: [
              { to: 0.3, duration: 130, ease: "outQuad" },
              { to: 0, duration: 900, ease: "outQuad" },
            ],
          });
        }
        seq = [];
      }
    };
    window.addEventListener("keydown", onKey);
    cleanups.push(() => window.removeEventListener("keydown", onKey));

    return () => cleanups.forEach((fn) => fn());
  }, [cfg]);

  // HUD pulse + panel pop-in
  useEffect(() => {
    if (unlocked.length > 0 && hudRef.current && !prefersReducedMotion()) {
      animate(hudRef.current, {
        scale: [1, 1.15, 1],
        duration: 600,
        ease: "outBack",
      });
    }
  }, [unlocked.length]);

  useEffect(() => {
    if (open && panelRef.current && !prefersReducedMotion()) {
      animate(panelRef.current, {
        opacity: [0, 1],
        translateY: [12, 0],
        scale: [0.97, 1],
        duration: 450,
        ease: "outExpo",
      });
    }
  }, [open]);

  if (!cfg?.enabled) return null;
  const total = cfg.achievements.length;

  return (
    <>
      {/* god-mode flash */}
      <div
        ref={flashRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[85] bg-accent"
        style={{ opacity: 0 }}
      />

      {/* toasts */}
      <div className="pointer-events-none fixed bottom-5 left-5 z-[70] flex w-80 max-w-[calc(100vw-7rem)] flex-col gap-3">
        {toasts.map((t) => (
          <Toast
            key={t.key}
            ach={t.ach}
            onDone={() =>
              setToasts((list) => list.filter((x) => x.key !== t.key))
            }
          />
        ))}
      </div>

      {/* HUD */}
      <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end">
        {open && (
          <div
            ref={panelRef}
            className="mb-3 w-72 rounded-2xl border border-line bg-surface/95 p-5 backdrop-blur-md"
          >
            <div className="font-mono text-[10px] tracking-[0.3em] text-accent">
              {cfg.title}
            </div>
            <div className="mt-1 font-mono text-[10px] text-faint">
              {cfg.subtitle}
            </div>
            <div className="mt-3 h-px w-full bg-line">
              <div
                className="h-full bg-accent transition-[width] duration-700"
                style={{ width: `${(unlocked.length / total) * 100}%` }}
              />
            </div>
            <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {cfg.achievements.map((ach) => {
                const got = unlocked.includes(ach.id);
                return (
                  <li key={ach.id} className="flex items-start gap-3">
                    <span
                      className={`w-8 shrink-0 text-center font-mono text-xs ${
                        got ? "text-accent" : "text-faint"
                      }`}
                    >
                      {got ? ach.icon : "?"}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={`font-display text-xs font-semibold tracking-wide ${
                          got ? "text-text" : "text-faint"
                        }`}
                      >
                        {got ? ach.title : "LOCKED"}
                      </div>
                      <div className="font-mono text-[10px] leading-relaxed text-dim">
                        {got ? ach.desc : ach.hint}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <button
          ref={hudRef}
          onClick={() => setOpen((o) => !o)}
          style={{ opacity: 0 }}
          className="flex items-center gap-2.5 rounded-full border border-line bg-bg/80 px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-dim backdrop-blur-md transition-colors duration-300 hover:border-accent hover:text-accent"
          aria-label="Visitor achievements"
        >
          <span className="text-accent">◆</span>
          {unlocked.length}/{total}
        </button>
      </div>
    </>
  );
}

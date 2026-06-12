"use client";

import { useEffect, useRef } from "react";
import site from "@/data/site.json";
import { prefersReducedMotion, hexToRgb } from "@/lib/anim";

/**
 * Canvas background: particles scattered in chaos assemble into a loose
 * grid once the boot sequence finishes — then drift, twinkle and react
 * to the cursor forever. All knobs live in site.json → theme.particles.
 */
export default function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cfg = site.theme.particles;
    const accent = hexToRgb(site.theme.colors.accent);
    const reduced = prefersReducedMotion();
    const ASSEMBLE_MS = 2800;

    let particles = [];
    let links = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let assembleStart = null;
    let mx = -1e4;
    let my = -1e4;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // widen spacing if needed so we never exceed maxCount
      const spacing = Math.max(cfg.spacing, Math.sqrt((w * h) / cfg.maxCount));
      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;

      particles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          particles.push({
            hx: c * spacing + (Math.random() - 0.5) * spacing * 0.5,
            hy: r * spacing + (Math.random() - 0.5) * spacing * 0.5,
            sx: Math.random() * w,
            sy: Math.random() * h,
            r: 0.6 + Math.random() * 1.1,
            a: 0.12 + Math.random() * 0.35,
            accent: Math.random() < cfg.accentRatio,
            o1: Math.random() * Math.PI * 2,
            o2: Math.random() * Math.PI * 2,
            x: 0,
            y: 0,
            alpha: 0,
          });
        }
      }

      links = [];
      const idx = (r, c) => r * cols + c;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (c + 1 < cols) links.push([idx(r, c), idx(r, c + 1)]);
          if (r + 1 < rows) links.push([idx(r, c), idx(r + 1, c)]);
        }
      }
    }

    function frame(now) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;

      let p = 1;
      if (!reduced) {
        p =
          assembleStart === null
            ? 0
            : easeOutCubic(Math.min(1, (now - assembleStart) / ASSEMBLE_MS));
      }

      for (const pt of particles) {
        let x =
          pt.sx +
          (pt.hx - pt.sx) * p +
          Math.sin(t * 0.5 + pt.o1) * cfg.drift * p;
        let y =
          pt.sy +
          (pt.hy - pt.sy) * p +
          Math.cos(t * 0.4 + pt.o2) * cfg.drift * p;

        // pre-assembly chaos: slow scattered wander
        if (p < 1) {
          x += Math.sin(t * 0.3 + pt.o2) * 16 * (1 - p);
          y += Math.cos(t * 0.35 + pt.o1) * 16 * (1 - p);
        }

        // cursor repulsion
        const dx = x - mx;
        const dy = y - my;
        const d2 = dx * dx + dy * dy;
        const rr = cfg.mouseRadius;
        if (d2 < rr * rr) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / rr) * 22;
          x += (dx / d) * f;
          y += (dy / d) * f;
        }

        pt.x = x;
        pt.y = y;
        pt.alpha = pt.a * (0.75 + 0.25 * Math.sin(t * 1.3 + pt.o1 * 3));
      }

      if (p > 0.05) {
        ctx.lineWidth = 1;
        for (const [i, j] of links) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < cfg.connectDistance) {
            const la = (1 - d / cfg.connectDistance) * 0.1 * p;
            ctx.strokeStyle =
              a.accent || b.accent
                ? `rgba(${accent.r},${accent.g},${accent.b},${la * 1.6})`
                : `rgba(255,255,255,${la})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const pt of particles) {
        ctx.fillStyle = pt.accent
          ? `rgba(${accent.r},${accent.g},${accent.b},${Math.min(1, pt.alpha * 2.2)})`
          : `rgba(255,255,255,${pt.alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (reduced) return; // static single frame
      raf = requestAnimationFrame(frame);
    }

    const startAssemble = () => {
      if (assembleStart === null) assembleStart = performance.now();
      canvas.style.opacity = "1";
    };

    build();
    canvas.style.opacity = reduced ? "1" : "0.999"; // visible behind preloader
    raf = requestAnimationFrame(frame);

    let bootFallback = 0;
    if (reduced || window.__booted || !site.hero.boot.enabled) {
      startAssemble();
    } else {
      window.addEventListener("boot:done", startAssemble, { once: true });
      bootFallback = setTimeout(startAssemble, 4500);
    }

    let resizeT = 0;
    const onResize = () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        build();
        if (reduced) {
          running = true;
          raf = requestAnimationFrame(frame);
        }
      }, 150);
    };

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onLeave = () => {
      mx = -1e4;
      my = -1e4;
    };
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      clearTimeout(bootFallback);
      window.removeEventListener("boot:done", startAssemble);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 h-full w-full"
    />
  );
}

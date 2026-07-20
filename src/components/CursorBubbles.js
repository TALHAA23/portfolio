"use client";

import { useEffect, useRef } from "react";
import site from "@/data/site.json";
import { prefersReducedMotion, isFinePointer } from "@/lib/anim";

/**
 * Small glassy bubbles that spawn as the cursor moves, float upward
 * and burst into a fading ring. Canvas-based, capped and throttled so
 * only a few are ever alive. Config: site.json → theme.bubbles.
 */
export default function CursorBubbles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cfg = site.theme.bubbles || {};
    if (cfg.enabled === false) return;
    if (!isFinePointer() || prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const maxBubbles = cfg.max || 14;
    const spawnGap = cfg.spawnGap || 42; // px of cursor travel per bubble
    const baseSize = cfg.size || 4;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();

    const bubbles = [];
    let lastX = null;
    let lastY = null;
    let travel = 0;
    let raf;

    const spawn = (x, y) => {
      if (bubbles.length >= maxBubbles) return;
      bubbles.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 10,
        r: baseSize * (0.5 + Math.random()),
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(0.45 + Math.random() * 0.7),
        wobble: Math.random() * Math.PI * 2,
        life: 0,
        rise: 500 + Math.random() * 500, // ms afloat before bursting
        burst: 0, // 0..1 burst progress once rising ends
      });
    };

    const onMove = (e) => {
      if (lastX !== null) {
        travel += Math.hypot(e.clientX - lastX, e.clientY - lastY);
        while (travel >= spawnGap) {
          travel -= spawnGap;
          spawn(e.clientX, e.clientY);
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };

    let prev = performance.now();
    const loop = (now) => {
      const dt = Math.min(now - prev, 50);
      prev = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life += dt;

        if (b.life < b.rise) {
          b.wobble += dt * 0.006;
          b.x += b.vx + Math.sin(b.wobble) * 0.25;
          b.y += b.vy * (dt / 16);

          const alpha = Math.min(1, b.life / 120) * 0.85;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.55})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          const g = ctx.createRadialGradient(
            b.x - b.r * 0.35,
            b.y - b.r * 0.35,
            0,
            b.x,
            b.y,
            b.r
          );
          g.addColorStop(0, `rgba(255,255,255,${alpha * 0.35})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.fill();
        } else {
          // burst: ring expands quickly while fading out
          b.burst += dt / 180;
          if (b.burst >= 1) {
            bubbles.splice(i, 1);
            continue;
          }
          const r = b.r * (1 + b.burst * 1.6);
          ctx.beginPath();
          ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - b.burst)})`;
          ctx.lineWidth = 1 - b.burst * 0.6;
          ctx.stroke();
        }
      }

      ctx.restore();
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[75]"
    />
  );
}

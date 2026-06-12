import { useEffect, useRef } from "react";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function isFinePointer() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches
  );
}

/**
 * Runs `onVisible(el)` once when the element scrolls into view.
 * Returns a ref to attach to the element.
 */
export function useReveal(onVisible, { threshold = 0.2, rootMargin = "0px 0px -10% 0px" } = {}) {
  const ref = useRef(null);
  const cbRef = useRef(onVisible);

  useEffect(() => {
    cbRef.current = onVisible;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            io.disconnect();
            cbRef.current(el);
          }
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}

/**
 * Runs `cb` once the boot/preloader sequence has finished
 * (immediately if it already has, or if the preloader is disabled).
 */
export function useBoot(cb) {
  const cbRef = useRef(cb);

  useEffect(() => {
    cbRef.current = cb;
  });

  useEffect(() => {
    if (window.__booted) {
      cbRef.current();
      return;
    }
    const handler = () => cbRef.current();
    window.addEventListener("boot:done", handler, { once: true });
    return () => window.removeEventListener("boot:done", handler);
  }, []);
}

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

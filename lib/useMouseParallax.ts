"use client";

import { useEffect, useState } from "react";

// Tracks the cursor position relative to the viewport center, scaled by
// `strength` (max pixels of offset). Stays active while the user scrolls —
// it listens on window, not on any one section — and degrades to a fixed
// {0,0} on touch devices (no mousemove) or with reduced motion requested.
export function useMouseParallax(strength = 20) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    function handleMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setOffset({ x: x * strength, y: y * strength }));
    }

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return offset;
}

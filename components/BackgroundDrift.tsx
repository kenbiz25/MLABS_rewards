"use client";

import { useEffect, useRef } from "react";
import { Logomark } from "./Logomark";

interface Sprite {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

// Ambient background texture - the brand icon drifting faintly, matching
// the treatment used on the sign-in page.
const CONFIGS = [
  { size: 260, speed: 0.15 },
  { size: 160, speed: 0.24 },
  { size: 96, speed: 0.34 },
];

export function BackgroundDrift() {
  const containerRef = useRef<HTMLDivElement>(null);
  const spritesRef = useRef<Sprite[]>([]);
  const frameRef = useRef<number>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const elements = Array.from(container.children) as HTMLDivElement[];
    const bounds = { w: window.innerWidth, h: window.innerHeight };

    spritesRef.current = elements.map((el, i) => {
      const { size, speed } = CONFIGS[i];
      const x = Math.random() * Math.max(1, bounds.w - size);
      const y = Math.random() * Math.max(1, bounds.h - size);
      const angle = Math.random() * Math.PI * 2;
      return {
        el,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
      };
    });

    if (reduceMotion) {
      spritesRef.current.forEach((s) => {
        s.el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      });
      return;
    }

    function handleResize() {
      bounds.w = window.innerWidth;
      bounds.h = window.innerHeight;
    }
    window.addEventListener("resize", handleResize);

    function tick() {
      for (const s of spritesRef.current) {
        s.x += s.vx;
        s.y += s.vy;

        if (s.x <= 0 || s.x >= bounds.w - s.size) {
          s.vx *= -1;
          s.x = Math.min(Math.max(s.x, 0), bounds.w - s.size);
        }
        if (s.y <= 0 || s.y >= bounds.h - s.size) {
          s.vy *= -1;
          s.y = Math.min(Math.max(s.y, 0), bounds.h - s.size);
        }

        s.el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {CONFIGS.map((c, i) => (
        <div key={i} className="absolute top-0 left-0 opacity-[0.14] will-change-transform">
          <Logomark size={c.size} />
        </div>
      ))}
    </div>
  );
}

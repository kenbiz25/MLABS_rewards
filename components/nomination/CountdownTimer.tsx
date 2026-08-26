"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Closing…";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  if (minutes > 0) return `${minutes}m ${seconds}s remaining`;
  return `${seconds}s remaining`;
}

export function CountdownTimer({ closesAt, className }: { closesAt: string; className?: string }) {
  const target = new Date(closesAt).getTime();
  // Ticks every second under an hour left (so seconds visibly move), and
  // every minute otherwise - no need to re-render every second for a
  // multi-day window.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const tick = () => setNow(Date.now());
    const msRemaining = target - Date.now();
    const intervalMs = msRemaining < 60 * 60 * 1000 ? 1000 : 60 * 1000;
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [target]);

  // Avoids a server/client markup mismatch: renders nothing until mounted,
  // since "time remaining" is inherently a client-clock value.
  if (now === null) return null;

  return <span className={className}>{formatRemaining(target - now)}</span>;
}

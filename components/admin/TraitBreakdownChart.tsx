"use client";

import { useCountUp } from "@/lib/useCountUp";

interface TraitBreakdownEntry {
  key: string;
  label: string;
  accent: string;
  count: number;
}

interface TraitBreakdownChartProps {
  data: TraitBreakdownEntry[];
  scopeLabel: string;
  // Live dashboard: counts animate up on load/change. PDF/print view:
  // show the final number immediately (no animation to capture).
  animate?: boolean;
}

function CountValue({ value, animate }: { value: number; animate: boolean }) {
  const animated = useCountUp(value);
  return <span className="text-ink-faint">{animate ? animated : value}</span>;
}

export function TraitBreakdownChart({ data, scopeLabel, animate = true }: TraitBreakdownChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-card border border-border bg-white p-7 shadow-card">
      <h3 className="text-base font-medium text-ink">Most-selected Core Trait</h3>
      <p className="mt-1 text-sm text-ink-faint">{scopeLabel}</p>

      <div className="mt-7 space-y-4">
        {data.map((d) => (
          <div key={d.key}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-ink">{d.label}</span>
              <CountValue value={d.count} animate={animate} />
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all duration-300 ease-brand"
                style={{ width: `${Math.max(2, (d.count / max) * 100)}%`, backgroundColor: d.accent }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

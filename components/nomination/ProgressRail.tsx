import { CountdownTimer } from "./CountdownTimer";

interface ProgressRailProps {
  completed: number;
  total: number;
  closesAt?: string | null;
}

export function ProgressRail({ completed, total, closesAt }: ProgressRailProps) {
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="lg:sticky lg:top-24">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">
        Your nomination
      </p>
      {closesAt && (
        <p className="mt-1 text-sm font-medium text-indigo">
          <CountdownTimer closesAt={closesAt} />
        </p>
      )}

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-indigo transition-[width] duration-[260ms] ease-brand"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-ink-faint">
        {completed} of {total} complete
      </p>

      <p className="mt-6 text-sm leading-relaxed text-ink-faint">
        Be specific. A single moment, clearly described, is worth more than a
        general compliment.
      </p>

      <div className="mt-6 h-px w-full bg-border" />

      <p className="mt-6 text-sm text-ink-faint">
        Questions? Contact the Medtronic LABS HR Team.
      </p>
    </div>
  );
}

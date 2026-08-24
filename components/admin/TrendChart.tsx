interface TrendPoint {
  cycleId: string;
  cycleName: string;
  count: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  // Live dashboard: bar bulges and reveals its count on hover. PDF/print
  // view: hover never happens, so the count is baked into the bar instead.
  interactive?: boolean;
}

const CHART_HEIGHT = 160;

export function TrendChart({ data, interactive = true }: TrendChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-card border border-border bg-white p-7 shadow-card">
      <h3 className="text-base font-medium text-ink">Nominations by cycle</h3>
      <p className="mt-1 text-sm text-ink-faint">Volume over time, across all cycles.</p>

      {data.length === 0 ? (
        <p className="mt-8 text-sm text-ink-ghost">No cycles yet.</p>
      ) : (
        <div className="mt-8 flex items-end gap-3 overflow-x-auto pb-2" style={{ height: CHART_HEIGHT + 24 }}>
          {data.map((d) => {
            const height = Math.max(4, Math.round((d.count / max) * CHART_HEIGHT));
            return (
              <div key={d.cycleId} className="group flex min-w-[56px] flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-end" style={{ height: CHART_HEIGHT }}>
                  <div
                    className={`relative flex w-full items-start justify-center rounded-t-md bg-indigo pt-1.5 transition-transform duration-300 ease-brand ${
                      interactive ? "group-hover:scale-105" : ""
                    }`}
                    style={{ height, transformOrigin: "bottom" }}
                  >
                    <span
                      className={`text-xs font-medium text-white transition-opacity duration-200 ${
                        interactive ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                      }`}
                    >
                      {d.count}
                    </span>
                  </div>
                </div>
                <span className="max-w-[64px] truncate text-center text-[11px] text-ink-faint" title={d.cycleName}>
                  {d.cycleName}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface WordCount {
  word: string;
  count: number;
}

interface WordFrequencyPanelProps {
  data: WordCount[];
  scopeLabel: string;
}

export function WordFrequencyPanel({ data, scopeLabel }: WordFrequencyPanelProps) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-card border border-border bg-white p-7 shadow-card">
      <h3 className="text-base font-medium text-ink">Recurring words</h3>
      <p className="mt-1 text-sm text-ink-faint">{scopeLabel}</p>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-ink-ghost">Not enough text yet to surface themes.</p>
      ) : (
        <ul className="mt-6 flex flex-wrap gap-2">
          {data.map((d) => {
            const scale = 0.85 + (d.count / max) * 0.65;
            return (
              <li
                key={d.word}
                className="cursor-default rounded-full bg-pale-indigo px-3 py-1.5 font-medium text-indigo transition-all duration-200 ease-brand hover:scale-110 hover:bg-indigo hover:text-white"
                style={{ fontSize: `${scale * 13}px` }}
                title={`${d.count} mentions`}
              >
                {d.word}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

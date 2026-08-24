import { format } from "date-fns";
import type { TraitKey } from "@/lib/traits";

interface CountryStat {
  code: string;
  name: string;
  count: number;
}

interface CurrentCycleStat {
  name: string;
  opensAt: string | null;
  closesAt: string | null;
}

interface StatsCardsProps {
  total: number;
  countries: number;
  byTrait: Record<TraitKey, number>;
  multiTraitCount: number;
  uniqueNominators: number;
  mostActiveCountry: CountryStat | null;
  leastActiveCountry: CountryStat | null;
  currentCycle: CurrentCycleStat | null;
}

// One deliberate pass through the brand palette, no repeats - each card gets
// a distinct accent rather than colors landing wherever.
const ACCENTS = ["#2514BE", "#6165DE", "#00A372", "#C35721", "#EB956A", "#751A1A"];

export function StatsCards({
  total,
  countries,
  multiTraitCount,
  uniqueNominators,
  mostActiveCountry,
  leastActiveCountry,
  currentCycle,
}: StatsCardsProps) {
  const cycleDateRange =
    currentCycle?.opensAt && currentCycle?.closesAt
      ? `${format(new Date(currentCycle.opensAt), "d MMM")} - ${format(new Date(currentCycle.closesAt), "d MMM yyyy")}`
      : null;

  const mostActiveNote = mostActiveCountry
    ? leastActiveCountry && leastActiveCountry.code !== mostActiveCountry.code
      ? `${mostActiveCountry.name} · least: ${leastActiveCountry.name} (${leastActiveCountry.count})`
      : mostActiveCountry.name
    : "No nominations yet";

  const cards = [
    { label: "Nominations", value: String(total), note: "In the selected window" },
    { label: "Countries represented", value: String(countries), note: "Across nominees" },
    {
      label: "Current cycle",
      value: currentCycle?.name ?? "All cycles",
      note: cycleDateRange ?? "No dates set",
    },
    {
      label: "Most active country",
      value: mostActiveCountry ? String(mostActiveCountry.count) : "-",
      note: mostActiveNote,
    },
    {
      label: "Unique nominators",
      value: String(uniqueNominators),
      note: "People who've submitted a nomination",
    },
    {
      label: "Multi-trait nominations",
      value: String(multiTraitCount),
      note: "Reflect more than one Core Trait",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c, i) => (
        <div key={c.label} className="flex flex-col rounded-[20px] border border-border bg-white p-6 shadow-card">
          <p className="flex min-h-[2.5rem] items-start text-xs font-medium uppercase leading-tight tracking-[0.08em] text-ink-faint">
            {c.label}
          </p>
          <p
            className="flex min-h-[2.75rem] items-center truncate text-3xl font-medium"
            style={{ color: ACCENTS[i] }}
            title={c.value}
          >
            {c.value}
          </p>
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-ink-ghost">{c.note}</p>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import type { TraitKey } from "@/lib/traits";
import { LogoLockup } from "@/components/Logomark";
import { StatsCards } from "./StatsCards";
import { TrendChart } from "./TrendChart";
import { TraitBreakdownChart } from "./TraitBreakdownChart";
import { WordFrequencyPanel } from "./WordFrequencyPanel";

const EMPTY_BY_TRAIT: Record<TraitKey, number> = {
  PUT_PATIENTS_FIRST: 0,
  ADOPT_EXCELLENCE: 0,
  FOSTER_MUTUAL_ACCOUNTABILITY: 0,
  LEAD_WITH_INNOVATION: 0,
};

export function SummaryPrintView() {
  const params = useSearchParams();
  const cycleId = params.get("cycleId") ?? "all";

  const [scopeName, setScopeName] = useState("All cycles");
  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    byTrait: EMPTY_BY_TRAIT,
    multiTraitCount: 0,
    uniqueNominators: 0,
    mostActiveCountry: null as { code: string; name: string; count: number } | null,
    leastActiveCountry: null as { code: string; name: string; count: number } | null,
    currentCycle: null as { name: string; opensAt: string | null; closesAt: string | null } | null,
  });
  const [trend, setTrend] = useState<{ cycleId: string; cycleName: string; count: number }[]>([]);
  const [traitBreakdown, setTraitBreakdown] = useState<
    { key: string; label: string; accent: string; count: number }[]
  >([]);
  const [wordFrequency, setWordFrequency] = useState<{ word: string; count: number }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const listQs = cycleId !== "all" ? `?cycleId=${cycleId}` : "";
    const analyticsQs = cycleId !== "all" ? `?cycleId=${cycleId}` : "";

    Promise.all([
      fetch(`/api/admin/nominations${listQs}`).then((r) => r.json()),
      fetch(`/api/admin/analytics${analyticsQs}`).then((r) => r.json()),
    ]).then(([listData, analyticsData]) => {
      setStats(listData.stats);
      if (cycleId !== "all") {
        const match = listData.cycles.find((c: { id: string; name: string }) => c.id === cycleId);
        if (match) setScopeName(match.name);
      }
      setTrend(analyticsData.trend);
      setTraitBreakdown(analyticsData.traitBreakdown);
      setWordFrequency(analyticsData.wordFrequency);
      setLoaded(true);
    });
  }, [cycleId]);

  const scopeLabel = cycleId === "all" ? "Cumulative, across all cycles." : `For ${scopeName}.`;

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden sticky top-0 z-10 flex flex-col gap-3 border-b border-border bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-faint">
          Use your browser's print dialog and choose "Save as PDF" as the destination.
        </p>
        <button
          onClick={() => window.print()}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-indigo px-4 text-sm font-medium text-white transition hover:bg-indigo-hover"
        >
          <Printer size={16} strokeWidth={1.75} />
          Print / Save as PDF
        </button>
      </div>

      <div className="mx-auto max-w-dashboard px-8 py-10">
        <div className="flex items-center justify-between">
          <LogoLockup height={24} />
          <p className="text-xs text-ink-ghost">Generated {format(new Date(), "d MMMM yyyy, HH:mm")}</p>
        </div>

        <p className="mt-8 text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">HR Team</p>
        <h1 className="mt-2 text-3xl font-medium text-ink">Nominations summary</h1>
        <p className="mt-1 text-[15px] text-ink-faint">
          {cycleId === "all" ? "All cycles" : scopeName}
        </p>

        {!loaded ? (
          <p className="mt-10 text-sm text-ink-ghost">Loading…</p>
        ) : (
          <div className="mt-8 space-y-6">
            <StatsCards
              total={stats.total}
              countries={stats.countries}
              byTrait={stats.byTrait}
              multiTraitCount={stats.multiTraitCount}
              uniqueNominators={stats.uniqueNominators}
              mostActiveCountry={stats.mostActiveCountry}
              leastActiveCountry={stats.leastActiveCountry}
              currentCycle={stats.currentCycle}
            />
            <div className="grid grid-cols-1 gap-5 break-inside-avoid lg:grid-cols-3">
              <TrendChart data={trend} interactive={false} />
              <TraitBreakdownChart data={traitBreakdown} scopeLabel={scopeLabel} animate={false} />
              <WordFrequencyPanel data={wordFrequency} scopeLabel={scopeLabel} />
            </div>
          </div>
        )}

        <p className="mt-10 border-t border-border pt-4 text-[13px] text-ink-ghost">
          Medtronic LABS · Core Traits & Recognition Awards - internal use only
        </p>
      </div>
    </div>
  );
}

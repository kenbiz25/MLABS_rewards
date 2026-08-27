"use client";

import { useEffect, useState } from "react";
import type { TraitKey } from "@/lib/traits";
import type { SerializedNomination } from "@/lib/serialize";
import { StatsCards } from "./StatsCards";
import { FilterRow } from "./FilterRow";
import { NominationsTable } from "./NominationsTable";
import { NominationDrawer } from "./NominationDrawer";
import { ExportButton } from "./ExportButton";
import { ExportPdfButton } from "./ExportPdfButton";
import { TrendChart } from "./TrendChart";
import { TraitBreakdownChart } from "./TraitBreakdownChart";
import { WordFrequencyPanel } from "./WordFrequencyPanel";

interface CycleOption {
  id: string;
  name: string;
  status: string;
}

const EMPTY_BY_TRAIT: Record<TraitKey, number> = {
  PUT_PATIENTS_FIRST: 0,
  ADOPT_EXCELLENCE: 0,
  FOSTER_MUTUAL_ACCOUNTABILITY: 0,
  LEAD_WITH_INNOVATION: 0,
};

export function Dashboard() {
  const [cycles, setCycles] = useState<CycleOption[]>([]);
  const [cycleId, setCycleId] = useState<string>("all");
  const [trait, setTrait] = useState<TraitKey | null>(null);
  const [country, setCountry] = useState("");
  const [q, setQ] = useState("");

  const [nominations, setNominations] = useState<SerializedNomination[]>([]);
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
  const [selected, setSelected] = useState<SerializedNomination | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function buildQuery(): string {
    const params = new URLSearchParams();
    if (cycleId !== "all") params.set("cycleId", cycleId);
    if (trait) params.set("trait", trait);
    if (country) params.set("country", country);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  useEffect(() => {
    const qs = buildQuery();
    fetch(`/api/admin/nominations${qs}`)
      .then((r) => r.json())
      .then((data) => {
        setNominations(data.nominations);
        setStats(data.stats);
        setCycles(data.cycles);
        if (!initialized) {
          setCycleId(data.selectedCycleId ?? "all");
          setInitialized(true);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleId, trait, country, q, refreshKey]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (cycleId !== "all") params.set("cycleId", cycleId);
    fetch(`/api/admin/analytics?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setTrend(data.trend);
        setTraitBreakdown(data.traitBreakdown);
        setWordFrequency(data.wordFrequency);
      });
  }, [cycleId, refreshKey]);

  const scopeLabel =
    cycleId === "all"
      ? "Cumulative, across all cycles."
      : `For ${cycles.find((c) => c.id === cycleId)?.name ?? "this cycle"}.`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">HR Team</p>
          <h1 className="mt-2 text-4xl font-medium text-ink">Nominations</h1>
        </div>
        <div className="flex items-center gap-3">
          <ExportPdfButton cycleId={cycleId} />
          <ExportButton queryString={buildQuery()} />
        </div>
      </div>

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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <TrendChart data={trend} />
        <TraitBreakdownChart data={traitBreakdown} scopeLabel={scopeLabel} />
        <WordFrequencyPanel data={wordFrequency} scopeLabel={scopeLabel} />
      </div>

      <FilterRow
        cycles={cycles}
        cycleId={cycleId}
        onCycleChange={setCycleId}
        trait={trait}
        onTraitChange={setTrait}
        country={country}
        onCountryChange={setCountry}
        q={q}
        onQChange={setQ}
      />

      <NominationsTable nominations={nominations} selectedId={selected?.id ?? null} onSelect={setSelected} />

      <NominationDrawer
        nomination={selected}
        onClose={() => setSelected(null)}
        onDeleted={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

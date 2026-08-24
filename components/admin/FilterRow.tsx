"use client";

import { Search } from "lucide-react";
import { TRAITS, type TraitKey } from "@/lib/traits";
import { PARTICIPATING_COUNTRIES as COUNTRIES } from "@/lib/countries";

interface CycleOption {
  id: string;
  name: string;
  status: string;
}

interface FilterRowProps {
  cycles: CycleOption[];
  cycleId: string;
  onCycleChange: (id: string) => void;
  trait: TraitKey | null;
  onTraitChange: (trait: TraitKey | null) => void;
  country: string;
  onCountryChange: (code: string) => void;
  q: string;
  onQChange: (q: string) => void;
}

const TRAIT_PILL_LABELS: Record<TraitKey, string> = {
  PUT_PATIENTS_FIRST: "Patients First",
  ADOPT_EXCELLENCE: "Excellence",
  FOSTER_MUTUAL_ACCOUNTABILITY: "Accountability",
  LEAD_WITH_INNOVATION: "Innovation",
};

export function FilterRow({
  cycles,
  cycleId,
  onCycleChange,
  trait,
  onTraitChange,
  country,
  onCountryChange,
  q,
  onQChange,
}: FilterRowProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={cycleId}
          onChange={(e) => onCycleChange(e.target.value)}
          className="h-10 rounded-full border-[1.5px] border-border-strong bg-white px-4 text-sm text-ink outline-none focus:border-indigo"
        >
          <option value="all">All cycles</option>
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.status === "OPEN" ? " (open)" : ""}
            </option>
          ))}
        </select>

        <select
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="h-10 rounded-full border-[1.5px] border-border-strong bg-white px-4 text-sm text-ink outline-none focus:border-indigo"
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="relative min-w-[240px] flex-1">
          <Search
            size={16}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-ghost"
          />
          <input
            type="text"
            placeholder="Search nominee or nominator"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            className="h-10 w-full rounded-full border-[1.5px] border-border-strong bg-white pl-10 pr-4 text-sm text-ink outline-none focus:border-indigo"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTraitChange(null)}
          className={`h-9 rounded-full px-4 text-sm font-medium transition ${
            trait === null ? "bg-indigo text-white" : "bg-white text-ink-body border border-border-strong"
          }`}
        >
          All traits
        </button>
        {TRAITS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTraitChange(t.key)}
            className={`h-9 rounded-full px-4 text-sm font-medium transition ${
              trait === t.key
                ? "bg-indigo text-white"
                : "bg-white text-ink-body border border-border-strong"
            }`}
          >
            {TRAIT_PILL_LABELS[t.key]}
          </button>
        ))}
      </div>
    </div>
  );
}

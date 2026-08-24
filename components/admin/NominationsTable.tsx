"use client";

import { formatDistanceToNow, format } from "date-fns";
import { TRAIT_MAP, type TraitKey } from "@/lib/traits";
import type { SerializedNomination } from "@/lib/serialize";

interface NominationsTableProps {
  nominations: SerializedNomination[];
  selectedId: string | null;
  onSelect: (n: SerializedNomination) => void;
}

const GRID_COLS = "grid-cols-[1.2fr_1fr_1.6fr_1fr_0.8fr]";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function NominationsTable({ nominations, selectedId, onSelect }: NominationsTableProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-white shadow-card-lg">
      <div className="overflow-x-auto">
        <div className="min-w-[880px]">
          <div
            className={`grid ${GRID_COLS} gap-4 border-b border-border bg-offwhite px-6 py-3`}
          >
            {["Nominee", "Country", "Core traits", "Nominated by", "Submitted"].map((label) => (
              <span
                key={label}
                className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-faint"
              >
                {label}
              </span>
            ))}
          </div>

          {nominations.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-ink-ghost">
              No nominations match these filters.
            </div>
          )}

          {nominations.map((n) => {
            const selected = n.id === selectedId;
            return (
              <button
                key={n.id}
                onClick={() => onSelect(n)}
                className={`grid w-full ${GRID_COLS} items-center gap-4 border-b border-border px-6 py-4 text-left transition last:border-b-0 hover:bg-pale-indigo ${
                  selected ? "bg-pale-indigo" : ""
                }`}
              >
                <span className="flex items-center gap-3 truncate">
                  <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-pale-indigo text-xs font-medium text-indigo">
                    {initials(n.nomineeName)}
                  </span>
                  <span className="truncate text-[15px] font-medium text-ink">{n.nomineeName}</span>
                </span>
                <span className="truncate text-sm text-ink-body">{n.countryName}</span>
                <span className="flex flex-wrap gap-1.5">
                  {n.traits.map((t: TraitKey) => (
                    <span
                      key={t}
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: TRAIT_MAP[t].tint, color: TRAIT_MAP[t].accent }}
                    >
                      {TRAIT_MAP[t].label}
                    </span>
                  ))}
                </span>
                <span className="truncate text-sm text-ink-body">{n.nominatorName}</span>
                <span
                  className="truncate text-sm text-ink-ghost"
                  title={format(new Date(n.createdAt), "d MMMM yyyy, HH:mm")}
                >
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

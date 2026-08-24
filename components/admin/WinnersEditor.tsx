"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TRAITS, type TraitKey } from "@/lib/traits";

interface Winner {
  id: string;
  nomineeName: string;
  trait: TraitKey;
}

export function WinnersEditor({ cycleId }: { cycleId: string }) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [drafts, setDrafts] = useState<Record<TraitKey, string>>({
    PUT_PATIENTS_FIRST: "",
    ADOPT_EXCELLENCE: "",
    FOSTER_MUTUAL_ACCOUNTABILITY: "",
    LEAD_WITH_INNOVATION: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch(`/api/admin/cycles/${cycleId}/winners`)
      .then((r) => r.json())
      .then((data) => {
        setWinners(data.winners);
        setLoading(false);
      });
  }

  useEffect(load, [cycleId]);

  async function addWinner(trait: TraitKey) {
    const nomineeName = drafts[trait].trim();
    if (nomineeName.length < 2) return;
    setError(null);
    const res = await fetch(`/api/admin/cycles/${cycleId}/winners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomineeName, trait }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't add that winner.");
      return;
    }
    setDrafts((d) => ({ ...d, [trait]: "" }));
    load();
  }

  async function removeWinner(winnerId: string) {
    await fetch(`/api/admin/cycles/${cycleId}/winners/${winnerId}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="rounded-2xl border border-border bg-offwhite p-5">
      <p className="text-sm font-medium text-ink">Winners for this cycle</p>
      <p className="mt-1 text-[13px] text-ink-faint">
        One winner per Core Trait category. Names only - visible to employees once
        results are published.
      </p>

      {loading ? (
        <p className="mt-3 text-sm text-ink-ghost">Loading…</p>
      ) : (
        <div className="mt-4 space-y-3">
          {TRAITS.map((trait) => {
            const winner = winners.find((w) => w.trait === trait.key);
            return (
              <div key={trait.key} className="flex items-center gap-3">
                <span
                  className="w-56 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: trait.tint, color: trait.accent }}
                >
                  {trait.label}
                </span>
                {winner ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-pale-indigo px-3 py-1.5 text-sm font-medium text-indigo">
                    {winner.nomineeName}
                    <button
                      onClick={() => removeWinner(winner.id)}
                      aria-label={`Remove ${winner.nomineeName}`}
                      className="text-indigo/60 hover:text-deep-red"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </span>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addWinner(trait.key);
                    }}
                    className="flex flex-1 gap-2"
                  >
                    <input
                      type="text"
                      value={drafts[trait.key]}
                      onChange={(e) => setDrafts((d) => ({ ...d, [trait.key]: e.target.value }))}
                      placeholder="Winner's name"
                      className="h-9 flex-1 rounded-input border-[1.5px] border-border-strong px-3 text-sm text-ink outline-none focus:border-indigo"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-indigo px-3.5 text-sm font-medium text-white transition hover:bg-indigo-hover"
                    >
                      Add
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-deep-red">{error}</p>}
    </div>
  );
}

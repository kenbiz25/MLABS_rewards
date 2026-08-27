"use client";

import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { TRAITS, type TraitKey } from "@/lib/traits";
import type { SerializedWinner } from "@/lib/serialize";

const EMPTY_DRAFT = { nomineeName: "", traits: [] as TraitKey[], justification: "" };

export function WinnersEditor({ cycleId }: { cycleId: string }) {
  const [winners, setWinners] = useState<SerializedWinner[]>([]);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  function toggleDraftTrait(trait: TraitKey) {
    setDraft((d) => ({
      ...d,
      traits: d.traits.includes(trait) ? d.traits.filter((t) => t !== trait) : [...d.traits, trait],
    }));
  }

  async function addWinner(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cycles/${cycleId}/winners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't add that winner.");
        return;
      }
      setDraft(EMPTY_DRAFT);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function removeWinner(winnerId: string) {
    await fetch(`/api/admin/cycles/${cycleId}/winners/${winnerId}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="rounded-2xl border border-border bg-offwhite p-5">
      <p className="text-sm font-medium text-ink">Winners for this cycle</p>
      <p className="mt-1 text-[13px] text-ink-faint">
        Add a winner with the Core Trait(s) they're being recognized for and why - visible to
        employees once results are published.
      </p>

      {loading ? (
        <p className="mt-3 text-sm text-ink-ghost">Loading…</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white">
          <div className="grid grid-cols-[1fr_1.4fr_1.6fr_auto] gap-3 border-b border-border bg-offwhite px-4 py-2.5">
            {["Name", "Core traits", "Justification", ""].map((label) => (
              <span key={label} className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-faint">
                {label}
              </span>
            ))}
          </div>

          {winners.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-ghost">No winners added yet.</p>
          )}

          {winners.map((w) => (
            <div
              key={w.id}
              className="grid grid-cols-[1fr_1.4fr_1.6fr_auto] items-start gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <span className="text-sm font-medium text-ink">{w.nomineeName}</span>
              <span className="flex flex-wrap gap-1.5">
                {w.traits.map((t) => {
                  const trait = TRAITS.find((tr) => tr.key === t);
                  if (!trait) return null;
                  return (
                    <span
                      key={t}
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: trait.tint, color: trait.accent }}
                    >
                      {trait.label}
                    </span>
                  );
                })}
              </span>
              <span className="text-sm leading-relaxed text-ink-body">{w.justification}</span>
              <button
                onClick={() => removeWinner(w.id)}
                aria-label={`Remove ${w.nomineeName}`}
                className="mt-0.5 text-ink-faint hover:text-deep-red"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>
          ))}

          <form
            onSubmit={addWinner}
            className="grid grid-cols-[1fr_1.4fr_1.6fr_auto] items-start gap-3 px-4 py-3.5"
          >
            <input
              type="text"
              value={draft.nomineeName}
              onChange={(e) => setDraft((d) => ({ ...d, nomineeName: e.target.value }))}
              placeholder="Winner's name"
              className="h-9 w-full rounded-input border-[1.5px] border-border-strong px-3 text-sm text-ink outline-none focus:border-indigo"
            />
            <div className="flex flex-wrap gap-1.5">
              {TRAITS.map((trait) => {
                const selected = draft.traits.includes(trait.key);
                return (
                  <button
                    key={trait.key}
                    type="button"
                    onClick={() => toggleDraftTrait(trait.key)}
                    className={`rounded-full border-[1.5px] px-2.5 py-1 text-xs font-medium transition ${
                      selected ? "border-transparent" : "border-border-strong bg-transparent text-ink-faint"
                    }`}
                    style={selected ? { backgroundColor: trait.tint, color: trait.accent } : undefined}
                  >
                    {trait.label}
                  </button>
                );
              })}
            </div>
            <textarea
              value={draft.justification}
              onChange={(e) => setDraft((d) => ({ ...d, justification: e.target.value }))}
              placeholder="Why did this person win?"
              rows={2}
              className="w-full rounded-input border-[1.5px] border-border-strong p-2.5 text-sm text-ink outline-none focus:border-indigo"
            />
            <button
              type="submit"
              disabled={saving}
              aria-label="Add winner"
              className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo text-white transition hover:bg-indigo-hover disabled:opacity-60"
            >
              <Plus size={16} strokeWidth={2} />
            </button>
          </form>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-deep-red">{error}</p>}
    </div>
  );
}

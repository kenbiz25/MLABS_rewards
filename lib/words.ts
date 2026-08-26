// "Recurring words" surfaces concepts connected to Medtronic LABS' Core
// Traits and adjacent organizational values - not incidental nouns, verbs,
// or dates that happen to appear in a specific anecdote. Rather than a raw
// stopword-filtered frequency count (which surfaces whatever words a
// submission happened to use - "clinic", "data", "days", "temporary"), we
// match against a curated set of value concepts and count how often each
// one appears, rolling word variants (collaborate/collaboration/
// collaborative) up under one label.
const VALUE_TERMS: { label: string; stems: string[] }[] = [
  { label: "patients first", stems: ["patient"] },
  { label: "impact", stems: ["impact"] },
  { label: "excellence", stems: ["excellen"] },
  { label: "integrity", stems: ["integrit"] },
  { label: "quality", stems: ["quality"] },
  { label: "accountability", stems: ["account"] },
  { label: "collaboration", stems: ["collab"] },
  { label: "teamwork", stems: ["team"] },
  { label: "trust", stems: ["trust"] },
  { label: "communication", stems: ["communicat"] },
  { label: "alignment", stems: ["align"] },
  { label: "ownership", stems: ["ownership"] },
  { label: "responsibility", stems: ["responsib"] },
  { label: "transparency", stems: ["transparen"] },
  { label: "partnership", stems: ["partner"] },
  { label: "innovation", stems: ["innovat"] },
  { label: "creativity", stems: ["creativ"] },
  { label: "initiative", stems: ["initiativ"] },
  { label: "leadership", stems: ["leader"] },
  { label: "dedication", stems: ["dedicat"] },
  { label: "commitment", stems: ["commit"] },
  { label: "compassion", stems: ["compassion"] },
  { label: "empathy", stems: ["empath"] },
  { label: "resilience", stems: ["resilien"] },
  { label: "growth", stems: ["growth"] },
  { label: "results", stems: ["result"] },
  { label: "mentorship", stems: ["mentor"] },
  { label: "recognition", stems: ["recogni"] },
  { label: "care", stems: ["care", "caring"] },
];

export interface WordCount {
  word: string;
  count: number;
}

export function wordFrequency(texts: string[], topN = 20): WordCount[] {
  const counts = new Map<string, number>();
  for (const term of VALUE_TERMS) counts.set(term.label, 0);

  for (const text of texts) {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    for (const word of words) {
      const term = VALUE_TERMS.find((t) => t.stems.some((stem) => word.startsWith(stem)));
      if (term) counts.set(term.label, (counts.get(term.label) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .filter((w) => w.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

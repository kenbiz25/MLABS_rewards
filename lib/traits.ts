import { HeartPulse, Award, Handshake, Lightbulb, type LucideIcon } from "lucide-react";

export type TraitKey =
  | "PUT_PATIENTS_FIRST"
  | "ADOPT_EXCELLENCE"
  | "FOSTER_MUTUAL_ACCOUNTABILITY"
  | "LEAD_WITH_INNOVATION";

export interface TraitDef {
  key: TraitKey;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  tint: string;
}

export const TRAITS: TraitDef[] = [
  {
    key: "PUT_PATIENTS_FIRST",
    label: "Put Patients First",
    description:
      "Recognizing the impact we make on patient lives by taking action that makes a meaningful difference in global health systems.",
    icon: HeartPulse,
    accent: "#C35721",
    tint: "#FCEEE4",
  },
  {
    key: "ADOPT_EXCELLENCE",
    label: "Adopt Excellence",
    description:
      "Motivated to operate with high integrity, innovate, and strive to be the best in our field.",
    icon: Award,
    accent: "#00A372",
    tint: "#E6F9F0",
  },
  {
    key: "FOSTER_MUTUAL_ACCOUNTABILITY",
    label: "Foster Mutual Accountability",
    description:
      "Setting clear goals, staying connected and accountable to each other, and aligning our efforts to achieve results.",
    icon: Handshake,
    accent: "#6165DE",
    tint: "#EFEDFF",
  },
  {
    key: "LEAD_WITH_INNOVATION",
    label: "Lead with Innovation",
    description:
      "Challenging the status quo and delivering breakthroughs that advance global health and primary care.",
    icon: Lightbulb,
    accent: "#2514BE",
    tint: "#E7E4FA",
  },
];

export const TRAIT_MAP: Record<TraitKey, TraitDef> = TRAITS.reduce(
  (acc, t) => ({ ...acc, [t.key]: t }),
  {} as Record<TraitKey, TraitDef>
);

export const TRAIT_KEYS = TRAITS.map((t) => t.key) as [TraitKey, ...TraitKey[]];

export function traitLabel(key: string): string {
  return TRAIT_MAP[key as TraitKey]?.label ?? key;
}

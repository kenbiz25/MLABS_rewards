import type { Nomination, CycleWinner } from "@prisma/client";
import type { TraitKey } from "./traits";

export interface SerializedNomination {
  id: string;
  cycleId: string;
  nomineeName: string;
  countryCode: string;
  countryName: string;
  traits: TraitKey[];
  momentText: string;
  impactText: string;
  nominatorName: string;
  nominatorEmail: string;
  createdAt: string;
}

export function serializeNomination(n: Nomination): SerializedNomination {
  return {
    id: n.id,
    cycleId: n.cycleId,
    nomineeName: n.nomineeName,
    countryCode: n.countryCode,
    countryName: n.countryName,
    traits: JSON.parse(n.traits) as TraitKey[],
    momentText: n.momentText,
    impactText: n.impactText,
    nominatorName: n.nominatorName,
    nominatorEmail: n.nominatorEmail,
    createdAt: n.createdAt.toISOString(),
  };
}

export interface SerializedWinner {
  id: string;
  cycleId: string;
  nomineeName: string;
  traits: TraitKey[];
  justification: string;
  createdAt: string;
}

export function serializeWinner(w: CycleWinner): SerializedWinner {
  return {
    id: w.id,
    cycleId: w.cycleId,
    nomineeName: w.nomineeName,
    traits: JSON.parse(w.traits) as TraitKey[],
    justification: w.justification,
    createdAt: w.createdAt.toISOString(),
  };
}

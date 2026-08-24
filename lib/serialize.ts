import type { Nomination } from "@prisma/client";
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

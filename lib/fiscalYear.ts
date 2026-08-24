const FY_LABEL_RE = /^FY(\d+)\s*Q([1-4])$/i;

// Cycles are named by financial year and quarter (e.g. "FY27 Q1"), not
// calendar year. Given the most recently created cycle's name, suggest the
// next label in sequence so admins never have to track it by hand.
export function nextFyLabel(previousName?: string | null): string {
  if (previousName) {
    const match = previousName.trim().match(FY_LABEL_RE);
    if (match) {
      const fy = parseInt(match[1], 10);
      const quarter = parseInt(match[2], 10);
      return quarter < 4 ? `FY${fy} Q${quarter + 1}` : `FY${fy + 1} Q1`;
    }
  }
  return "FY27 Q1";
}

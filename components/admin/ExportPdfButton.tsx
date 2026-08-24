import Link from "next/link";
import { FileText } from "lucide-react";

export function ExportPdfButton({ cycleId }: { cycleId: string }) {
  const qs = cycleId !== "all" ? `?cycleId=${cycleId}` : "";
  return (
    <Link
      href={`/admin/nominations/summary${qs}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] border-border-strong px-4 text-sm font-medium text-ink transition hover:border-indigo hover:text-indigo"
    >
      <FileText size={16} strokeWidth={1.75} />
      Export PDF
    </Link>
  );
}

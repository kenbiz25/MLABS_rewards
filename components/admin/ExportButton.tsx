"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
  queryString: string;
}

export function ExportButton({ queryString }: ExportButtonProps) {
  return (
    <a
      href={`/api/admin/nominations/export${queryString}`}
      className="inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] border-border-strong px-4 text-sm font-medium text-ink transition hover:border-indigo hover:text-indigo"
    >
      <Download size={16} strokeWidth={1.75} />
      Export CSV
    </a>
  );
}

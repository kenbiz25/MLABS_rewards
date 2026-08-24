import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { SummaryPrintView } from "@/components/admin/SummaryPrintView";

export default async function NominationsSummaryPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return (
    <Suspense>
      <SummaryPrintView />
    </Suspense>
  );
}

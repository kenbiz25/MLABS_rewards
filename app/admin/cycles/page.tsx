import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { CycleManager } from "@/components/admin/CycleManager";

export default async function AdminCyclesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="min-h-screen bg-offwhite">
      <AdminTopBar active="cycles" />
      <main className="mx-auto max-w-dashboard px-6 py-10 sm:px-10">
        <CycleManager />
      </main>
    </div>
  );
}

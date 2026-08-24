import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Dashboard } from "@/components/admin/Dashboard";

export default async function AdminNominationsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="min-h-screen bg-offwhite">
      <AdminTopBar active="nominations" />
      <main className="mx-auto max-w-dashboard px-6 py-10 sm:px-10">
        <Dashboard />
      </main>
    </div>
  );
}

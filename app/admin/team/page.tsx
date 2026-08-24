import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminUserManager } from "@/components/admin/AdminUserManager";

export default async function AdminTeamPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="min-h-screen bg-offwhite">
      <AdminTopBar active="team" />
      <main className="mx-auto max-w-dashboard px-6 py-10 sm:px-10">
        <AdminUserManager />
      </main>
    </div>
  );
}

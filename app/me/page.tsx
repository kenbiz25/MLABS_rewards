import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmployeeHome } from "@/components/EmployeeHome";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <EmployeeHome name={user.name} isAdmin={user.isAdmin} />
      </main>
      <Footer />
    </div>
  );
}

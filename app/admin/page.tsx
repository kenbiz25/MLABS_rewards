import { redirect } from "next/navigation";

// Kept as a redirect so old bookmarks/links to /admin still work.
export default function AdminIndexPage() {
  redirect("/login");
}

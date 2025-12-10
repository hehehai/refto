import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/session";

const SiteUpsertSheet = dynamic(
  () => import("@/components/features/admin/site-upsert-sheet")
);
const SiteDetailSheet = dynamic(
  () => import("@/components/features/admin/site-detail-sheet")
);
const WeeklyUpsetSheet = dynamic(
  () => import("@/components/features/admin/weekly-upset-dialog")
);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    return redirect("/signin");
  }

  if (session.user.role === "USER") {
    return redirect("/");
  }

  return (
    <SidebarProvider>
      <AdminSidebar user={session.user} />
      <SidebarInset>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
      <SiteUpsertSheet />
      <SiteDetailSheet />
      <WeeklyUpsetSheet />
    </SidebarProvider>
  );
}

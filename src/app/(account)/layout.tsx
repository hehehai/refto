import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/features/account/account-sidebar";
import { SiteHeader } from "@/components/features/site/site-header";
import { getSession } from "@/lib/session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader filter={false} user={session.user} />
      <div className="container mx-auto py-6">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          <aside className="w-full shrink-0 md:w-64">
            <AccountSidebar />
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

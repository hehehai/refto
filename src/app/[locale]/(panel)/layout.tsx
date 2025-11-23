import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { PanelHeader } from "@/app/_components/panel-header";
import { getSession } from "@/lib/session";

const RefSiteUpsetDialog = dynamic(
  () => import("./_components/ref-site-upset-dialog")
);
const RefSiteDetailSheet = dynamic(
  () => import("./_components/ref-site-detail-sheet")
);
const WeeklyUpsetSheet = dynamic(
  () => import("./_components/weekly-upset-dialog")
);

export default async function PanelLayout({
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
    <div className="relative h-screen">
      <PanelHeader user={session.user} />
      <main className="h-[calc(100vh-64px)] overflow-auto">{children}</main>
      <RefSiteUpsetDialog />
      <RefSiteDetailSheet />
      <WeeklyUpsetSheet />
    </div>
  );
}

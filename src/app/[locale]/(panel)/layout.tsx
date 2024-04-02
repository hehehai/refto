import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { PanelHeader } from "../../_components/panel-header";
import { getSession } from "@/lib/session";
import { RefSiteUpsetDialog } from "./_components/ref-site-upset-dialog";
import { RefSiteDetailSheet } from "./_components/ref-site-detail-sheet";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    return notFound();
  }

  if (session.user.role === "USER") {
    return redirect("/");
  }

  return (
    <div className="relative h-screen">
      <PanelHeader user={session.user} />
      <main className="h-[calc(100vh-64px)] overflow-auto">{children}</main>
      <Suspense fallback={null}>
        <RefSiteUpsetDialog />
      </Suspense>
      <Suspense fallback={null}>
        <RefSiteDetailSheet />
      </Suspense>
    </div>
  );
}

import { SiteHeader } from "@/components/features/site/site-header";
import { getSession } from "@/lib/session";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div>
      <SiteHeader filter={false} user={session?.user} />
      <main>{children}</main>
    </div>
  );
}

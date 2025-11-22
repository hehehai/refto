import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await getSession();

  if (session?.user) {
    return notFound();
  }

  return <div className="min-h-screen">{children}</div>;
}

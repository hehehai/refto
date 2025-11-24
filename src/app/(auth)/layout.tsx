import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/shared/auth/auth-layout";
import { getSession } from "@/lib/session";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: AuthLayoutProps) {
  const session = await getSession();

  if (session?.user) {
    return redirect("/");
  }

  return <AuthLayout>{children}</AuthLayout>;
}

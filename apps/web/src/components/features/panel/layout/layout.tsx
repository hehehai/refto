import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { NavUserProps } from "./nav-user";
import { AppSidebar } from "./sidebar";

interface PanelLayoutProps {
  children: React.ReactNode;
  user?: NavUserProps["user"] | null;
}

export default function PanelLayout({ children, user }: PanelLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteDetailDrawer } from "../sites/detail/site-detail-drawer";
import { UserDetailDrawer } from "../users/user-detail-drawer";
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
      <SiteDetailDrawer />
      <UserDetailDrawer />
    </SidebarProvider>
  );
}

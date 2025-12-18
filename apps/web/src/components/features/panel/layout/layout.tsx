import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteDetailSheet } from "../sites/detail/site-detail-sheet";
import { SiteEditSheet } from "../sites/edit/site-edit-sheet";
import { UserDetailSheet } from "../users/user-detail-sheet";
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
      <SiteDetailSheet />
      <SiteEditSheet />
      <UserDetailSheet />
      <ConfirmDialog />
    </SidebarProvider>
  );
}

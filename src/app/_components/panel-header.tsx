import Link from "next/link";
import type { Session } from "next-auth";
import { UserAccountNav } from "@/components/shared/user-account-nav";
import { site } from "@/lib/config/site";
import { outfit } from "@/lib/font";
import { cn } from "@/lib/utils";
import { AddSiteButton } from "./add-site-button";
import { PanelNav } from "./panel-nav";

interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Session["user"];
}

export const PanelHeader = ({ user }: PanelHeaderProps) => (
  <div className="sticky inset-x-0 top-0 flex h-16 w-full items-center justify-between border-zinc-100 border-b px-5 dark:border-zinc-900">
    <div>
      <Link
        className={cn("font-medium text-4xl text-foreground", outfit.className)}
        href={"/"}
      >
        {site.name}
      </Link>
    </div>
    <div className="container h-full grow">
      <PanelNav className="flex h-full items-stretch space-x-8 px-8 lg:px-[82px]" />
    </div>
    <div className="flex flex-center space-x-3">
      <AddSiteButton />
      <UserAccountNav user={user} />
    </div>
  </div>
);

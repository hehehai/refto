import Link from "next/link";
import { UserAuthNav } from "@/components/features/auth/user-auth-nav";
import { SendIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/config/site";
import { outfit } from "@/lib/font";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { SiteFilterCommand } from "./site-filter-dialog";
import { SubmitDialog } from "./submit-dialog";

interface SiteHeaderProps {
  filter?: boolean;
  user?: SessionUser | null;
}

export const SiteHeader = ({ filter = true, user }: SiteHeaderProps) => (
  <div className="w-full">
    <div className="max-auto container flex h-20 items-center justify-between">
      <div>
        <Link
          className={cn(
            "font-medium text-[32px] text-foreground md:text-[40px]",
            outfit.className
          )}
          href={"/"}
        >
          {site.name}
        </Link>
      </div>
      <div className="flex flex-center space-x-3">
        {filter && <SiteFilterCommand />}
        <SubmitDialog>
          <Button className="rounded-full" variant={"secondary"}>
            <SendIcon className="text-xl" />
            <span className="hidden md:inline">Submit</span>
          </Button>
        </SubmitDialog>
        <UserAuthNav user={user} />
      </div>
    </div>
  </div>
);

import Link from "next/link";
import { SendIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/config/site";
import { outfit } from "@/lib/font";
import { cn } from "@/lib/utils";
import { SiteFilterCommand } from "./site-filter-dialog";
import { SiteMenu } from "./site-menu";
import { SubmitDialog } from "./submit-dialog";

export const SiteHeader = async ({ filter = true }: { filter?: boolean }) => (
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
          <Button className="space-x-2 rounded-full" variant={"secondary"}>
            <SendIcon className="text-xl" />
            <span className="hidden md:inline">Submit</span>
          </Button>
        </SubmitDialog>
        <SiteMenu />
      </div>
    </div>
  </div>
);

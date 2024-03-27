import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SendIcon, AboutIcon } from "@/components/shared/icons";
import { SiteFilterCommand } from "./site-filter-dialog";
import { site } from "@/lib/config/site";
import { SubmitDialog } from "./submit-dialog";
import { cn } from "@/lib/utils";
import { outfit } from "@/lib/font";

export const SiteHeader = ({ filter = true }: { filter?: boolean }) => {
  return (
    <div className="w-full">
      <div className="max-auto container flex h-20 items-center justify-between">
        <div>
          <Link
            href={"/"}
            className={cn(
              "text-[32px] font-medium text-foreground md:text-[40px]",
              outfit.className,
            )}
          >
            {site.name}
          </Link>
        </div>
        <div className="flex-center flex space-x-3">
          {filter && <SiteFilterCommand />}
          <SubmitDialog>
            <Button variant={"secondary"} className="space-x-2 rounded-full">
              <SendIcon className="text-xl"></SendIcon>
              <span className="hidden md:inline">Submit</span>
            </Button>
          </SubmitDialog>
          <Button
            variant={"secondary"}
            className="space-x-2 rounded-full"
            asChild
          >
            <Link href="/about">
              <AboutIcon className="text-xl"></AboutIcon>
              <span className="hidden md:inline">About</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

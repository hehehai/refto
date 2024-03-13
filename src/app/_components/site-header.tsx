import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SendIcon, AboutIcon } from "@/components/shared/icons";
import { SiteFilterCommand } from "./site-filter-dialog";
import { site } from "@/lib/config/site";

export const SiteHeader = ({ filter = true }: { filter?: boolean }) => {
  return (
    <div className="w-full">
      <div className="max-auto container flex h-20 items-center justify-between">
        <div>
          <Link href={"/"} className="text-[34px] md:text-[40px] font-medium text-foreground">
            {site.name}
          </Link>
        </div>
        <div className="flex-center flex space-x-3">
          {filter && <SiteFilterCommand />}
          <Button variant={"secondary"} className="rounded-full space-x-2" asChild>
            <a href="mailto:riverhohai@gmail.com?subject=Refto Website recommendation">
              <SendIcon className="text-xl"></SendIcon>
              <span className="hidden md:inline">Submit</span>
            </a>
          </Button>
          <Button variant={"secondary"} className="rounded-full space-x-2" asChild>
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

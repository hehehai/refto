import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SendIcon, AboutIcon } from "@/components/shared/icons";
import { SiteFilterCommand } from "./site-filter-dialog";
import { site } from "@/lib/config/site";

export const SiteHeader = () => {
  return (
    <div className="w-full">
      <div className="max-auto container flex h-20 items-center justify-between">
        <div>
          <Link href={"/"} className="text-[40px] font-medium text-foreground">
            {site.name}
          </Link>
        </div>
        <div className="flex-center flex space-x-3">
          <SiteFilterCommand />
          <Button variant={"secondary"} className="rounded-full">
            <SendIcon className="mr-2 text-xl"></SendIcon>
            <span>Submit</span>
          </Button>
          <Button variant={"secondary"} className="rounded-full" asChild>
            <Link href="/about">
              <AboutIcon className="mr-2 text-xl"></AboutIcon>
              <span>About</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { MenuIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const SiteMenu = () => {
  const { setTheme, theme = "system" } = useTheme();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="space-x-2 rounded-full" variant={"secondary"}>
          <MenuIcon className="text-xl" />
          <span className="hidden md:inline">Menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex flex-col space-y-2 rounded-2xl border-zinc-100 text-right shadow-none dark:border-zinc-900"
        sideOffset={10}
      >
        <div className="group inline-flex items-center justify-end space-x-4">
          <Link href="/about">
            <span>About</span>
          </Link>
          <span className="h-px w-5 bg-zinc-700 transition-all group-hover:w-[30px]" />
        </div>
        <div className="group inline-flex items-center justify-end space-x-4">
          {["light", "dark", "system"].map((mode) => (
            <button
              className={cn("cursor-pointer capitalize hover:text-foreground", {
                "text-foreground/55": theme !== mode,
              })}
              key={mode}
              onClick={() => setTheme(mode)}
              type="button"
            >
              {mode}
            </button>
          ))}
          <span className="h-px w-5 bg-zinc-700 transition-all group-hover:w-[30px]" />
        </div>
      </PopoverContent>
    </Popover>
  );
};

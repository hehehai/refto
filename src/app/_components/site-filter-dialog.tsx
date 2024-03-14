"use client";

import * as React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { cn, getSearchParams } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FilterIcon,
} from "@/components/shared/icons";
import { siteTagMap } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const tagOptions = Object.entries(siteTagMap).map(([value, item]) => ({
  label: item.en,
  value,
}));

export function SiteFilterCommand() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = getSearchParams(searchParams);

  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputLock, setInputLock] = React.useState(false);
  const [search, setSearch] = React.useState(params.s || "");
  const [selected, setSelected] = React.useState<string[]>(
    params.tags?.split(",").filter(Boolean) || [],
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // 获取 查询参数， 初始化 search 和 checkbox

  const handleConfirm = () => {
    console.log("search", search);
    console.log("selected", selected);

    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("s", search);
    newSearchParams.set("tags", selected.join(","));
    router.push(`${pathname}?${newSearchParams.toString()}`);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        // 获取所有 cmdk-group-items 属性元素的子元素，筛选元素 data-selected="true" 的元素，设置聚焦
        const items = document.querySelectorAll<HTMLDivElement>(
          'div[cmdk-group-items] > [data-selected="true"]',
        );
        if (items.length) {
          const [activeEl] = items;
          // 如果为上， 设置为当前元素的上一个元素， 如果为下，设置为当前元素的下一个元素
          // 如果上一个元素，不存在， 则需要让 input 聚焦
          if (e.key === "ArrowUp") {
            const prev = activeEl?.previousElementSibling;
            if (prev) {
              prev.querySelector("label")?.focus();
            } else if (inputRef.current) {
              inputRef.current.focus();
            }
          } else if (e.key === "ArrowDown") {
            activeEl?.nextElementSibling?.querySelector("label")?.focus();
          }
        }
        break;
      case "Enter":
        if (!inputLock) {
          handleConfirm();
        }
        break;
      case "Escape":
        setSearch(params.s || "");
        setSelected(params.tags?.split(",") || []);
        setOpen(false);
        break;
    }
  };

  const commandProps = React.useMemo(
    () => ({
      className: "[&_[cmdk-input]]:h-14",
      shouldFilter: false,
      onKeyDown: handleKeyDown,
    }),
    [handleKeyDown],
  );

  const filterPreview = React.useMemo(() => {
    const search = params.s || "";
    const tags = params.tags?.split(",").filter(Boolean) || [];
    if (!search.trim() && tags.length === 0) {
      return <div>Filter</div>;
    }
    const showTags = tags.slice(0, 3);
    return (
      <div className="flex items-center space-x-1">
        <div className="max-w-[60px] truncate">{search}</div>
        {tags.length > 0 && showTags.map((tag) => <span key={tag}>{tag}</span>)}
        {tags.length > 3 && <span>... ${tags.length - 3}+</span>}
      </div>
    );
  }, [params]);

  return (
    <>
      <div
        className={cn(
          buttonVariants({ variant: "outline" }),
          "relative cursor-pointer rounded-full border-zinc-200 pr-12 hover:border-foreground hover:bg-background",
        )}
        onClick={() => setOpen(true)}
      >
        {filterPreview}
        <div className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-white">
          <FilterIcon className="text-lg" />
        </div>
      </div>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        commandProps={commandProps}
      >
        <CommandInput
          ref={inputRef}
          placeholder="Type search for site name / title / url ..."
          wrapperClassname="px-4"
          className="text-md"
          onCompositionStart={() => {
            setInputLock(true);
          }}
          onCompositionEnd={() => {
            setInputLock(false);
          }}
          value={search}
          onInput={(e) => setSearch(e.currentTarget.value)}
        >
          <CommandShortcut>⌘K</CommandShortcut>
        </CommandInput>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Ref site tags">
            {tagOptions.map((tag) => (
              <CommandItem key={tag.value} value={tag.value} className="p-0">
                <label
                  htmlFor={tag.value}
                  className="flex w-full items-center space-x-2 px-1 py-3"
                >
                  <Checkbox
                    id={tag.value}
                    checked={selected.includes(tag.value)}
                    onCheckedChange={(value) => {
                      if (value) {
                        setSelected([...selected, tag.value]);
                      } else {
                        setSelected(
                          selected.filter((item) => item !== tag.value),
                        );
                      }
                    }}
                  />
                  <span>{tag.label}</span>
                </label>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <div className="flex items-center justify-between border-t border-zinc-200 p-3 max-md:hidden">
          <div>
            <span className="flex items-center space-x-1">
              <CommandShortcut className="px-0.5 py-0.5">
                <ArrowUpIcon className="text-md" />
              </CommandShortcut>
              <CommandShortcut className="px-0.5 py-0.5">
                <ArrowDownIcon className="text-md" />
              </CommandShortcut>
              <span className="text-xs text-zinc-700">Move</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <CommandShortcut className="py-0.5">Space</CommandShortcut>
              <span className="text-xs text-zinc-700">Select Tag</span>
            </span>
            <span className="flex items-center space-x-1">
              <CommandShortcut className="py-0.5">Enter</CommandShortcut>
              <span className="text-xs text-zinc-700">Confirm Filter</span>
            </span>
            <span className="flex items-center space-x-1">
              <CommandShortcut className="py-0.5">ESC</CommandShortcut>
              <span className="text-xs text-zinc-700">Close</span>
            </span>
          </div>
        </div>
        <div
          className="border-t border-zinc-200 p-3 md:hidden"
          onClick={() => {
            if (!inputLock) {
              handleConfirm();
            }
          }}
        >
          <Button className="w-full">Confirm Filter</Button>
        </div>
      </CommandDialog>
    </>
  );
}

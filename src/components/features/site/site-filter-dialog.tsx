"use client";

import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import * as React from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FilterIcon,
} from "@/components/shared/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { siteTagMap } from "@/lib/constants";
import { homeSearchParsers } from "@/lib/search-params";
import { cn } from "@/lib/utils";

export function SiteFilterCommand() {
  const tagOptions = React.useMemo(
    () =>
      Object.entries(siteTagMap).map(([value, label]) => ({
        label,
        value,
      })),
    []
  );

  const [params, setParams] = useQueryStates(homeSearchParsers, {
    shallow: false,
  });

  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputLock, setInputLock] = React.useState(false);
  // Draft state for dialog - synced from URL params when dialog opens
  const [draftSearch, setDraftSearch] = React.useState(params.s);
  const [draftTags, setDraftTags] = React.useState<string[]>(params.tags);

  // Sync draft state when dialog opens
  React.useEffect(() => {
    if (open) {
      setDraftSearch(params.s);
      setDraftTags(params.tags);
    }
  }, [open, params.s, params.tags]);

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

  const handleConfirm = React.useCallback(() => {
    setParams({
      s: draftSearch,
      tags: draftTags,
    });
    setOpen(false);
  }, [draftSearch, draftTags, setParams]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp": {
          const items = document.querySelectorAll<HTMLDivElement>(
            'div[cmdk-group-items] > [data-selected="true"]'
          );
          if (items.length) {
            const [activeEl] = items;
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
        }
        case "Enter":
          if (!inputLock) {
            handleConfirm();
          }
          break;
        case "Escape":
          setOpen(false);
          break;
      }
    },
    [inputLock, handleConfirm]
  );

  const commandProps = React.useMemo(
    () => ({
      className: "**:[[cmdk-input]]:h-14",
      shouldFilter: false,
      onKeyDown: handleKeyDown,
    }),
    [handleKeyDown]
  );

  const filterPreview = React.useMemo(() => {
    if (!params.s.trim() && params.tags.length === 0) {
      return <div>Search</div>;
    }
    const showTags = params.tags.slice(0, 3);
    return (
      <div className="flex items-center space-x-1">
        <div className="max-w-[60px] truncate">{params.s}</div>
        {params.tags.length > 0 &&
          showTags.map((tag) => <span key={tag}>{siteTagMap[tag]}</span>)}
        {params.tags.length > 3 && <span>... ${params.tags.length - 3}+</span>}
      </div>
    );
  }, [params.s, params.tags]);

  return (
    <>
      <div
        className={cn(
          buttonVariants({ variant: "outline" }),
          "relative cursor-pointer rounded-full border-zinc-200 pr-12 hover:border-foreground hover:bg-background dark:border-zinc-700"
        )}
        onClick={() => setOpen(true)}
      >
        <div className="hidden sm:block">{filterPreview}</div>
        <div className="sm:hidden">Search</div>
        <div className="-translate-y-1/2 absolute top-1/2 right-px flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
          <FilterIcon className="text-lg" />
        </div>
      </div>
      <CommandDialog
        commandProps={commandProps}
        onOpenChange={setOpen}
        open={open}
      >
        <CommandInput
          className="text-md"
          onCompositionEnd={() => {
            setInputLock(false);
          }}
          onCompositionStart={() => {
            setInputLock(true);
          }}
          onInput={(e) => setDraftSearch(e.currentTarget.value)}
          placeholder="Search sites..."
          ref={inputRef}
          value={draftSearch}
          wrapperClassname="px-4"
        >
          <CommandShortcut>⌘K</CommandShortcut>
          <button
            className="rounded-sm text-foreground opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary md:top-6 md:hidden md:text-inherit"
            onClick={() => setOpen(false)}
            type="button"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Cancel</span>
          </button>
        </CommandInput>
        <CommandList>
          <CommandEmpty>No results found</CommandEmpty>
          <CommandGroup heading="Tags">
            {tagOptions.map((tag) => (
              <CommandItem className="p-0" key={tag.value} value={tag.value}>
                <label
                  className="flex w-full items-center space-x-3 px-1 py-3"
                  htmlFor={tag.value}
                >
                  <Checkbox
                    checked={draftTags.includes(tag.value)}
                    className="h-[18px] w-[18px]"
                    id={tag.value}
                    onCheckedChange={(value) => {
                      if (value) {
                        setDraftTags([...draftTags, tag.value]);
                      } else {
                        setDraftTags(
                          draftTags.filter((item) => item !== tag.value)
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
        <div className="flex items-center justify-between border-zinc-200 border-t p-3 max-md:hidden dark:border-zinc-800">
          <div>
            <span className="flex items-center space-x-1">
              <CommandShortcut className="px-0.5 py-0.5">
                <ArrowUpIcon className="text-md" />
              </CommandShortcut>
              <CommandShortcut className="px-0.5 py-0.5">
                <ArrowDownIcon className="text-md" />
              </CommandShortcut>
              <span className="text-xs text-zinc-700 dark:text-foreground/40">
                Move
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <CommandShortcut className="py-0.5">Space</CommandShortcut>
              <span className="text-xs text-zinc-700 dark:text-foreground/40">
                Select
              </span>
            </span>
            <span className="flex items-center space-x-1">
              <CommandShortcut className="py-0.5">Enter</CommandShortcut>
              <span className="text-xs text-zinc-700 dark:text-foreground/40">
                Confirm
              </span>
            </span>
            <span className="flex items-center space-x-1">
              <CommandShortcut className="py-0.5">ESC</CommandShortcut>
              <span className="text-xs text-zinc-700 dark:text-foreground/40">
                Cancel
              </span>
            </span>
          </div>
        </div>
        <div
          className="border-zinc-200 border-t p-3 md:hidden dark:border-zinc-800"
          onClick={() => {
            if (!inputLock) {
              handleConfirm();
            }
          }}
        >
          <Button className="w-full">Confirm</Button>
        </div>
      </CommandDialog>
    </>
  );
}

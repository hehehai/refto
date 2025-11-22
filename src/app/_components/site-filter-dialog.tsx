"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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
import type { SiteLocale } from "@/i18n";
import { siteTagMap } from "@/lib/constants";
import { cn, getSearchParams } from "@/lib/utils";

export function SiteFilterCommand() {
  const t = useTranslations("Index.Search");
  const locale = useLocale();

  const tagOptions = React.useMemo(
    () =>
      Object.entries(siteTagMap).map(([value, item]) => ({
        label: item[locale as SiteLocale],
        value,
      })),
    [locale]
  );

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = getSearchParams(searchParams);

  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputLock, setInputLock] = React.useState(false);
  const [search, setSearch] = React.useState(params.s || "");
  const [selected, setSelected] = React.useState<string[]>(
    params.tags?.split(",").filter(Boolean) || []
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

  const handleConfirm = React.useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("s", search);
    newSearchParams.set("tags", selected.join(","));
    router.push(`${pathname}?${newSearchParams.toString()}`);
    setOpen(false);
  }, [search, selected, searchParams, pathname, router]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp": {
          // 获取所有 cmdk-group-items 属性元素的子元素，筛选元素 data-selected="true" 的元素，设置聚焦
          const items = document.querySelectorAll<HTMLDivElement>(
            'div[cmdk-group-items] > [data-selected="true"]'
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
        }
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
    },
    [params, inputLock, handleConfirm]
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
    const search = params.s || "";
    const tags = params.tags?.split(",").filter(Boolean) || [];
    if (!search.trim() && tags.length === 0) {
      return <div>{t("holder")}</div>;
    }
    const showTags = tags.slice(0, 3);
    return (
      <div className="flex items-center space-x-1">
        <div className="max-w-[60px] truncate">{search}</div>
        {tags.length > 0 &&
          showTags.map((tag) => (
            <span key={tag}>{siteTagMap[tag]?.[locale as SiteLocale]}</span>
          ))}
        {tags.length > 3 && <span>... ${tags.length - 3}+</span>}
      </div>
    );
  }, [params, t, locale]);

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
        <div className="sm:hidden">{t("holder")}</div>
        <div className="-translate-y-1/2 absolute top-1/2 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
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
          onInput={(e) => setSearch(e.currentTarget.value)}
          placeholder={t("placeholder")}
          ref={inputRef}
          value={search}
          wrapperClassname="px-4"
        >
          <CommandShortcut>⌘K</CommandShortcut>
          <button
            className="rounded-sm text-foreground opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary md:top-6 md:hidden md:text-inherit"
            onClick={() => setOpen(false)}
            type="button"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">{t("controls.cancel")}</span>
          </button>
        </CommandInput>
        <CommandList>
          <CommandEmpty>{t("empty")}</CommandEmpty>
          <CommandGroup heading={t("tagsLabel")}>
            {tagOptions.map((tag) => (
              <CommandItem className="p-0" key={tag.value} value={tag.value}>
                <label
                  className="flex w-full items-center space-x-3 px-1 py-3"
                  htmlFor={tag.value}
                >
                  <Checkbox
                    checked={selected.includes(tag.value)}
                    className="h-[18px] w-[18px]"
                    id={tag.value}
                    onCheckedChange={(value) => {
                      if (value) {
                        setSelected([...selected, tag.value]);
                      } else {
                        setSelected(
                          selected.filter((item) => item !== tag.value)
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
                {t("controls.move")}
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <CommandShortcut className="py-0.5">Space</CommandShortcut>
              <span className="text-xs text-zinc-700 dark:text-foreground/40">
                {t("controls.select")}
              </span>
            </span>
            <span className="flex items-center space-x-1">
              <CommandShortcut className="py-0.5">Enter</CommandShortcut>
              <span className="text-xs text-zinc-700 dark:text-foreground/40">
                {t("controls.confirm")}
              </span>
            </span>
            <span className="flex items-center space-x-1">
              <CommandShortcut className="py-0.5">ESC</CommandShortcut>
              <span className="text-xs text-zinc-700 dark:text-foreground/40">
                {t("controls.cancel")}
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
          <Button className="w-full">{t("controls.confirm")}</Button>
        </div>
      </CommandDialog>
    </>
  );
}

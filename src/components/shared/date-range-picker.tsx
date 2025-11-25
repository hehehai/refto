"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import type * as React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerWithRangeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
}

export function DatePickerWithRange({
  className,
  value,
  onChange,
  placeholder = "Pick a date",
}: DatePickerWithRangeProps) {
  const hasValue = value?.from || value?.to;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "h-10 justify-start border-dashed text-left font-normal",
              hasValue && "border-solid",
              !hasValue && "text-muted-foreground"
            )}
            id="date"
            size="sm"
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <Calendar
            autoFocus
            className="p-0"
            defaultMonth={value?.from}
            mode="range"
            onSelect={onChange}
            selected={value}
          />
          {hasValue && (
            <div className="mt-3 border-t pt-3">
              <Button
                className="w-full"
                onClick={() => onChange?.(undefined)}
                size="sm"
                variant="ghost"
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

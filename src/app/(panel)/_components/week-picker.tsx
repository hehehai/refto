"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, endOfISOWeek, format, startOfISOWeek } from "date-fns";
import * as React from "react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function getWeekDays(weekStart: Date) {
  const days = [weekStart];
  for (let i = 1; i < 7; i += 1) {
    days.push(addDays(weekStart, i));
  }
  return days;
}

function getWeekRange(date: Date) {
  return {
    from: startOfISOWeek(date),
    to: endOfISOWeek(date),
  };
}

function getDaysBetweenDates(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }

  return dates;
}

interface WeekPickerProps {
  value?: [Date, Date];
  onChange?: (value: [Date, Date] | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function WeekPicker({
  value,
  onChange,
  placeholder = "Pick a week",
  disabled = false,
}: WeekPickerProps) {
  const [selectedDay, setSelectedDay] = useState<Date[]>(
    value?.length ? getDaysBetweenDates(value[0], value[1]) : []
  );
  const [hoverRange, setHoverRange] = useState<DateRange | undefined>(
    undefined
  );

  const daysAreSelected = selectedDay.length > 0;

  React.useEffect(() => {
    setSelectedDay(
      value?.length ? getDaysBetweenDates(value[0], value[1]) : []
    );
  }, [value]);

  const handleDayChange = React.useCallback(
    (date: Date) => {
      const select = getWeekDays(getWeekRange(date).from);
      if (onChange) {
        onChange?.([select[0]!, select[6]!]);
      } else {
        setSelectedDay(select);
      }
    },
    [onChange]
  );

  const handleDayEnter = React.useCallback((date: Date) => {
    setHoverRange(getWeekRange(date));
  }, []);

  const handleDayLeave = () => {
    setHoverRange(undefined);
  };

  // Build modifiers object
  const modifiers = React.useMemo(() => {
    const mods: Record<string, Date[] | DateRange | undefined> = {};

    if (hoverRange) {
      mods.hoverRange = hoverRange;
    }

    if (daysAreSelected && selectedDay[0] && selectedDay[6]) {
      mods.selectedRange = { from: selectedDay[0], to: selectedDay[6] };
    }

    return mods;
  }, [hoverRange, daysAreSelected, selectedDay]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full items-center justify-between text-left font-normal",
            !daysAreSelected && "text-muted-foreground"
          )}
          disabled={disabled}
          variant={"outline"}
        >
          <span className="space-x-3">
            {daysAreSelected && selectedDay[0] && selectedDay[6] ? (
              <>
                <span>{format(selectedDay[0], "yyyy-MM-dd")}</span>{" "}
                <span>~</span>{" "}
                <span>{format(selectedDay[6], "yyyy-MM-dd")}</span>
              </>
            ) : (
              <span>{placeholder}</span>
            )}
          </span>
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          modifiers={modifiers}
          modifiersClassNames={{
            hoverRange: "border border-gray-200",
            selectedRange: "bg-accent",
          }}
          onDayClick={handleDayChange}
          onDayMouseEnter={handleDayEnter}
          onDayMouseLeave={handleDayLeave}
          selected={selectedDay}
          showOutsideDays
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  );
}

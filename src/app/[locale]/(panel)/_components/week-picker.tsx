'use client'

import { CalendarIcon } from '@radix-ui/react-icons'
import {
  addDays,
  endOfISOWeek,
  format,
  isSameDay,
  startOfISOWeek,
} from 'date-fns'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type {
  DateRange,
  DayModifiers,
  WeekNumberClickEventHandler,
} from 'react-day-picker'

function getWeekDays(weekStart: Date) {
  const days = [weekStart]
  for (let i = 1; i < 7; i += 1) {
    days.push(addDays(weekStart, i))
  }
  return days
}

function getWeekRange(date: Date) {
  return {
    from: startOfISOWeek(date),
    to: endOfISOWeek(date),
  }
}

function isBetween(day: Date, range: DateRange) {
  return (
    day >= (range.from ?? 0) && day <= (range.to ?? Number.POSITIVE_INFINITY)
  )
}

function getDaysBetweenDates(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []

  while (startDate <= endDate) {
    dates.push(new Date(startDate))
    startDate = addDays(startDate, 1)
  }

  return dates
}

interface WeekPickerProps {
  value?: [Date, Date]
  onChange?: (value: [Date, Date] | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function WeekPicker({
  value,
  onChange,
  placeholder = 'Pick a week',
  disabled = false,
}: WeekPickerProps) {
  const [selectedDay, setSelectedDay] = useState<Date[]>(
    value?.length ? getDaysBetweenDates(value[0], value[1]) : [],
  )
  const [hoverRange, setHoverRange] = useState<DateRange | false>(false)

  const daysAreSelected = selectedDay.length > 0

  const modifiers: DayModifiers = {
    hoverRange: hoverRange ? (day) => isBetween(day, hoverRange) : false,
    selectedRange: daysAreSelected && {
      from: selectedDay[0],
      to: selectedDay[6],
    },
    hoverRangeStart: hoverRange
      ? (day) => isSameDay(day, hoverRange.from!)
      : false,
    hoverRangeEnd: hoverRange ? (day) => isSameDay(day, hoverRange.to!) : false,
    selectedRangeStart: (daysAreSelected && selectedDay[0]) || false,
    selectedRangeEnd: (daysAreSelected && selectedDay[6]) || false,
  }

  React.useEffect(() => {
    setSelectedDay(value?.length ? getDaysBetweenDates(value[0], value[1]) : [])
  }, [value])

  const handleDayChange = React.useCallback(
    (date: Date) => {
      const select = getWeekDays(getWeekRange(date).from)
      if (onChange) {
        onChange?.([select[0]!, select[6]!])
      } else {
        setSelectedDay(select)
      }
    },
    [onChange],
  )

  const handleDayEnter = React.useCallback((date: Date) => {
    setHoverRange(getWeekRange(date))
  }, [])

  const handleDayLeave = () => {
    setHoverRange(false)
  }

  const handleWeekClick: WeekNumberClickEventHandler = (_, days, e) => {
    e.preventDefault()
    setSelectedDay(days)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full items-center justify-between text-left font-normal',
            !daysAreSelected && 'text-muted-foreground',
          )}
          disabled={disabled}
        >
          <span className="space-x-3">
            {daysAreSelected ? (
              <>
                <span>{format(selectedDay[0]!, 'yyyy-MM-dd')}</span>{' '}
                <span>~</span>{' '}
                <span>{format(selectedDay[6]!, 'yyyy-MM-dd')}</span>
              </>
            ) : (
              <span>{placeholder}</span>
            )}
          </span>
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          showOutsideDays
          selected={selectedDay}
          modifiers={modifiers}
          onDayClick={handleDayChange}
          onDayMouseEnter={handleDayEnter}
          onDayMouseLeave={handleDayLeave}
          onWeekNumberClick={handleWeekClick}
          weekStartsOn={1}
          modifiersClassNames={{
            hoverRange: 'border border-gray-200',
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

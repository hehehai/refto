'use client'

import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { Command as CommandPrimitive } from 'cmdk'
import * as React from 'react'

interface MultiSelectProps
  extends Omit<
    React.ComponentPropsWithoutRef<'div'>,
    'value' | 'onChange' | 'onError'
  > {
  options: string[]
  value: string[]
  renderValue: (
    selected: string,
    methods: { remove: () => void },
  ) => React.ReactNode
  renderOption: (option: string) => React.ReactNode
  onError?: (message?: string) => void
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxShow?: number
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value,
      renderValue,
      renderOption,
      onChange,
      placeholder = 'Select items',
      maxShow,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)

    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState('')
    const selectedStatus = React.useMemo(() => {
      if (!maxShow) {
        return {
          selected: value,
          more: 0,
        }
      }

      return {
        selected: value.slice(0, maxShow),
        more: value.length - maxShow,
      }
    }, [value, maxShow])

    const handleUnselect = React.useCallback(
      (option: string) => {
        onChange(value.filter((s) => s !== option))
      },
      [value, onChange],
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (input) {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            if (input.value === '') {
              const newSelected = [...value]
              newSelected.pop()

              onChange(newSelected)
            }
          }
          // This is not a default behavior of the <input /> field
          if (e.key === 'Escape') {
            input.blur()
          }
        }
      },
      [value, onChange],
    )

    const selectable = React.useMemo(
      () => options.filter((option) => !value.includes(option)),
      [options, value],
    )

    return (
      <Command
        ref={ref}
        onKeyDown={handleKeyDown}
        className={cn('overflow-visible bg-transparent', props.className)}
      >
        <div className="group relative h-10 rounded-md border border-input px-2 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <div className="flex flex-wrap gap-1">
            {selectedStatus.selected.map((option) => (
              <React.Fragment key={option}>
                {renderValue(option, { remove: () => handleUnselect(option) })}
              </React.Fragment>
            ))}
            {selectedStatus.more > 0 && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <span className="rounded-sm bg-zinc-100 px-2 py-0.5">
                  {selectedStatus.more}+
                </span>
              </div>
            )}
            <CommandPrimitive.Input
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && selectable.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-[360px] overflow-auto">
                {selectable.map((option) => {
                  return (
                    <CommandItem
                      key={option}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onSelect={() => {
                        setInputValue('')
                        onChange([...value, option])
                      }}
                      className={'cursor-pointer'}
                    >
                      {renderOption(option)}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </div>
          ) : null}
        </div>
      </Command>
    )
  },
)

MultiSelect.displayName = 'MultiSelect'

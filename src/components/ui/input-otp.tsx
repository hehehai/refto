"use client";
import { cn } from "@/lib/utils";
import { OTPInput, type SlotProps } from "input-otp";
import { forwardRef } from "react";

// Feel free to copy. Uses @shadcn/ui tailwind colors.
export function OTPSlot(props: SlotProps) {
  return (
    <div
      className={cn(
        "relative h-14 w-14 text-[2rem]",
        "flex items-center justify-center",
        "duration-50 transition-all",
        "border-y border-r border-border first:rounded-l-md first:border-l last:rounded-r-md",
        "group-focus-within:border-accent-foreground/20 group-hover:border-accent-foreground/20",
        "outline outline-0 outline-accent-foreground/20",
        { "outline-2 outline-accent-foreground": props.isActive },
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <OTPFakeCaret />}
    </div>
  );
}

// You can emulate a fake textbox caret!
export function OTPFakeCaret() {
  return (
    <div className="pointer-events-none absolute inset-0 flex animate-caret-blink items-center justify-center">
      <div className="h-8 w-px bg-zinc-800" />
    </div>
  );
}

// Inspired by Stripe's MFA input.
export function OTPFakeDash() {
  return (
    <div className="flex w-10 items-center justify-center">
      <div className="h-1 w-3 rounded-full bg-border" />
    </div>
  );
}

export interface InputProps
  extends Omit<React.ComponentProps<typeof OTPInput>, "render"> {}

export const InputOtp = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <OTPInput
        ref={ref}
        {...props}
        containerClassName={cn(
          "group flex items-center has-[:disabled]:opacity-30",
          className,
        )}
        render={({ slots }) => (
          <>
            <div className="flex">
              {slots.slice(0, 3).map((slot, idx) => (
                <OTPSlot key={idx} {...slot} />
              ))}
            </div>

            <OTPFakeDash />

            <div className="flex">
              {slots.slice(3).map((slot, idx) => (
                <OTPSlot key={idx} {...slot} />
              ))}
            </div>
          </>
        )}
      />
    );
  },
);

InputOtp.displayName = "InputOtp";

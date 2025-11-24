"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type HTMLAttributes, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { orpc } from "@/lib/orpc/react";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

const subscribeSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required",
    })
    .email({
      message: "Email is invalid",
    }),
});

export type SubscribeSchema = z.infer<typeof subscribeSchema>;

interface SiteEmailSubscriptionProps extends HTMLAttributes<HTMLDivElement> {
  user?: SessionUser | null;
  weeklyCount?: number;
}

// Countdown component for subscribed users
function SubscriptionCountdown({
  onUnsubscribe,
}: {
  onUnsubscribe: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      // Target: 20th of current month at 00:00
      let target = new Date(year, month, 20, 0, 0, 0);

      // If we're past the 20th, target next month's 20th
      if (now >= target) {
        target = new Date(year, month + 1, 20, 0, 0, 0);
      }

      const diff = target.getTime() - now.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 flex-1 items-center rounded-full border bg-muted/50 px-4 text-muted-foreground text-sm sm:w-[300px] md:w-[324px] lg:w-[386px]">
        <span className="font-mono">{timeLeft}</span>
        <span className="ml-2 text-xs">until next newsletter</span>
      </div>
      <Button
        className="rounded-full"
        onClick={onUnsubscribe}
        type="button"
        variant="outline"
      >
        Unsubscribe
      </Button>
    </div>
  );
}

export const SiteEmailSubscription = ({
  className,
  user,
  weeklyCount = 0,
  ...props
}: SiteEmailSubscriptionProps) => {
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  const form = useForm<SubscribeSchema>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  // Check subscription status for logged-in users
  const { data: subscriptionStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["subscriptionStatus", user?.email],
    queryFn: async () => {
      if (!user?.email) return { subscribed: false };
      const result = await orpc.subscriber.checkStatus.call({
        email: user.email,
      });
      return result;
    },
    enabled: !!user?.email && !isAdmin,
  });

  const isSubscribed = subscriptionStatus?.subscribed ?? false;

  // @ts-expect-error - oRPC mutationFn returns T | undefined, TanStack expects T
  const subscribeMutation = useMutation({
    ...orpc.subscriber.subscribe.mutationOptions(),
    onSuccess: () => {
      toast.success("You have successfully subscribed!", {
        description: "Thank you for subscribing",
      });
      form.reset();
      refetchStatus();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleUnsubscribe = useCallback(async () => {
    if (!user?.email) return;
    // For now, just show a message - full unsubscribe requires token
    toast.info("Please check your email for the unsubscribe link");
  }, [user?.email]);

  const onSubmit = (values: SubscribeSchema) => {
    // If not logged in, redirect to signin with email
    if (!user) {
      const params = new URLSearchParams({ email: values.email });
      router.push(`/signin?${params.toString()}`);
      return;
    }

    subscribeMutation.mutate({
      email: values.email,
    });
  };

  // Don't show subscription box for admin users
  if (isAdmin) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)} {...props}>
      <p className="text-muted-foreground text-sm">
        ✨ <span className="font-medium text-foreground">{weeklyCount}</span>{" "}
        new refs added this week
      </p>

      {user && isSubscribed ? (
        // Subscribed state: show countdown
        <SubscriptionCountdown onUnsubscribe={handleUnsubscribe} />
      ) : (
        // Not subscribed or not logged in: show form
        <Form {...form}>
          <form
            className="flex flex-col items-center gap-3 sm:flex-row"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="relative w-full sm:w-auto md:space-y-0">
                  <Input
                    disabled={!!user}
                    placeholder="Get weekly design inspiration"
                    {...field}
                    className="w-full rounded-full sm:w-[300px] md:w-[324px] lg:w-[386px] lg:max-w-sm"
                  />
                  <div className="top-full left-0 pl-3 md:absolute">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <Button
              className="w-full rounded-full sm:w-auto"
              disabled={subscribeMutation.isPending}
              type="submit"
            >
              {subscribeMutation.isPending && <Spinner className="mr-2" />}
              <span>Subscribe</span>
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

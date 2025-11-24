"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { HTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { orpc } from "@/lib/orpc/react";

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

interface SiteEmailSubscriptionProps extends HTMLAttributes<HTMLFormElement> {}

export const SiteEmailSubscription = ({
  className,
  ...props
}: SiteEmailSubscriptionProps) => {
  const form = useForm<SubscribeSchema>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: "",
    },
  });

  // @ts-expect-error - oRPC mutationFn returns T | undefined, TanStack expects T
  const submitAction = useMutation({
    ...orpc.subscriber.subscribe.mutationOptions(),
    onSuccess: () => {
      toast.success("You have successfully subscribed!", {
        description: "Thank you for subscribing",
      });
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: SubscribeSchema) => {
    submitAction.mutate({
      email: values.email,
    });
  };

  return (
    <Form {...form}>
      <form
        className={className}
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="relative md:space-y-0">
              <Input
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
        <Button className="w-full rounded-full sm:w-auto" type="submit">
          {submitAction.isPending && <Spinner className="mr-2" />}
          <span>Subscribe</span>
        </Button>
      </form>
    </Form>
  );
};

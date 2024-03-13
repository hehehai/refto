"use client";

import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Email is invalid" }),
});

interface SiteEmailSubscriptionProps
  extends React.HTMLAttributes<HTMLFormElement> {}

export const SiteEmailSubscription = ({
  className,
  ...props
}: SiteEmailSubscriptionProps) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof subscribeSchema>>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: "",
    },
  });

  const submitAction = api.subscriber.subscribe.useMutation({
    onSuccess: () => {
      toast({
        title: "🎉 You are Subscribed",
        description: "Thank you for subscribing",
      });

      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof subscribeSchema>) => {
    submitAction.mutate(values.email);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className}
        {...props}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Input
                placeholder="Email Get Best of the Week"
                {...field}
                className="w-full sm:w-[300px] md:w-[324px] lg:w-[384px] lg:max-w-sm rounded-full"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="rounded-full w-full sm:w-auto">
          {submitAction.isLoading && <Spinner className="mr-2" />}
          <span>Subscription</span>
        </Button>
      </form>
    </Form>
  );
};

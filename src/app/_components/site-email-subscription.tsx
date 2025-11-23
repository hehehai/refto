"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import type { HTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { SupportLocale } from "@/i18n";
import { orpc } from "@/lib/orpc/react";

const subscribeSchema = (locale: string) =>
  z.object({
    email: z
      .string()
      .min(1, {
        message: { en: "Email is required", "zh-CN": "邮箱不能为空" }[locale],
      })
      .email({
        message: { en: "Email is invalid", "zh-CN": "邮箱格式不正确" }[locale],
      }),
  });

export type SubscribeSchema = z.infer<ReturnType<typeof subscribeSchema>>;

interface SiteEmailSubscriptionProps extends HTMLAttributes<HTMLFormElement> {}

export const SiteEmailSubscription = ({
  className,
  ...props
}: SiteEmailSubscriptionProps) => {
  const t = useTranslations("Index");
  const locale = useLocale();

  const form = useForm<SubscribeSchema>({
    resolver: zodResolver(subscribeSchema(locale)),
    defaultValues: {
      email: "",
    },
  });

  // @ts-expect-error - oRPC mutationFn returns T | undefined, TanStack expects T
  const submitAction = useMutation({
    ...orpc.subscriber.subscribe.mutationOptions(),
    onSuccess: () => {
      toast.success(t("subscribe.success.description"), {
        description: t("subscribe.success.title"),
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
      locale: locale as SupportLocale,
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
                placeholder={t("subscribe.slogan")}
                {...field}
                className="w-full rounded-full sm:w-[300px] md:w-[324px] lg:w-[384px] lg:max-w-sm"
              />
              <div className="top-full left-0 pl-3 md:absolute">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button className="w-full rounded-full sm:w-auto" type="submit">
          {submitAction.isPending && <Spinner className="mr-2" />}
          <span>{t("subscribe.button")}</span>
        </Button>
      </form>
    </Form>
  );
};

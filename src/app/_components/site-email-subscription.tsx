"use client";

import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@openpanel/nextjs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type HTMLAttributes } from "react";
import { type SupportLocale } from "@/i18n";

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
  const { toast } = useToast();

  const form = useForm<SubscribeSchema>({
    resolver: zodResolver(subscribeSchema(locale)),
    defaultValues: {
      email: "",
    },
  });

  const submitAction = api.subscriber.subscribe.useMutation({
    onSuccess: () => {
      toast({
        title: t("subscribe.success.title"),
        description: t("subscribe.success.description"),
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

  const onSubmit = (values: SubscribeSchema) => {
    submitAction.mutate({
      email: values.email,
      locale: locale as SupportLocale,
    });
    trackEvent("subscribe", { email: values.email });
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
            <FormItem className="relative">
              <Input
                placeholder={t("subscribe.slogan")}
                {...field}
                className="w-full rounded-full sm:w-[300px] md:w-[324px] lg:w-[384px] lg:max-w-sm"
              />
              <div className="left-0 top-[100%] pl-3 md:absolute">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full rounded-full sm:w-auto">
          {submitAction.isLoading && <Spinner className="mr-2" />}
          <span>{t("subscribe.button")}</span>
        </Button>
      </form>
    </Form>
  );
};

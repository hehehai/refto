"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/orpc/client";
import { orpc } from "@/lib/orpc/react";
import {
  type SubmitSiteCreate,
  submitSiteCreateSchema,
} from "@/lib/validations/submit-site";

const emptyData = {
  email: "",
  site: "",
  title: "",
  description: "",
};

export const SubmitDialog = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations("Submit");
  const locale = useLocale();

  const form = useForm<SubmitSiteCreate>({
    resolver: zodResolver(submitSiteCreateSchema(locale)),
    defaultValues: {
      ...emptyData,
    },
  });

  // @ts-expect-error - oRPC mutationFn returns T | undefined, TanStack expects T
  const submitAction = useMutation({
    ...orpc.submitSite.recommend.mutationOptions(),
    onSuccess: () => {
      toast.success(t("success.description"), {
        description: t("success.title"),
      });
      form.reset({ ...emptyData });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [getUrlLoading, setGetUrlLoading] = useState(false);

  const onSubmit = useCallback(
    async (values: SubmitSiteCreate) => {
      submitAction.mutate(values);
    },
    [submitAction]
  );

  const handleGetUrlMeta = useCallback(
    async (e: React.SyntheticEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const currentUrl = form.getValues("site");
      const validUrl = z.string().trim().url().safeParse(currentUrl);
      if (!validUrl.success) {
        toast.error("Please input site url");
        return;
      }
      setGetUrlLoading(true);
      try {
        const data = await client.siteMeta.meta({ url: validUrl.data });

        if (!data) {
          toast.error("Failed to get site meta");
          return;
        }

        form.reset({
          email: form.getValues("email"),
          site: validUrl.data,
          title: data.siteTitle,
          description: data.siteDescription,
        });
      } finally {
        setGetUrlLoading(false);
      }
    },
    [form]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col max-sm:h-dvh max-sm:border-none max-sm:shadow-none sm:grid sm:max-w-[526px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col max-sm:mt-3 max-sm:grow"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email.label")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("email.placeholder")}
                        {...field}
                        disabled={getUrlLoading}
                      />
                    </FormControl>
                    <FormDescription>{t("email.msg")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("siteUrl.label")}</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          placeholder={t("siteUrl.placeholder")}
                          {...field}
                          disabled={getUrlLoading}
                        />
                        <Button
                          disabled={getUrlLoading}
                          onClick={handleGetUrlMeta}
                        >
                          {getUrlLoading && <Spinner className="mr-1" />}
                          <span>{t("siteUrl.button")}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("siteTitle.label")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("siteTitle.placeholder")}
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("siteDescription.label")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("siteDescription.placeholder")}
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-auto sm:mt-4">
              <Button
                className="max-sm:w-full"
                disabled={submitAction.isPending}
                type="submit"
              >
                {submitAction.isPending && <Spinner className="mr-2 text-xl" />}
                <span>{t("button.submit")}</span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

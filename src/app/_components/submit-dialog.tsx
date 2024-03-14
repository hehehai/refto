"use client";

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
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/trpc/react";
import { submitSiteCreateSchema } from "@/lib/validations/submit-site";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const emptyData = {
  email: "",
  site: "",
  title: "",
  description: "",
};

export const SubmitDialog = ({ children }: { children: React.ReactNode }) => {
  const utils = api.useUtils();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof submitSiteCreateSchema>>({
    resolver: zodResolver(submitSiteCreateSchema),
    defaultValues: {
      ...emptyData,
    },
  });

  const submitAction = api.submitSite.recommend.useMutation({
    onSuccess: () => {
      toast({
        title: "🎉 You are Subscribed",
        description: "Thank you for subscribing",
      });
      form.reset({ ...emptyData });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [getUrlLoading, setGetUrlLoading] = useState(false);

  const onSubmit = useCallback(
    async (values: z.infer<typeof submitSiteCreateSchema>) => {
      submitAction.mutate(values);
    },
    [],
  );

  const handleGetUrlMeta = useCallback(
    async (e: React.SyntheticEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const currentUrl = form.getValues("site");
      const validUrl = z.string().trim().url().safeParse(currentUrl);
      if (!validUrl.success) {
        toast({
          title: "Error",
          description: "Please input site url",
          variant: "destructive",
        });
        return;
      }
      setGetUrlLoading(true);
      try {
        const data = await utils.siteMeta.meta.fetch({ url: validUrl.data });

        if (!data) {
          toast({
            title: "Error",
            description: "Failed to get site meta",
            variant: "destructive",
          });
          return;
        }

        form.reset({
          site: validUrl.data,
          title: data.siteTitle,
          description: data.siteDescription,
        });
      } finally {
        setGetUrlLoading(false);
      }
    },
    [form, toast],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col max-sm:h-[100dvh] sm:grid sm:max-w-[526px]">
        <DialogHeader>
          <DialogTitle>Submit Ref Site</DialogTitle>
          <DialogDescription>
            We may not be able to include every submission, but we will select
            the most outstanding ones for display
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col max-sm:mt-3"
          >
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Please input your email"
                        {...field}
                        disabled={getUrlLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      If the website is adopted, an email will be sent to you.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Url</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="https://vercel.com"
                          {...field}
                          disabled={getUrlLoading}
                        />
                        <Button
                          onClick={handleGetUrlMeta}
                          disabled={getUrlLoading}
                        >
                          {getUrlLoading && <Spinner className="mr-1" />}
                          <span>Get Meta</span>
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
                    <FormLabel>Site Title (Option)</FormLabel>
                    <FormControl>
                      <Input placeholder="Site Title" {...field} disabled />
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
                    <FormLabel>Site Description (Option)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Site Description"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-auto max-sm:flex-grow sm:mt-4">
              <Button
                type="submit"
                disabled={submitAction.isLoading}
                className="max-sm:w-full"
              >
                {submitAction.isLoading && (
                  <Spinner className="mr-2 text-xl"></Spinner>
                )}
                <span>Submit</span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

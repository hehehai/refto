"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUrlMetaFetch } from "@/hooks";
import { useSession } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc/react";
import {
  type SubmitSiteCreate,
  submitSiteCreateSchema,
} from "@/lib/validations/submit-site";

const emptyData = {
  site: "",
  title: "",
  description: "",
};

export const SubmitDialog = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const [open, setOpen] = useState(false);

  const form = useForm<SubmitSiteCreate>({
    resolver: zodResolver(submitSiteCreateSchema),
    defaultValues: {
      ...emptyData,
    },
  });

  // @ts-expect-error - oRPC mutationFn returns T | undefined, TanStack expects T
  const submitAction = useMutation({
    ...orpc.submitSite.recommend.mutationOptions(),
    onSuccess: () => {
      toast.success("Your site has been submitted successfully!", {
        description: "Thank you for your submission",
      });
      form.reset({ ...emptyData });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { fetchMeta, isLoading: getUrlLoading } = useUrlMetaFetch({
    onSuccess: (meta) => {
      form.reset({
        site: meta.url,
        title: meta.siteTitle ?? "",
        description: meta.siteDescription ?? "",
      });
    },
  });

  const onSubmit = useCallback(
    async (values: SubmitSiteCreate) => {
      submitAction.mutate(values);
    },
    [submitAction]
  );

  const handleGetUrlMeta = useCallback(
    (e: React.SyntheticEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const currentUrl = form.getValues("site");
      fetchMeta(currentUrl);
    },
    [form.getValues, fetchMeta]
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen && !isSessionPending && !session?.user) {
        // Redirect to sign in if not logged in
        router.push("/signin");
        return;
      }
      setOpen(isOpen);
    },
    [isSessionPending, session?.user, router]
  );

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col max-sm:h-dvh max-sm:border-none max-sm:shadow-none sm:grid sm:max-w-[526px]">
        <DialogHeader>
          <DialogTitle>Submit a Site</DialogTitle>
          <DialogDescription>
            Share your favorite design inspiration with us
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col max-sm:mt-3 max-sm:grow"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site URL</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          disabled={getUrlLoading}
                        />
                        <Button
                          disabled={getUrlLoading}
                          onClick={handleGetUrlMeta}
                        >
                          {getUrlLoading && <Spinner className="mr-1" />}
                          <span>Fetch</span>
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
                    <FormLabel>Site Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Site title will be fetched automatically"
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
                    <FormLabel>Site Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Site description will be fetched automatically"
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
                <span>Submit</span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

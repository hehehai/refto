"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { render } from "@react-email/render";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import {
  weeklyDialogAtom,
  weeklyDialogEmitter,
} from "@/app/(admin)/_store/dialog.store";
import { RefSelectDataTable } from "@/app/(admin)/admin/weekly/_components/ref-select/data-table";
import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { RefSite, Weekly } from "@/db/schema";
import useDebounce from "@/hooks/use-debounce";
import WeeklyEmail from "@/lib/email/templates/weekly";
import { client } from "@/lib/orpc/client";
import { weeklySchema } from "@/lib/validations/weekly";
import { WeekPicker } from "./week-picker";

const emptyData = {
  title: "",
  sites: [],
};

const emailStatus = {
  count: 24,
  unsubscribeUrl: "https://refto.one/unsub?email=rivehohai@gmail.com&token=123",
  baseUrl: "https://refto.one",
};

export function WeeklyUpsetSheet() {
  const [status, setStatus] = useAtom(weeklyDialogAtom);
  const statusId = useMemo(() => status.id, [status.id]);
  const [detailData, setDetailData] = useState<Partial<Weekly>>(emptyData);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const isEdit = status.isAdd === false && status.id !== null;

  const form = useForm<z.infer<typeof weeklySchema>>({
    resolver: zodResolver(weeklySchema),
    defaultValues: {
      ...emptyData,
    },
  });

  const handleInitData = useCallback(async () => {
    if (!statusId) {
      setDetailData(emptyData);
      return;
    }

    try {
      setDetailLoading(true);
      const detail = await client.weekly.detail({ id: statusId });
      if (!detail) {
        throw new Error("Detail not found");
      }
      setDetailData(detail);
      form.reset({ ...detail });
    } catch (err: any) {
      toast.error(err?.message ?? "Please try agin", {
        description: "Fetch detail err",
      });
    } finally {
      setDetailLoading(false);
    }
  }, [statusId, form]);

  useEffect(() => {
    handleInitData();
  }, [handleInitData]);

  const handleClose = useCallback(
    (value: boolean) => {
      if (!value) {
        form.reset({ ...emptyData });
        setStatus({ show: false, isAdd: true, id: null });
      }
    },
    [setStatus, form]
  );

  const onSubmit = useCallback(
    async (values: z.infer<typeof weeklySchema>, thenAdd = false) => {
      const title = isEdit ? "Save" : "Create";
      try {
        setSaveLoading(true);
        if (isEdit) {
          await client.weekly.update({
            ...values,
            sites: values.sites.map((s) => s.id),
            id: statusId!,
          });
        } else {
          await client.weekly.create({
            ...values,
            sites: values.sites.map((s) => s.id),
          });
        }
        toast.success(`${title} success`);
        weeklyDialogEmitter.emit("success");
        if (!isEdit && thenAdd) {
          form.reset({ ...emptyData });
        } else {
          handleClose(false);
        }
      } catch (err: any) {
        console.log("ref site submit err", err);
        toast.error(err.message || "Please try again", {
          description: `${title} failed`,
        });
      } finally {
        setSaveLoading(false);
      }
    },
    [isEdit, statusId, handleClose, form]
  );

  const [previewMark, setPreviewMark] = useState("");
  const [previewRefreshing, setPreviewRefreshing] = useState(false);

  const handleRefetchPreview = useCallback(async (raws: RefSite[]) => {
    console.log("handleRefetchPreview", raws);
    try {
      setPreviewRefreshing(true);
      const mailProps = {
        ...emailStatus,
        sites: raws.map((site) => ({
          id: site.id,
          title: site.siteTitle,
          url: site.siteUrl,
          cover: site.siteCover,
          tags: site.siteTags,
        })),
      };
      const mark = await render(<WeeklyEmail {...mailProps} />, {
        pretty: true,
      });
      setPreviewMark(mark);
    } catch (err) {
      toast.error(err instanceof Error ? err?.message : "Please try again", {
        description: "Refresh preview failed",
      });
    } finally {
      setPreviewRefreshing(false);
    }
  }, []);

  const debouncedHandleRefetchPreview = useDebounce(handleRefetchPreview, 300);

  return (
    <Sheet onOpenChange={handleClose} open={status.show}>
      <SheetContent className="flex flex-col sm:max-w-[94vw]" side="left">
        <SheetHeader>
          <SheetTitle>
            <span>{isEdit ? "Edit Weekly" : "Create Weekly"}</span>
            {detailLoading && <Spinner className="ml-2" />}
          </SheetTitle>
        </SheetHeader>
        <div className="flex space-x-4">
          <div className="w-[540px]">
            <div className="mb-2 font-medium text-sm">Preview</div>
            <div className="flex h-[calc(100vh-196px)] w-full items-center justify-center rounded-lg border border-input">
              {previewRefreshing ? (
                <Spinner className="h-6 w-6 animate-spin" />
              ) : (
                <iframe
                  className="h-full w-full"
                  srcDoc={previewMark}
                  title="Weekly"
                />
              )}
            </div>
          </div>
          <Form {...form}>
            <form
              className="flex max-w-[45vw] grow flex-col"
              onSubmit={form.handleSubmit((v) => onSubmit(v, false))}
            >
              <div className="-mx-3 mb-6 h-[calc(100dvh-148px)] space-y-2 overflow-y-auto px-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  key="weekRange"
                  name="weekRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Week Range</FormLabel>
                      <FormControl>
                        <WeekPicker
                          disabled={field.disabled}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          placeholder="Pick a week"
                          value={field.value as [Date, Date]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  key="sites"
                  name="sites"
                  render={({ field }) => (
                    <FormItem key={field.name}>
                      <FormLabel>Sites</FormLabel>
                      <FormControl>
                        <RefSelectDataTable
                          disabled={field.disabled || field.value.length >= 5}
                          onChange={(raws) => {
                            const limitSelected = raws.slice(0, 5);
                            field.onChange(limitSelected);
                            debouncedHandleRefetchPreview(limitSelected);
                          }}
                          value={field.value.map((s) => s.id)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <SheetFooter className="mt-auto">
                <Button
                  disabled={saveLoading}
                  onClick={() => {
                    if (statusId) {
                      form.reset({
                        ...detailData,
                      });
                    } else {
                      form.reset({ ...emptyData });
                    }
                  }}
                  type="button"
                  variant={"outline"}
                >
                  <span>Reset</span>
                </Button>
                <Button disabled={saveLoading} type="submit">
                  {saveLoading && <Spinner className="mr-2 text-xl" />}
                  <span>Submit</span>
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

WeeklyUpsetSheet.displayName = "WeeklyUpsetSheet";

export default WeeklyUpsetSheet;

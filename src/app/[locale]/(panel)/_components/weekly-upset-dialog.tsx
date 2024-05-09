"use client";

import { Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { weeklyDialogAtom, weeklyDialogEmitter } from "../_store/dialog.store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/trpc/react";
import { weeklySchema } from "@/lib/validations/weekly";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Weekly } from "@prisma/client";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { WeekPicker } from "./week-picker";
import { Textarea } from "@/components/ui/textarea";

const emptyData = {
  title: "",
  sites: [],
};

export function WeeklyUpsetDialog() {
  const utils = api.useUtils();
  const { toast } = useToast();

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
      const detail = await utils.weekly.detail.fetch({ id: statusId });
      if (!detail) {
        throw new Error("Detail not found");
      }
      setDetailData(detail);
      form.reset({ ...detail });
    } catch (err: any) {
      toast({
        title: "Fetch detail err",
        description: err?.message ?? "Please try agin",
      });
    } finally {
      setDetailLoading(false);
    }
  }, [statusId, setDetailData, utils, form, toast]);

  useEffect(() => {
    handleInitData();
  }, [statusId, handleInitData]);

  const handleClose = useCallback(
    (value: boolean) => {
      if (!value) {
        form.reset({ ...emptyData });
        setStatus({ show: false, isAdd: true, id: null });
      }
    },
    [setStatus, form],
  );

  const onSubmit = useCallback(
    async (values: z.infer<typeof weeklySchema>, thenAdd = false) => {
      const title = isEdit ? "Save" : "Create";
      try {
        setSaveLoading(true);
        if (isEdit) {
          await utils.client.weekly.update.mutate({
            ...values,
            id: statusId!,
          });
        } else {
          await utils.client.weekly.create.mutate(values);
        }
        toast({
          title: `${title} success`,
          description: `${title} success`,
        });
        weeklyDialogEmitter.emit("success");
        if (!isEdit && thenAdd) {
          form.reset({ ...emptyData });
        } else {
          handleClose(false);
        }
      } catch (err: any) {
        console.log("ref site submit err", err);
        toast({
          title: `${title} failed`,
          description: err.message || "Please try again",
          variant: "destructive",
        });
      } finally {
        setSaveLoading(false);
      }
    },
    [isEdit, statusId, handleClose, form, utils, toast],
  );

  return (
    <Dialog open={status.show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <span>{isEdit ? "Edit Weekly" : "Create Weekly"}</span>
            {detailLoading && <Spinner className="ml-2" />}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => onSubmit(v, false))}>
            <div className="space-y-2">
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
                key="weekRange"
                control={form.control}
                name="weekRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week Range</FormLabel>
                    <FormControl>
                      <WeekPicker
                        disabled={field.disabled}
                        value={field.value as [Date, Date]}
                        placeholder="Pick a week"
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                key="sites"
                control={form.control}
                name="sites"
                render={({ field }) => (
                  <FormItem key={field.name}>
                    <FormLabel>Sites</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Type sites id, separated by ','"
                        value={field.value.join(",")}
                        onChange={(e) => {
                          field.onChange(e.target.value.split(","));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant={"outline"}
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
              >
                <span>Reset</span>
              </Button>
              <Button type="submit" disabled={saveLoading}>
                {saveLoading && <Spinner className="mr-2 text-xl" />}
                <span>Submit</span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

WeeklyUpsetDialog.displayName = "WeeklyUpsetDialog";

export default WeeklyUpsetDialog;

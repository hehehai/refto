"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  refSiteDialogAtom,
  refSiteDialogEmitter,
} from "../_store/dialog.store";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/shared/icons";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useState } from "react";
import { ImageUploader } from "@/components/shared/image-uploader";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { siteTagKeys, siteTagMap } from "@/lib/constants";
import { type RefSite } from "@prisma/client";
import { useAtom } from "jotai";
import { Separator } from "@/components/ui/separator";
import { refSiteSchema } from "@/lib/validations/ref-site";

const emptyData = {
  siteName: "",
  siteTitle: "",
  siteDescription: "",
  siteFavicon: "",
  siteUrl: "",
  siteCover: "",
  siteCoverHeight: 0,
  siteScreenshot: "",
  siteOGImage: "",
  siteTags: [],
};

export function RefSiteUpsetDialog() {
  const utils = api.useUtils();
  const { toast } = useToast();

  const [status, setStatus] = useAtom(refSiteDialogAtom);
  const [detailData, setDetailData] = useState<Partial<RefSite>>(emptyData);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const isEdit = status.isAdd === false && status.id !== null;

  const form = useForm<z.infer<typeof refSiteSchema>>({
    resolver: zodResolver(refSiteSchema),
    defaultValues: {
      ...emptyData,
    },
  });

  const handleInitData = useCallback(async () => {
    if (!status.id) {
      setDetailData(emptyData);
      return;
    }

    try {
      setDetailLoading(true);
      const detail = await utils.refSites.detail.fetch({ id: status.id });
      if (!detail) {
        throw new Error("Detail not found");
      }
      setDetailData(detail);
      form.reset({
        ...detail,
        siteOGImage: detail.siteOGImage ?? "",
        siteScreenshot: detail.siteScreenshot ?? "",
      });
    } catch (err: any) {
      toast({
        title: "Fetch detail err",
        description: err?.message ?? "Please try agin",
      });
    } finally {
      setDetailLoading(false);
    }
  }, [status.id, utils.refSites.detail, form, toast]);

  useEffect(() => {
    handleInitData();
  }, [status.id, handleInitData]);

  const handleClose = useCallback(
    (value: boolean) => {
      if (!value) {
        form.reset({ ...emptyData });
        setStatus({ show: false, isAdd: true, id: null });
      }
    },
    [form, setStatus],
  );

  const onSubmit = useCallback(
    async (values: z.infer<typeof refSiteSchema>, thenAdd = false) => {
      const title = isEdit ? "Save" : "Create";
      try {
        setSaveLoading(true);
        if (isEdit) {
          await utils.client.refSites.update.mutate({
            ...values,
            id: status.id!,
          });
        } else {
          await utils.client.refSites.create.mutate(values);
        }
        toast({
          title: `${title} success`,
          description: `${title} success`,
        });
        refSiteDialogEmitter.emit("success");
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
    [
      isEdit,
      status.id,
      handleClose,
      toast,
      form,
      utils.client.refSites.update,
      utils.client.refSites.create,
    ],
  );

  const [getUrlLoading, setGetUrlLoading] = useState(false);

  const handleGetUrlMeta = useCallback(
    async (e: React.SyntheticEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const currentUrl = form.getValues("siteUrl");
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
          siteUrl: validUrl.data,
          siteName: data.siteName,
          siteTitle: data.siteTitle,
          siteDescription: data.siteDescription,
          siteFavicon: data.siteFavicon,
          siteOGImage: data.siteOGImage,
        });
      } finally {
        setGetUrlLoading(false);
      }
    },
    [form, toast, utils.siteMeta.meta],
  );

  return (
    <Dialog open={status.show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            <span>{isEdit ? "Edit Ref Site" : "Create Ref Site"}</span>
            {detailLoading && <Spinner className="ml-2" />}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => onSubmit(v, false))}>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="siteUrl"
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
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Vercel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vercel: Build and deploy the best Web experiences with The Frontend Cloud – Vercel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Vercel's Frontend Cloud gives developers the frameworks, workflows, and infrastructure to build a faster, more personalized Web."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteTags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Tags</FormLabel>
                    <FormControl>
                      <MultiSelect
                        {...field}
                        options={siteTagKeys}
                        disabled={field.disabled}
                        value={field.value}
                        placeholder="Please select tags"
                        onChange={(tags) => field.onChange(tags)}
                        maxShow={4}
                        renderValue={(key, methods) => (
                          <Badge variant="secondary">
                            <span>{siteTagMap[key]?.en}</span>
                            <button
                              className="ml-1 inline-flex items-center rounded-full leading-none outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  methods.remove();
                                }
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onClick={() => methods.remove()}
                            >
                              <span className="i-lucide-x text-muted-foreground hover:text-foreground" />
                            </button>
                          </Badge>
                        )}
                        renderOption={(key) => (
                          <div>
                            {siteTagMap[key]?.en} / {siteTagMap[key]?.zh}
                          </div>
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-6 gap-4">
                <FormField
                  control={form.control}
                  name="siteFavicon"
                  render={({ field, fieldState }) => (
                    <div className="col-span-3">
                      <p className="mb-1 text-sm font-medium">Site Favicon</p>
                      <ImageUploader
                        {...field}
                        autoUpload={true}
                        disabled={field.disabled}
                        value={field.value}
                        placeholder="Upload site favicon"
                        errorMessage={fieldState.error?.message}
                        onError={(message) => {
                          form.setError("siteFavicon", {
                            type: "custom",
                            message,
                          });
                        }}
                        onChange={(fileUrl) => field.onChange(fileUrl)}
                      />
                    </div>
                  )}
                />
                <FormField
                  key="siteOGImage"
                  control={form.control}
                  name="siteOGImage"
                  render={({ field, fieldState }) => (
                    <div className="col-span-3">
                      <p className="mb-1 text-sm font-medium">Site OG Image</p>
                      <ImageUploader
                        {...field}
                        autoUpload={true}
                        disabled={field.disabled}
                        value={field.value}
                        placeholder="Upload OG image"
                        errorMessage={fieldState.error?.message}
                        onError={(message) => {
                          form.setError("siteOGImage", {
                            type: "custom",
                            message,
                          });
                        }}
                        onChange={(fileUrl) => field.onChange(fileUrl)}
                      />
                    </div>
                  )}
                />
                <FormField
                  key="siteCover"
                  control={form.control}
                  name="siteCover"
                  render={({ field, fieldState }) => (
                    <div className="col-span-3">
                      <p className="mb-1 text-sm font-medium">Site Cover</p>
                      <ImageUploader
                        {...field}
                        autoUpload={true}
                        disabled={field.disabled}
                        value={field.value}
                        placeholder="Upload site cover"
                        errorMessage={fieldState.error?.message}
                        onError={(message) => {
                          form.setError("siteCover", {
                            type: "custom",
                            message,
                          });
                        }}
                        onChange={(fileUrl) => {
                          console.log("siteCover fileUrl", fileUrl);
                          field.onChange(fileUrl);
                        }}
                        onComputedSize={([width, height]) => {
                          if (height > 0 && width > 0) {
                            form.setValue("siteCoverHeight", height);
                            form.setValue("siteCoverWidth", width);
                          }
                        }}
                      />
                    </div>
                  )}
                />
                <FormField
                  key="siteScreenshot"
                  control={form.control}
                  name="siteScreenshot"
                  render={({ field, fieldState }) => (
                    <div className="col-span-3">
                      <p className="mb-1 text-sm font-medium">
                        Site Screenshot
                      </p>
                      <ImageUploader
                        {...field}
                        autoUpload={true}
                        disabled={field.disabled}
                        value={field.value}
                        placeholder="Upload site screenshot"
                        errorMessage={fieldState.error?.message}
                        onError={(message) => {
                          form.setError("siteScreenshot", {
                            type: "custom",
                            message,
                          });
                        }}
                        onChange={(fileUrl) => {
                          console.log("siteCover fileUrl", fileUrl);
                          field.onChange(fileUrl);
                        }}
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant={"outline"}
                disabled={saveLoading}
                onClick={() => {
                  if (status.id) {
                    form.reset({
                      ...detailData,
                      siteOGImage: detailData.siteOGImage ?? "",
                      siteScreenshot: detailData.siteScreenshot ?? "",
                    });
                  } else {
                    form.reset({ ...emptyData });
                  }
                }}
              >
                <span>Reset</span>
              </Button>
              <Button type="submit" disabled={saveLoading}>
                {saveLoading && <Spinner className="mr-2 text-xl"></Spinner>}
                <span>Submit</span>
              </Button>
              {!isEdit && (
                <div className="flex items-center space-x-2">
                  <Separator orientation="vertical" />
                  <Button
                    type="button"
                    disabled={saveLoading}
                    onClick={form.handleSubmit((v) => onSubmit(v, true))}
                  >
                    {saveLoading && (
                      <Spinner className="mr-2 text-xl"></Spinner>
                    )}
                    <span>Submit & Continue</span>
                  </Button>
                </div>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

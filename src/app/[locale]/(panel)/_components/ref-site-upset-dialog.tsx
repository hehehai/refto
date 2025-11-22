"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { RefSite } from "@prisma/client";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { match } from "ts-pattern";
import { z } from "zod";
import { Spinner } from "@/components/shared/icons";
import { MediaUploader } from "@/components/shared/media-uploader";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { siteTagKeys, siteTagMap } from "@/lib/constants";
import { api } from "@/lib/trpc/react";
import { refSiteSchema } from "@/lib/validations/ref-site";
import {
  refSiteDialogAtom,
  refSiteDialogEmitter,
} from "../_store/dialog.store";

const emptyData = {
  siteName: "",
  siteTitle: "",
  siteDescription: "",
  siteFavicon: "",
  siteUrl: "",
  siteCover: "",
  siteCoverHeight: 0,
  siteScreenshot: "",
  siteRecord: "",
  siteCoverRecord: "",
  siteOGImage: "",
  siteTags: [],
};

export function RefSiteUpsetDialog() {
  const utils = api.useUtils();
  const { toast } = useToast();

  const [status, setStatus] = useAtom(refSiteDialogAtom);
  const statusId = useMemo(() => status.id, [status.id]);
  const [detailData, setDetailData] = useState<Partial<RefSite>>(emptyData);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const isEdit = status.isAdd === false && status.id !== null;

  const form = useForm<z.infer<typeof refSiteSchema>>({
    resolver: zodResolver(refSiteSchema),
    defaultValues: {
      ...emptyData,
    },
  });

  const handleInitData = useCallback(
    async (detailId: string) => {
      try {
        setDetailLoading(true);
        const detail = await utils.refSites.detail.fetch({ id: detailId });
        if (!detail) {
          throw new Error("Detail not found");
        }
        setDetailData(detail);
        form.reset({
          ...detail,
          siteOGImage: detail.siteOGImage ?? "",
          siteScreenshot: detail.siteScreenshot ?? "",
          siteRecord: detail.siteRecord ?? "",
          siteCoverRecord: detail.siteCoverRecord ?? "",
        });
        setIsVideo(!!detail.siteRecord);
      } catch (err: unknown) {
        toast({
          title: "Fetch detail err",
          description: err instanceof Error ? err?.message : "Please try agin",
        });
      } finally {
        setDetailLoading(false);
      }
    },
    [toast, utils.refSites.detail, form.reset]
  );

  useEffect(() => {
    if (statusId) {
      if (detailData.id !== statusId) {
        handleInitData(statusId);
      }
    } else {
      setDetailData(emptyData);
    }
  }, [statusId, handleInitData, detailData.id]);

  const handleClose = useCallback(
    (value: boolean) => {
      if (!value) {
        form.reset({ ...emptyData });
        setStatus({ show: false, isAdd: true, id: null });
      }
    },
    [setStatus, form.reset]
  );

  const onSubmit = useCallback(
    async (values: z.infer<typeof refSiteSchema>, thenAdd = false) => {
      const title = isEdit ? "Save" : "Create";
      try {
        setSaveLoading(true);
        if (isEdit) {
          if (!statusId) {
            return;
          }
          await utils.client.refSites.update.mutate({
            ...values,
            id: statusId,
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
      } catch (err: unknown) {
        console.log("ref site submit err", err);
        toast({
          title: `${title} failed`,
          description: err instanceof Error ? err.message : "Please try again",
          variant: "destructive",
        });
      } finally {
        setSaveLoading(false);
      }
    },
    [
      isEdit,
      statusId,
      handleClose,
      form,
      toast,
      utils.client.refSites.update,
      utils.client.refSites.create,
    ]
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
    [form.reset, form.getValues, utils.siteMeta.meta, toast]
  );

  return (
    <Sheet onOpenChange={handleClose} open={status.show}>
      <SheetContent className="flex flex-col sm:max-w-[700px]" side="left">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-3">
            <span>{isEdit ? "Edit Ref Site" : "Create Ref Site"}</span>
            {detailLoading && <Spinner className="h-4 w-4 animate-spin" />}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            className="flex grow flex-col"
            onSubmit={form.handleSubmit((v) => onSubmit(v, false))}
          >
            <div className="-mx-3 mb-6 h-[calc(100dvh-144px)] space-y-2 overflow-y-auto px-3">
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
                          disabled={getUrlLoading}
                          onClick={handleGetUrlMeta}
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
                        disabled={field.disabled}
                        maxShow={4}
                        onChange={(tags) => field.onChange(tags)}
                        options={siteTagKeys}
                        placeholder="Please select tags"
                        renderOption={(key) => (
                          <div>
                            {siteTagMap[key]?.en} / {siteTagMap[key]?.["zh-CN"]}
                          </div>
                        )}
                        renderValue={(key, methods) => (
                          <Badge variant="secondary">
                            <span>{siteTagMap[key]?.en}</span>
                            <button
                              className="ml-1 inline-flex items-center rounded-full leading-none outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              onClick={() => methods.remove()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  methods.remove();
                                }
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              type="button"
                            >
                              <span className="i-lucide-x text-muted-foreground hover:text-foreground" />
                            </button>
                          </Badge>
                        )}
                        value={field.value}
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
                      <p className="mb-1 font-medium text-sm">Site Favicon</p>
                      <MediaUploader
                        {...field}
                        autoUpload={true}
                        disabled={field.disabled}
                        errorMessage={fieldState.error?.message}
                        fileTypes="image"
                        onChange={(fileUrl) => field.onChange(fileUrl)}
                        onError={(message) => {
                          form.setError("siteFavicon", {
                            type: "custom",
                            message,
                          });
                        }}
                        placeholder="Upload site favicon"
                        value={field.value}
                      />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  key="siteOGImage"
                  name="siteOGImage"
                  render={({ field, fieldState }) => (
                    <div className="col-span-3">
                      <p className="mb-1 font-medium text-sm">Site OG Image</p>
                      <MediaUploader
                        {...field}
                        autoUpload={true}
                        disabled={field.disabled}
                        errorMessage={fieldState.error?.message}
                        fileTypes="image"
                        onChange={(fileUrl) => field.onChange(fileUrl)}
                        onError={(message) => {
                          form.setError("siteOGImage", {
                            type: "custom",
                            message,
                          });
                        }}
                        placeholder="Upload OG image"
                        value={field.value}
                      />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  key="siteCover"
                  name="siteCover"
                  render={({ field, fieldState }) => (
                    <div className="col-span-3">
                      <p className="mb-1 font-medium text-sm">Site Cover</p>
                      <MediaUploader
                        {...field}
                        autoUpload={true}
                        disabled={field.disabled}
                        errorMessage={fieldState.error?.message}
                        fileTypes="image"
                        onChange={(fileUrl) => {
                          console.log("siteCover fileUrl", typeof fileUrl);
                          field.onChange(fileUrl);
                        }}
                        onComputedSize={([width, height]) => {
                          if (height > 0 && width > 0) {
                            form.setValue("siteCoverHeight", height);
                            form.setValue("siteCoverWidth", width);
                          }
                        }}
                        onError={(message) => {
                          form.setError("siteCover", {
                            type: "custom",
                            message,
                          });
                        }}
                        placeholder="Upload site cover"
                        value={field.value}
                      />
                    </div>
                  )}
                />
                {match(isVideo)
                  .with(true, () => (
                    <>
                      <FormField
                        control={form.control}
                        key="siteCoverRecord"
                        name="siteCoverRecord"
                        render={({ field, fieldState }) => (
                          <div className="col-span-3">
                            <p className="mb-1 font-medium text-sm">
                              Site CoverRecord
                            </p>
                            <MediaUploader
                              {...field}
                              autoUpload={true}
                              disabled={field.disabled}
                              errorMessage={fieldState.error?.message}
                              fileSizeLimit={24}
                              fileTypes="video"
                              onChange={(fileUrl) => {
                                console.log("siteCoverRecord fileUrl", fileUrl);
                                field.onChange(fileUrl);
                              }}
                              onError={(message) => {
                                form.setError("siteCoverRecord", {
                                  type: "custom",
                                  message,
                                });
                              }}
                              placeholder="Upload site cover record"
                              value={field.value}
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        key="siteRecord"
                        name="siteRecord"
                        render={({ field, fieldState }) => (
                          <div className="col-span-3">
                            <p className="mb-1 font-medium text-sm">
                              Site Record
                            </p>
                            <MediaUploader
                              {...field}
                              autoUpload={true}
                              disabled={field.disabled}
                              errorMessage={fieldState.error?.message}
                              fileSizeLimit={24}
                              fileTypes="video"
                              onChange={(fileUrl) => {
                                console.log("siteRecord fileUrl", fileUrl);
                                field.onChange(fileUrl);
                              }}
                              onError={(message) => {
                                form.setError("siteRecord", {
                                  type: "custom",
                                  message,
                                });
                              }}
                              placeholder="Upload site record"
                              value={field.value}
                            />
                          </div>
                        )}
                      />
                    </>
                  ))
                  .otherwise(() => (
                    <FormField
                      control={form.control}
                      key="siteScreenshot"
                      name="siteScreenshot"
                      render={({ field, fieldState }) => (
                        <div className="col-span-3">
                          <p className="mb-1 font-medium text-sm">
                            Site Screenshot
                          </p>
                          <MediaUploader
                            {...field}
                            autoUpload={true}
                            disabled={field.disabled}
                            errorMessage={fieldState.error?.message}
                            fileTypes="image"
                            onChange={(fileUrl) => {
                              console.log("siteScreenshot fileUrl", fileUrl);
                              field.onChange(fileUrl);
                            }}
                            onError={(message) => {
                              form.setError("siteScreenshot", {
                                type: "custom",
                                message,
                              });
                            }}
                            placeholder="Upload site screenshot"
                            value={field.value}
                          />
                        </div>
                      )}
                    />
                  ))}
              </div>
            </div>

            <SheetFooter className="mt-auto">
              <div className="mr-6 flex items-center space-x-2">
                <Switch
                  checked={isVideo}
                  id="video-ref"
                  onCheckedChange={setIsVideo}
                />
                <Label htmlFor="video-ref">Video Ref</Label>
              </div>
              <Button
                disabled={saveLoading}
                onClick={() => {
                  if (statusId) {
                    form.reset({
                      ...detailData,
                      siteOGImage: detailData.siteOGImage ?? "",
                      siteScreenshot: detailData.siteScreenshot ?? "",
                      siteRecord: detailData.siteRecord ?? "",
                      siteCoverRecord: detailData.siteCoverRecord ?? "",
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
              {!isEdit && (
                <div className="flex items-center space-x-2">
                  <Separator orientation="vertical" />
                  <Button
                    disabled={saveLoading}
                    onClick={form.handleSubmit((v) => onSubmit(v, true))}
                    type="button"
                  >
                    {saveLoading && <Spinner className="mr-2 text-xl" />}
                    <span>Submit & Continue</span>
                  </Button>
                </div>
              )}
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

RefSiteUpsetDialog.displayName = "RefSiteUpsetDialog";

export default RefSiteUpsetDialog;

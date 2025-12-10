"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import {
  siteUpsertSheetAtom,
  siteUpsertSheetEmitter,
} from "@/app/(admin)/_store/dialog.store";
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
import { useUrlMetaFetch } from "@/hooks";
import { siteTagKeys, siteTagMap } from "@/lib/constants";
import type { Site } from "@/lib/db/schema";
import { client } from "@/lib/orpc/client";
import { siteCreateSchema } from "@/lib/validations/site";

const emptyData = {
  title: "",
  description: "",
  url: "",
  logo: "",
  tags: [],
  rating: 0,
  isPinned: false,
  webCover: "",
  webRecord: "",
  mobileCover: "",
  mobileRecord: "",
  siteOG: "",
};

export function SiteUpsertSheet() {
  const [status, setStatus] = useAtom(siteUpsertSheetAtom);
  const statusId = useMemo(() => status.id, [status.id]);
  const [detailData, setDetailData] = useState<
    Partial<Site> & {
      pageTitle?: string;
      pageUrl?: string;
      versionNote?: string | null;
      webCover?: string;
      webRecord?: string | null;
      mobileCover?: string | null;
      mobileRecord?: string | null;
      siteOG?: string | null;
    }
  >(emptyData);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const isEdit = status.isAdd === false && status.id !== null;

  const form = useForm<z.input<typeof siteCreateSchema>>({
    resolver: zodResolver(siteCreateSchema),
    defaultValues: {
      ...emptyData,
    },
  });

  const handleInitData = useCallback(
    async (detailId: string) => {
      try {
        setDetailLoading(true);
        const detail = await client.sites.detail({ id: detailId });
        if (!detail) {
          throw new Error("Detail not found");
        }
        setDetailData(detail);
        form.reset({
          title: detail.title,
          description: detail.description,
          url: detail.url,
          logo: detail.logo,
          tags: detail.tags,
          rating: detail.rating,
          isPinned: detail.isPinned,
          webCover: detail.webCover ?? "",
          webRecord: detail.webRecord ?? "",
          mobileCover: detail.mobileCover ?? "",
          mobileRecord: detail.mobileRecord ?? "",
          siteOG: detail.siteOG ?? "",
        });
        setIsVideo(!!(detail.webRecord || detail.mobileRecord));
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err?.message : "Please try again", {
          description: "Fetch detail error",
        });
      } finally {
        setDetailLoading(false);
      }
    },
    [form]
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
    [setStatus, form]
  );

  const onSubmit = useCallback(
    async (values: z.input<typeof siteCreateSchema>, thenAdd = false) => {
      const title = isEdit ? "Save" : "Create";
      try {
        setSaveLoading(true);
        if (isEdit) {
          if (!statusId) {
            return;
          }
          await client.sites.update({
            ...values,
            id: statusId,
          });
        } else {
          await client.sites.create(values);
        }
        toast.success(`${title} success`);
        siteUpsertSheetEmitter.emit("success");
        if (!isEdit && thenAdd) {
          form.reset({ ...emptyData });
        } else {
          handleClose(false);
        }
      } catch (err: unknown) {
        console.log("site submit error", err);
        toast.error(err instanceof Error ? err.message : "Please try again", {
          description: `${title} failed`,
        });
      } finally {
        setSaveLoading(false);
      }
    },
    [isEdit, statusId, handleClose, form]
  );

  const { fetchMeta, isLoading: getUrlLoading } = useUrlMetaFetch({
    onSuccess: (meta) => {
      form.reset({
        url: meta.url,
        title: meta.siteTitle ?? meta.siteName ?? "",
        description: meta.siteDescription ?? "",
        logo: meta.siteFavicon ?? "",
        siteOG: meta.siteOGImage ?? "",
        tags: form.getValues("tags") ?? [],
        rating: form.getValues("rating") ?? 0,
        isPinned: form.getValues("isPinned") ?? false,
        webCover: form.getValues("webCover") ?? "",
        webRecord: form.getValues("webRecord") ?? "",
        mobileCover: form.getValues("mobileCover") ?? "",
        mobileRecord: form.getValues("mobileRecord") ?? "",
      });
    },
  });

  const handleGetUrlMeta = useCallback(
    (e: React.SyntheticEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const currentUrl = form.getValues("url");
      fetchMeta(currentUrl);
    },
    [form, fetchMeta]
  );

  return (
    <Sheet onOpenChange={handleClose} open={status.show}>
      <SheetContent className="flex flex-col sm:max-w-[700px]" side="left">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-3">
            <span>{isEdit ? "Edit Site" : "Create Site"}</span>
            {detailLoading && <Spinner className="h-4 w-4 animate-spin" />}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            className="flex grow flex-col"
            onSubmit={form.handleSubmit((v) => onSubmit(v, false))}
          >
            <div className="-mx-3 flex-1 space-y-2 overflow-y-auto px-3 pb-6">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site URL</FormLabel>
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vercel: Build and deploy the best Web experiences"
                        {...field}
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
                    <FormLabel>Description</FormLabel>
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
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <MultiSelect
                        {...field}
                        disabled={field.disabled}
                        maxShow={4}
                        onChange={(tags) => field.onChange(tags)}
                        options={siteTagKeys}
                        placeholder="Please select tags"
                        renderOption={(key) => <div>{siteTagMap[key]}</div>}
                        renderValue={(key, methods) => (
                          <Badge variant="secondary">
                            <span>{siteTagMap[key]}</span>
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
                  name="logo"
                  render={({ field, fieldState }) => (
                    <div className="col-span-3">
                      <p className="mb-1 font-medium text-sm">Logo (Favicon)</p>
                      <MediaUploader
                        {...field}
                        autoUpload={true}
                        disabled={field.disabled}
                        errorMessage={fieldState.error?.message}
                        fileTypes="image"
                        onChange={(fileUrl) => field.onChange(fileUrl)}
                        onError={(message) => {
                          form.setError("logo", {
                            type: "custom",
                            message,
                          });
                        }}
                        placeholder="Upload logo"
                        value={field.value}
                      />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="siteOG"
                  render={({ field, fieldState }) => (
                    <div className="col-span-3">
                      <p className="mb-1 font-medium text-sm">OG Image</p>
                      <MediaUploader
                        {...field}
                        autoUpload={true}
                        disabled={field.disabled}
                        errorMessage={fieldState.error?.message}
                        fileTypes="image"
                        onChange={(fileUrl) => field.onChange(fileUrl)}
                        onError={(message) => {
                          form.setError("siteOG", {
                            type: "custom",
                            message,
                          });
                        }}
                        placeholder="Upload OG image"
                        value={field.value || ""}
                      />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="webCover"
                  render={({ field, fieldState }) => (
                    <div className="col-span-3">
                      <p className="mb-1 font-medium text-sm">Web Cover *</p>
                      <MediaUploader
                        {...field}
                        autoUpload={true}
                        disabled={field.disabled}
                        errorMessage={fieldState.error?.message}
                        fileTypes="image"
                        onChange={(fileUrl) => field.onChange(fileUrl)}
                        onError={(message) => {
                          form.setError("webCover", {
                            type: "custom",
                            message,
                          });
                        }}
                        placeholder="Upload web cover"
                        value={field.value}
                      />
                    </div>
                  )}
                />
                {isVideo ? (
                  <>
                    <FormField
                      control={form.control}
                      name="webRecord"
                      render={({ field, fieldState }) => (
                        <div className="col-span-3">
                          <p className="mb-1 font-medium text-sm">Web Record</p>
                          <MediaUploader
                            {...field}
                            autoUpload={true}
                            disabled={field.disabled}
                            errorMessage={fieldState.error?.message}
                            fileSizeLimit={24}
                            fileTypes="video"
                            onChange={(fileUrl) => field.onChange(fileUrl)}
                            onError={(message) => {
                              form.setError("webRecord", {
                                type: "custom",
                                message,
                              });
                            }}
                            placeholder="Upload web record"
                            value={field.value || ""}
                          />
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobileCover"
                      render={({ field, fieldState }) => (
                        <div className="col-span-3">
                          <p className="mb-1 font-medium text-sm">
                            Mobile Cover
                          </p>
                          <MediaUploader
                            {...field}
                            autoUpload={true}
                            disabled={field.disabled}
                            errorMessage={fieldState.error?.message}
                            fileTypes="image"
                            onChange={(fileUrl) => field.onChange(fileUrl)}
                            onError={(message) => {
                              form.setError("mobileCover", {
                                type: "custom",
                                message,
                              });
                            }}
                            placeholder="Upload mobile cover"
                            value={field.value || ""}
                          />
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobileRecord"
                      render={({ field, fieldState }) => (
                        <div className="col-span-3">
                          <p className="mb-1 font-medium text-sm">
                            Mobile Record
                          </p>
                          <MediaUploader
                            {...field}
                            autoUpload={true}
                            disabled={field.disabled}
                            errorMessage={fieldState.error?.message}
                            fileSizeLimit={24}
                            fileTypes="video"
                            onChange={(fileUrl) => field.onChange(fileUrl)}
                            onError={(message) => {
                              form.setError("mobileRecord", {
                                type: "custom",
                                message,
                              });
                            }}
                            placeholder="Upload mobile record"
                            value={field.value || ""}
                          />
                        </div>
                      )}
                    />
                  </>
                ) : null}
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={form.watch("isPinned")}
                  id="is-pinned"
                  onCheckedChange={(checked) =>
                    form.setValue("isPinned", checked)
                  }
                />
                <Label htmlFor="is-pinned">Pin to top</Label>
              </div>
            </div>

            <SheetFooter className="flex-shrink-0 border-t pt-4">
              <div className="mr-6 flex items-center space-x-2">
                <Switch
                  checked={isVideo}
                  id="video-ref"
                  onCheckedChange={setIsVideo}
                />
                <Label htmlFor="video-ref">Video Mode</Label>
              </div>
              <Button
                disabled={saveLoading}
                onClick={() => {
                  if (statusId) {
                    form.reset({
                      title: detailData.title ?? "",
                      description: detailData.description ?? "",
                      url: detailData.url ?? "",
                      logo: detailData.logo ?? "",
                      tags: detailData.tags ?? [],
                      rating: detailData.rating ?? 0,
                      isPinned: detailData.isPinned ?? false,
                      webCover: detailData.webCover ?? "",
                      webRecord: detailData.webRecord ?? "",
                      mobileCover: detailData.mobileCover ?? "",
                      mobileRecord: detailData.mobileRecord ?? "",
                      siteOG: detailData.siteOG ?? "",
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

SiteUpsertSheet.displayName = "SiteUpsertSheet";

export default SiteUpsertSheet;

"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Badge } from "../ui/badge";
import { api } from "@/lib/trpc/react";
import axios from "axios";
import mime from "mime";
import { Progress } from "../ui/progress";
import {
  BoxUploadIcon,
  BoxSyncIcon,
  BoxCloseIcon,
  ExpandIcon,
  Spinner,
} from "./icons";
import { IconButton } from "./icon-button";
import { env } from "@/env";
import {
  cn,
  getImageSizeByUrl,
  getPathnameByUrl,
  needLocalFile,
} from "@/lib/utils";
import { useToast } from "../ui/use-toast";

interface ImageUploaderProps
  extends Omit<
    React.ComponentPropsWithoutRef<"div">,
    "value" | "onChange" | "disabled" | "onError"
  > {
  name: string;
  value?: string;
  fileSizeLimit?: number; // MB
  fileTypes?: string[];
  // 转存地址判断， 用于判断地址是否需要转存
  needSyncStorage?: (url: string) => boolean;
  onError?: (message?: string) => void;
  onChange?: (url: string) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  subDescription?: React.ReactNode;
  placeholder?: React.ReactNode;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
  autoUpload?: boolean;

  onComputedSize?: (value: [number, number]) => void;
}

export const ImageUploader = forwardRef<HTMLDivElement, ImageUploaderProps>(
  (
    {
      name,
      value,
      fileSizeLimit = 10,
      fileTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/svg+xml",
        "image/x-icon",
        "image/vnd.microsoft.icon",
      ],
      needSyncStorage = needLocalFile,
      onError,
      onChange,
      onClick,
      subDescription = `SVG, PNG, JPG or WEBP (MAX. ${fileSizeLimit}M)`,
      placeholder = "Please select a image",
      errorMessage,
      disabled = false,
      autoUpload = false,

      onComputedSize,
      ...props
    },
    ref,
  ) => {
    const utils = api.useUtils();
    const { toast } = useToast();
    const [fileUrl, setFileUrl] = useState<string | null>(value || null);

    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);

    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
      setFileUrl(value ?? null);
    }, [value]);

    const previewInfo = useMemo(() => {
      if (fileUrl) {
        const file = new URL(fileUrl).pathname.split("/").pop();
        const ext = (file?.split(".") ?? []).pop();
        if (file) {
          return {
            name: file,
            type: ext?.toUpperCase(),
            url: fileUrl,
          };
        }
      } else if (file) {
        return {
          name: file.name,
          type: mime.getExtension(file.type)?.toUpperCase(),
          url: URL.createObjectURL(file),
        };
      }
      return null;
    }, [file, fileUrl]);
    const urlNeedSyncStorage = useMemo(() => {
      return fileUrl ? needSyncStorage(fileUrl) : false;
    }, [fileUrl, needSyncStorage]);

    const uploadAbortController = useRef<AbortController | null>(null);
    const downloadAbortController = useRef<AbortController | null>(null);

    // 清空
    const handleCleanFile = useCallback(() => {
      if (disabled) return;

      if (uploadLoading || syncLoading) {
        uploadAbortController.current?.abort();
        downloadAbortController.current?.abort();
      }
      setFile(null);
      setUploadLoading(false);
      setUploadProgress(0);
      setSyncLoading(false);
      setSyncProgress(0);

      if (!onChange) {
        setFileUrl(null);
      } else {
        onChange("");
      }
    }, [
      disabled,
      uploadLoading,
      syncLoading,
      uploadAbortController,
      downloadAbortController,
      onChange,
      setFileUrl,
    ]);

    const handleSaveFile = useCallback(
      async (file: File) => {
        if (disabled) return;
        try {
          setUploadLoading(true);
          const filename = file.name;
          if (!filename) {
            onError?.("Failed to get file of url");
            return;
          }
          const uploadUtil = await utils.upload.getUploadUrl.fetch(filename);

          if (!uploadUtil.uploadUrl) {
            onError?.("Failed to get upload url");
            return;
          }

          uploadAbortController.current = new AbortController();

          const result = await axios.put(uploadUtil.uploadUrl, file, {
            headers: { "Content-Type": file.type },
            onUploadProgress: ({ loaded, total = file.size }) => {
              const progress = Math.round((loaded / total) * 100);
              setUploadProgress(progress);
            },
            signal: uploadAbortController.current.signal,
          });

          if (result.status !== 200) {
            onError?.(`Failed to upload file: ${result.statusText}`);
            return;
          }
          const storageUrl = `${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/${uploadUtil.filename}`;

          setFile(null);
          if (!onChange) {
            setFileUrl(storageUrl);
          } else {
            onChange(storageUrl);
            if (onComputedSize) {
              const size = await getImageSizeByUrl(storageUrl);
              onComputedSize(size);
            }
          }
        } catch (err: any) {
          console.log("upload image file", err);
          toast({
            title: "Upload failed",
            description: err?.message ?? "Please try again",
            variant: "destructive",
          });
        } finally {
          setUploadLoading(false);
          uploadAbortController.current = null;
        }
      },
      [
        utils,
        disabled,
        onError,
        onChange,
        setFileUrl,
        uploadAbortController,
        onComputedSize,
        toast,
      ],
    );

    // 设置文件
    const handleSetFile = useCallback(
      (file: File) => {
        const fileSize = file.size;
        if (fileSize > fileSizeLimit * 1024 * 1024) {
          onError?.(`File size should be less than ${fileSizeLimit}MB`);
          return;
        }
        if (!fileTypes.includes(file.type)) {
          console.log("file.type", file.type);
          onError?.(`File type should be ${fileTypes.join(" or ")}`);
          return;
        }

        setFile(file);

        if (autoUpload) {
          handleSaveFile(file);
        }
      },
      [fileSizeLimit, fileTypes, onError, handleSaveFile, autoUpload],
    );

    const handleFileChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
          handleSetFile(selectedFile);
        }
      },
      [handleSetFile],
    );

    const handleDrop = useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget?.classList.remove("border-slate-700");
        if (disabled) return;
        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile) {
          handleSetFile(droppedFile);
        }
      },
      [disabled, handleSetFile],
    );

    // 同步
    const handleSyncFile = useCallback(async () => {
      if (disabled) return;
      if (!urlNeedSyncStorage) {
        return;
      }

      try {
        setSyncLoading(true);
        const proxyUrl = `/api/proxy/${btoa(fileUrl!)}`;

        downloadAbortController.current = new AbortController();
        const resFile = await axios.get<Blob>(proxyUrl, {
          responseType: "blob",
          onDownloadProgress: ({ loaded, total = 0 }) => {
            const progress = Math.round((loaded / total) * 100);
            setSyncProgress(progress);
          },
          signal: downloadAbortController.current.signal,
        });

        const fileName = getPathnameByUrl(fileUrl!);
        const saveFile = new File([resFile.data], fileName, {
          type: resFile.headers["content-type"],
        });

        await handleSaveFile(saveFile);
      } catch (err: any) {
        console.log("sync image file", err);
        toast({
          title: "Sync failed",
          description: err?.message ?? "Please try again",
          variant: "destructive",
        });
      } finally {
        setSyncLoading(false);
        downloadAbortController.current = null;
      }
    }, [
      disabled,
      fileUrl,
      handleSaveFile,
      urlNeedSyncStorage,
      setSyncLoading,
      setSyncProgress,
      toast
    ]);

    const handleExpandView = () => {
      if (previewInfo) {
        window.open(previewInfo.url, "_blank");
      }
    };

    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent<HTMLDivElement>, inBox: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setDragActive(inBox);
    };

    return (
      <div
        ref={ref}
        {...props}
        className={cn("rounded-lg bg-zinc-100 p-1", props.className)}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          onClick?.(e);
        }}
      >
        <label htmlFor={`file_uploader_${name}`}>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => handleDrag(e, true)}
            onDragLeave={(e) => handleDrag(e, false)}
            className={cn(
              "relative flex h-24 items-center justify-center overflow-hidden rounded-md border border-transparent bg-white focus-within:ring-2 focus-within:ring-slate-700 focus-within:ring-offset-2 hover:border-slate-700",
              {
                "cursor-not-allowed opacity-50": disabled,
                "cursor-pointer": !disabled,
                "border-slate-700": dragActive,
              },
            )}
          >
            {previewInfo ? (
              <div className="group relative h-full w-full">
                <img
                  src={previewInfo.url}
                  alt="preview"
                  className="h-full w-full object-contain"
                />
                <IconButton
                  type="button"
                  className="text-md invisible absolute right-1 top-1 bg-slate-950/45 backdrop-blur-sm group-hover:visible"
                  onClick={handleExpandView}
                >
                  <ExpandIcon />
                </IconButton>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-sm text-zinc-700">
                  Click to upload or drag and drop
                </div>
                <div className="text-xs text-zinc-500">{subDescription}</div>
              </div>
            )}
          </div>
        </label>
        <div className="mt-1 flex items-center justify-between space-x-2">
          {errorMessage ? (
            <div className="py-1 text-xs font-medium text-destructive">
              {errorMessage}
            </div>
          ) : (
            <div className="max-w-[72%] flex-grow text-sm">
              {file || fileUrl ? (
                syncLoading ? (
                  <Progress
                    value={(syncProgress + uploadProgress) / 2}
                    className="max-w-[240px]"
                  />
                ) : uploadLoading ? (
                  <Progress value={uploadProgress} className="max-w-[240px]" />
                ) : (
                  <div className="max-w-1/2 flex items-center space-x-2">
                    {previewInfo?.type && <Badge>{previewInfo.type}</Badge>}
                    {previewInfo?.name && (
                      <div className="truncate">{previewInfo.name}</div>
                    )}
                  </div>
                )
              ) : (
                <div className="ml-1 py-1 text-slate-500">{placeholder}</div>
              )}
            </div>
          )}
          {!disabled && (
            <div className="flex flex-shrink-0 items-center space-x-2">
              {file && !fileUrl && (
                <IconButton
                  type="button"
                  onClick={() => handleSaveFile(file)}
                  variant="ghost"
                  className="hover:bg-white"
                >
                  {uploadLoading ? <Spinner /> : <BoxUploadIcon />}
                </IconButton>
              )}
              {urlNeedSyncStorage && (
                <IconButton
                  type="button"
                  variant="ghost"
                  className="hover:bg-white"
                  onClick={handleSyncFile}
                >
                  {syncLoading ? <Spinner /> : <BoxSyncIcon />}
                </IconButton>
              )}
              {(file || fileUrl) && (
                <IconButton
                  type="button"
                  onClick={handleCleanFile}
                  variant="ghost"
                  className="hover:bg-white"
                >
                  <BoxCloseIcon />
                </IconButton>
              )}
            </div>
          )}
        </div>
        {!disabled && (
          <input
            id={`file_uploader_${name}`}
            name={name}
            type="file"
            hidden
            className="rs-only"
            accept={fileTypes.join(",")}
            onChange={handleFileChange}
          />
        )}
      </div>
    );
  },
);

ImageUploader.displayName = "ImageUploader";

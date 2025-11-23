import { z } from "zod";
import { getR2SignedUploadUrl } from "@/lib/upload";
import { protectedProcedure } from "@/server/api/orpc";

// 获取上传 URL
const getUploadUrlProcedure = protectedProcedure
  .input(
    z
      .string()
      .min(1)
      .max(1024)
      .refine(
        (value) => {
          const suffix = value.split(".").pop();
          return (
            suffix &&
            [
              "jpg",
              "jpeg",
              "png",
              "gif",
              "svg",
              "webp",
              "ico",
              "mp4",
              "webm",
            ].includes(suffix)
          );
        },
        { message: "Invalid file type" }
      )
  )
  .handler(async ({ input }) => getR2SignedUploadUrl(input));

export const uploadRouter = {
  getUploadUrl: getUploadUrlProcedure,
};

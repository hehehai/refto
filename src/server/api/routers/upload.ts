import { z } from "zod";
import { getR2SignedUploadUrl } from "@/lib/upload";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const uploadRouter = createTRPCRouter({
  getUploadUrl: protectedProcedure
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
    .query(async ({ input }) => getR2SignedUploadUrl(input)),
});

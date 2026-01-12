import { ORPCError } from "@orpc/server";
import { markerListSchema } from "@refto-one/common";
import { eq } from "@refto-one/db";
import { sitePageVersions, videoMarkers } from "@refto-one/db/schema/sites";
import { publicProcedure } from "../../index";

export const appMarkerRouter = {
  list: publicProcedure
    .input(markerListSchema)
    .handler(async ({ input, context }) => {
      const { versionId } = input;
      const { db } = context;

      const version = await db.query.sitePageVersions.findFirst({
        where: eq(sitePageVersions.id, versionId),
      });

      if (!version) {
        throw new ORPCError("NOT_FOUND", { message: "Version not found" });
      }

      return db.query.videoMarkers.findMany({
        where: eq(videoMarkers.versionId, versionId),
        orderBy: (markers, { asc }) => [
          asc(markers.time),
          asc(markers.createdAt),
        ],
      });
    }),
};

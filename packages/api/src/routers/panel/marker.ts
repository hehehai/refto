import { ORPCError } from "@orpc/server";
import { markerBulkSaveSchema, markerListSchema } from "@refto-one/common";
import { eq } from "@refto-one/db";
import { sitePageVersions, videoMarkers } from "@refto-one/db/schema/sites";
import { adminProcedure } from "../../index";
import { generateId } from "../../lib/utils";

export const markerRouter = {
  // List markers for a version
  list: adminProcedure
    .input(markerListSchema)
    .handler(async ({ input, context }) => {
      const { versionId } = input;
      const { db } = context;

      // Verify version exists
      const version = await db.query.sitePageVersions.findFirst({
        where: eq(sitePageVersions.id, versionId),
      });

      if (!version) {
        throw new ORPCError("NOT_FOUND", { message: "Version not found" });
      }

      const markers = await db.query.videoMarkers.findMany({
        where: eq(videoMarkers.versionId, versionId),
        orderBy: (markers, { asc }) => [
          asc(markers.time),
          asc(markers.createdAt),
        ],
      });

      return markers;
    }),

  // Bulk save markers (replaces all markers for a version)
  bulkSave: adminProcedure
    .input(markerBulkSaveSchema)
    .handler(async ({ input, context }) => {
      const { versionId, markers } = input;
      const { db } = context;

      // Verify version exists
      const version = await db.query.sitePageVersions.findFirst({
        where: eq(sitePageVersions.id, versionId),
      });

      if (!version) {
        throw new ORPCError("NOT_FOUND", { message: "Version not found" });
      }

      // Delete all existing markers for this version
      await db
        .delete(videoMarkers)
        .where(eq(videoMarkers.versionId, versionId));

      // Insert new markers
      if (markers.length > 0) {
        const markersToInsert = markers.map((marker) => ({
          id: marker.id ?? generateId(),
          versionId,
          time: marker.time,
          text: marker.text ?? null,
        }));

        await db.insert(videoMarkers).values(markersToInsert);
      }

      // Return the saved markers
      const savedMarkers = await db.query.videoMarkers.findMany({
        where: eq(videoMarkers.versionId, versionId),
        orderBy: (markers, { asc }) => [
          asc(markers.time),
          asc(markers.createdAt),
        ],
      });

      return savedMarkers;
    }),
};

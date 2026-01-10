import { ORPCError } from "@orpc/server";
import { markerBulkSaveSchema, markerListSchema } from "@refto-one/common";
import { and, eq } from "@refto-one/db";
import { sitePageVersions, videoMarkers } from "@refto-one/db/schema/sites";
import { adminProcedure } from "../../index";
import { generateId } from "../../lib/utils";

export const markerRouter = {
  // List markers for a version + record type
  list: adminProcedure
    .input(markerListSchema)
    .handler(async ({ input, context }) => {
      const { versionId, recordType } = input;
      const { db } = context;

      // Verify version exists
      const version = await db.query.sitePageVersions.findFirst({
        where: eq(sitePageVersions.id, versionId),
      });

      if (!version) {
        throw new ORPCError("NOT_FOUND", { message: "Version not found" });
      }

      const markers = await db.query.videoMarkers.findMany({
        where: and(
          eq(videoMarkers.versionId, versionId),
          eq(videoMarkers.recordType, recordType)
        ),
        orderBy: (markers, { asc }) => [asc(markers.sequence)],
      });

      return markers;
    }),

  // Bulk save markers (replaces all markers for version+recordType)
  bulkSave: adminProcedure
    .input(markerBulkSaveSchema)
    .handler(async ({ input, context }) => {
      const { versionId, recordType, markers } = input;
      const { db } = context;

      // Verify version exists
      const version = await db.query.sitePageVersions.findFirst({
        where: eq(sitePageVersions.id, versionId),
      });

      if (!version) {
        throw new ORPCError("NOT_FOUND", { message: "Version not found" });
      }

      // Delete all existing markers for this version+recordType
      await db
        .delete(videoMarkers)
        .where(
          and(
            eq(videoMarkers.versionId, versionId),
            eq(videoMarkers.recordType, recordType)
          )
        );

      // Insert new markers
      if (markers.length > 0) {
        const markersToInsert = markers.map((marker) => ({
          id: marker.id ?? generateId(),
          versionId,
          recordType,
          sequence: marker.sequence,
          time: marker.time,
          text: marker.text ?? null,
        }));

        await db.insert(videoMarkers).values(markersToInsert);
      }

      // Return the saved markers
      const savedMarkers = await db.query.videoMarkers.findMany({
        where: and(
          eq(videoMarkers.versionId, versionId),
          eq(videoMarkers.recordType, recordType)
        ),
        orderBy: (markers, { asc }) => [asc(markers.sequence)],
      });

      return savedMarkers;
    }),
};

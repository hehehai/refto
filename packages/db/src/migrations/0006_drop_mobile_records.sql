DELETE FROM "video_markers" WHERE "recordType" = 'mobile';--> statement-breakpoint
DROP INDEX IF EXISTS "video_markers_version_type_idx";--> statement-breakpoint
ALTER TABLE "video_markers" DROP COLUMN "recordType";--> statement-breakpoint
CREATE INDEX "video_markers_version_idx" ON "video_markers" USING btree ("versionId");--> statement-breakpoint
ALTER TABLE "site_page_versions" DROP COLUMN "mobileCover";--> statement-breakpoint
ALTER TABLE "site_page_versions" DROP COLUMN "mobileRecord";--> statement-breakpoint

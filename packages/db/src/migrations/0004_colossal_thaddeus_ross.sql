ALTER TABLE "sites" DROP CONSTRAINT "sites_url_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "sites_url_unique" ON "sites" USING btree ("url") WHERE "sites"."deleted_at" IS NULL;
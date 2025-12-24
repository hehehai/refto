CREATE TYPE "public"."event_type" AS ENUM('VERSION_LIKED', 'VERSION_UNLIKED');--> statement-breakpoint
CREATE TABLE "event_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" "event_type" NOT NULL,
	"user_id" text,
	"target_id" text,
	"target_type" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_logs_type_created_at_idx" ON "event_logs" USING btree ("event_type","created_at");--> statement-breakpoint
CREATE INDEX "event_logs_target_idx" ON "event_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "event_logs_user_created_at_idx" ON "event_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "submit_sites_user_id_idx" ON "submit_sites" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "submit_sites_status_idx" ON "submit_sites" USING btree ("status");--> statement-breakpoint
CREATE INDEX "submit_sites_created_at_idx" ON "submit_sites" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "submit_sites_status_created_at_idx" ON "submit_sites" USING btree ("status","created_at");
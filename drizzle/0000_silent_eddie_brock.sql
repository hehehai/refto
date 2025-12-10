CREATE TYPE "public"."SubmitSiteStatus" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'USER' NOT NULL,
	"banned" boolean DEFAULT false,
	"banReason" text,
	"banExpires" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"sites" jsonb NOT NULL,
	"weekStart" timestamp NOT NULL,
	"weekEnd" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_page_version_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"versionId" text NOT NULL,
	"userId" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_page_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"pageId" text NOT NULL,
	"versionDate" timestamp DEFAULT now() NOT NULL,
	"versionNote" text,
	"siteOG" text,
	"webCover" text NOT NULL,
	"webRecord" text,
	"mobileCover" text,
	"mobileRecord" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"siteId" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"logo" text NOT NULL,
	"url" text NOT NULL,
	"tags" text[] NOT NULL,
	"rating" integer DEFAULT 0 NOT NULL,
	"isPinned" boolean DEFAULT false NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"createdById" text NOT NULL,
	CONSTRAINT "sites_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "submit_sites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "submit_sites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" text NOT NULL,
	"siteUrl" text NOT NULL,
	"siteTitle" text NOT NULL,
	"siteDescription" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" "SubmitSiteStatus" DEFAULT 'PENDING' NOT NULL,
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"userId" text
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_page_version_likes" ADD CONSTRAINT "site_page_version_likes_versionId_site_page_versions_id_fk" FOREIGN KEY ("versionId") REFERENCES "public"."site_page_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_page_version_likes" ADD CONSTRAINT "site_page_version_likes_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_page_versions" ADD CONSTRAINT "site_page_versions_pageId_site_pages_id_fk" FOREIGN KEY ("pageId") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_pages" ADD CONSTRAINT "site_pages_siteId_sites_id_fk" FOREIGN KEY ("siteId") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_createdById_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submit_sites" ADD CONSTRAINT "submit_sites_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_idx" ON "account" USING btree ("providerId","accountId");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_identifier_value_idx" ON "verification" USING btree ("identifier","value");--> statement-breakpoint
CREATE UNIQUE INDEX "site_page_version_likes_version_user_idx" ON "site_page_version_likes" USING btree ("versionId","userId");--> statement-breakpoint
CREATE INDEX "site_page_version_likes_version_idx" ON "site_page_version_likes" USING btree ("versionId");--> statement-breakpoint
CREATE INDEX "site_page_versions_page_id_idx" ON "site_page_versions" USING btree ("pageId");--> statement-breakpoint
CREATE INDEX "site_page_versions_date_idx" ON "site_page_versions" USING btree ("pageId","versionDate");--> statement-breakpoint
CREATE INDEX "site_pages_site_id_idx" ON "site_pages" USING btree ("siteId");--> statement-breakpoint
CREATE INDEX "site_pages_default_idx" ON "site_pages" USING btree ("siteId","isDefault");--> statement-breakpoint
CREATE UNIQUE INDEX "site_pages_site_url_idx" ON "site_pages" USING btree ("siteId","url");--> statement-breakpoint
CREATE INDEX "sites_url_idx" ON "sites" USING btree ("url");--> statement-breakpoint
CREATE INDEX "sites_pinned_idx" ON "sites" USING btree ("isPinned");--> statement-breakpoint
CREATE INDEX "sites_tags_idx" ON "sites" USING btree ("tags");
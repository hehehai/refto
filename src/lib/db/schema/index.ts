// Re-export all enums

// Re-export all auth tables and relations
export * from "./auth";
// Re-export all business tables
export * from "./business";
export * from "./enums";
// Re-export all site tables and relations
export * from "./sites";

// Re-export all submission tables and relations
export * from "./submissions";

// Type adapters for backward compatibility
import type { Site } from "./sites";

// Extended type for Site query results (includes joined fields from pages and versions)
export type SiteWithQueryData = Site & {
  pageId: string;
  versionId?: string;
  webCover: string;
  createdAt: Date;
};

// Type for site detail page (with optional fields from detail query)
export type SiteDetailData = Site & {
  pageId?: string;
  pageTitle?: string;
  pageUrl?: string;
  versionId?: string;
  siteOG?: string | null;
  webCover?: string;
  webRecord?: string | null;
  mobileCover?: string | null;
  mobileRecord?: string | null;
  versionNote?: string | null;
  pages?: Array<{
    id: string;
    siteId: string;
    title: string;
    url: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    versions: Array<{
      id: string;
      pageId: string;
      versionDate: Date;
      siteOG: string | null;
      webCover: string;
      webRecord: string | null;
      mobileCover: string | null;
      mobileRecord: string | null;
      versionNote: string | null;
      createdAt: Date;
    }>;
  }>;
};

// Legacy type alias for backward compatibility
export type RefSite = SiteWithQueryData & {
  // Map old field names to new ones
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteFavicon: string;
  siteUrl: string;
  siteTags: string[];
  isTop: boolean;
  siteCover: string;
  siteOGImage?: string;
  siteRecord?: string;
  siteScreenshot?: string;
};

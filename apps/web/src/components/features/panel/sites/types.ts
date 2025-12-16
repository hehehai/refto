import type { client } from "@/lib/orpc";

// Type from oRPC API response
type SiteListResponse = Awaited<ReturnType<typeof client.panel.site.list>>;
export type SiteRow = SiteListResponse["items"][number];

type SiteDetailResponse = Awaited<ReturnType<typeof client.panel.site.getById>>;
export type SiteDetail = SiteDetailResponse;

import type { client } from "@/lib/orpc";

// Type from oRPC API response
type SubmitSiteListResponse = Awaited<
  ReturnType<typeof client.panel.submitSite.list>
>;

export type SubmitSiteRow = SubmitSiteListResponse["items"][number];

export type SubmitSiteStatus = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

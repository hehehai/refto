import type { client } from "@/lib/orpc";

type SubmitSiteListResponse = Awaited<
  ReturnType<typeof client.features.submitSite.list>
>;

export type SubmitSiteRow = SubmitSiteListResponse[number];

export type SubmitStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

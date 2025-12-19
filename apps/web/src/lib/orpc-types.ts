import type { InferClientOutputs } from "@orpc/client";
import type { client } from "./orpc";

type ClientOutputs = InferClientOutputs<typeof client>;

// Site Types
export type PinnedSitesOutput = ClientOutputs["app"]["site"]["getPinnedSites"];
export type PinnedSite = PinnedSitesOutput[number];

export type VersionsFeedOutput =
  ClientOutputs["app"]["site"]["getVersionsFeed"];
export type FeedItem = VersionsFeedOutput["items"][number];

// Like Types
export type UserLikesOutput = ClientOutputs["app"]["like"]["getUserLikes"];
export type LikeItem = UserLikesOutput["items"][number];

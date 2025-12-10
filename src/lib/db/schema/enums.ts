import { pgEnum } from "drizzle-orm/pg-core";

// Enums
export const submitSiteStatusEnum = pgEnum("SubmitSiteStatus", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

// Enum type exports
export type SubmitSiteStatus = (typeof submitSiteStatusEnum.enumValues)[number];

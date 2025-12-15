import { asc, desc } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

// Pagination types
export interface PaginationInput {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Calculate pagination offset
export function getPaginationOffset(input: PaginationInput): number {
  return (input.page - 1) * input.pageSize;
}

// Build pagination result
export function buildPaginationResult<T>(
  items: T[],
  total: number,
  input: PaginationInput
): PaginationResult<T> {
  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.ceil(total / input.pageSize),
  };
}

// Sort order helper
export function getSortOrder(column: PgColumn, order: "asc" | "desc" = "desc") {
  return order === "asc" ? asc(column) : desc(column);
}

// Get count from query result
export function getCountFromResult(
  result: { count: number }[] | undefined
): number {
  return result?.[0]?.count ?? 0;
}

// Time range types for stats
export type StatPeriod = "24h" | "7d" | "15d" | "30d";

export interface TimeRange {
  currentStart: Date;
  previousStart: Date;
  previousEnd: Date;
}

// Period to milliseconds mapping
const PERIOD_MS: Record<StatPeriod, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "15d": 15 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

// Get time range for stats comparison
export function getTimeRange(period: StatPeriod): TimeRange {
  const now = new Date();
  const ms = PERIOD_MS[period];
  const currentStart = new Date(now.getTime() - ms);
  const previousStart = new Date(currentStart.getTime() - ms);

  return {
    currentStart,
    previousStart,
    previousEnd: currentStart,
  };
}

// Calculate percentage change between two periods
export function calculateChangePercent(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
}

// Generate a unique ID using crypto
export function generateId(): string {
  return crypto.randomUUID();
}

// Hash password using SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

import { site } from "./site";

export function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.VERCEL_ENV === "production") {
    return site.url;
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3001";
  }
  return site.url;
}

import { site } from "./site";

export function getBaseUrl() {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3001";
  }
  return site.url;
}

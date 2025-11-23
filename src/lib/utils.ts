import { type ClassValue, clsx } from "clsx";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { NextRequest } from "next/server";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { env } from "@/env";
import { site } from "@/lib/config/site";

export function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return site.url;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRealIp = (req: NextRequest) => {
  // In Next.js 16, req.ip is removed, use headers instead
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(", ").shift() || "unknown";
  }
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }
  return "unknown";
};

export const getSearchParams = (url: string | ReadonlyURLSearchParams) => {
  // Create a params object
  const params = {} as Record<string, string>;

  if (typeof url === "string") {
    new URL(url).searchParams.forEach((val, key) => {
      params[key] = val;
    });
  } else {
    url.forEach((val, key) => {
      params[key] = val;
    });
  }

  return params;
};

export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const genOrderValidSchema = <T = Record<string, unknown>, U = keyof T>(
  keys: U[]
) => {
  const regex = new RegExp(`^(-|\\+)(${keys.join("|")})$`);
  return z.array(z.string().regex(regex)).max(keys.length, "Invalid order");
};

export const formatOrder = (
  order: string
): { key: string; dir: "asc" | "desc" } => {
  let nOrder = order;
  if (!/^-|\+/.test(nOrder)) {
    nOrder = `+${nOrder}`;
  }

  const key = nOrder.slice(1);
  const dir = (nOrder.startsWith("+") ? "asc" : "desc") as "asc" | "desc";
  return { key, dir };
};

export const formatOrders = (
  orders?: string[]
): { key: string; dir: "asc" | "desc" }[] | undefined =>
  orders ? orders.map(formatOrder) : undefined;

export const getPathnameByUrl = (url: string) =>
  new URL(url).pathname.replace(/^\/+/, "");

export const needLocalFile = (url: string) => {
  if (url.trim() === "") return false;
  if (!url.startsWith(env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL)) {
    return true;
  }
  return false;
};

export const safeDownloadFileByUrl = async (url: string) =>
  new Promise<File>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const img = document.createElement("img");
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(img, 0, 0, img.width, img.height);
        canvas.getContext("2d")?.drawImage(img, 0, 0, img.width, img.height);
      }
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], "image.png"));
          } else {
            reject();
          }
        },
        "image/png",
        0.95
      );
    };
    img.setAttribute("crossOrigin", "Anonymous");
    img.src = url;
  });

export const getImageSizeByUrl = async (url: string) =>
  new Promise<[number, number]>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve([img.width, img.height]);
    };
    img.onerror = () => {
      reject();
    };
    img.src = url;
  });

export const linkWithRef = (url: string, ref: string) => {
  const link = new URL(url);
  link.searchParams.set("ref", ref);

  return link.href;
};

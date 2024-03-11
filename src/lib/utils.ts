import { env } from "@/env";
import { type ClassValue, clsx } from "clsx";
import { type ReadonlyURLSearchParams } from "next/navigation";
import { type NextRequest } from "next/server";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { site } from "./config/site";

export function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return site.url;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRealIp = (req: NextRequest) => {
  if (req.ip) {
    return req.ip;
  }
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(", ").shift() || "unknown";
  }
  return "unknown";
};

export const getSearchParams = (url: string | ReadonlyURLSearchParams) => {
  // Create a params object
  const params = {} as Record<string, string>;

  if (typeof url === "string") {
    new URL(url).searchParams.forEach(function (val, key) {
      params[key] = val;
    });
  } else {
    url.forEach(function (val, key) {
      params[key] = val;
    });
  }

  return params;
};

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const genOrderValidSchema = <T = Record<string, unknown>, U = keyof T>(
  keys: U[],
) => {
  const regex = new RegExp(`^(-|\\+)(${keys.join("|")})$`);
  return z.array(z.string().regex(regex)).max(keys.length, "Invalid order");
};

export const formatOrder = (order: string) => {
  if (!/^-|\+/.test(order)) {
    order = `+${order}`;
  }

  const key = order.slice(1);
  const dir = order.startsWith("+") ? "asc" : "desc";
  return { key, dir };
};

export const formatOrders = (orders?: string[]) => {
  return orders ? orders.map(formatOrder) : orders;
};

export const getPathnameByUrl = (url: string) => {
  return new URL(url).pathname.replace(/^\/+/, "");
};

export const needLocalFile = (url: string) => {
  if (url.trim() === "") return false;
  if (!url.startsWith(env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL)) {
    return true;
  }
  return false;
};

export const safeDownloadFileByUrl = async (url: string) => {
  return new Promise<File>((resolve, reject) => {
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
        "0.95",
      );
    };
    img.setAttribute("crossOrigin", "Anonymous");
    img.src = url;
  });
};

export const getImageSizeByUrl = async (url: string) => {
  return new Promise<[number, number]>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve([img.width, img.height]);
    };
    img.onerror = () => {
      reject();
    };
    img.src = url;
  });
};

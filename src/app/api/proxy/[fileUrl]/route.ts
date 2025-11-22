import { NextResponse } from "next/server";
import { z } from "zod";
import { getPathnameByUrl } from "@/lib/utils";

export const revalidate = 21_600; // 6h

const worthParamsSchema = z.object({
  fileUrl: z.coerce
    .string()
    .min(1, { message: "图片路径不可为空" })
    .transform((value) => atob(value))
    .refine(
      (value) => value.match(/\.(png|jpg|jpeg|svg|webp)$/i),
      "图片路径格式错误"
    ),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileUrl: string }> }
) {
  try {
    const resolvedParams = await params;
    const { fileUrl } = worthParamsSchema.parse(resolvedParams);
    const res = await fetch(fileUrl);
    const blob = await res.blob();

    const headers = new Headers();
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    headers.set("Content-Type", contentType);
    headers.set("Content-Length", String(blob.size));
    headers.set(
      "Content-Disposition",
      `inline; filename="${getPathnameByUrl(fileUrl)}"`
    );
    return new NextResponse(blob, { status: 200, statusText: "OK", headers });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 400 });
    }
    return new Response("Server Error", { status: 500 });
  }
}

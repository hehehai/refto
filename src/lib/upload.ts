"use server";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { format } from "date-fns";
import { env } from "@/env";
import { getSafeFilename } from "@/lib/utils.server";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUD_FLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUD_FLARE_S3_UPLOAD_KEY,
    secretAccessKey: env.CLOUD_FLARE_S3_UPLOAD_SECRET,
  },
});

export async function getR2SignedUploadUrl(fileName: string) {
  try {
    console.log("[R2] Generating upload URL");

    const safeFilename = `${format(new Date(), "yy-MM-dd")}/${Date.now()}${getSafeFilename(fileName)}`;
    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: env.CLOUD_FLARE_S3_UPLOAD_BUCKET,
        Key: safeFilename,
      }),
      { expiresIn: 60 }
    );

    console.log(`[R2] Generating upload URL (${safeFilename}): `, signedUrl);

    return {
      uploadUrl: signedUrl,
      filename: safeFilename,
    };
  } catch (err) {
    console.error("[R2] Generating upload URL", err);
    throw err;
  }
}

export async function getR2File(fileName: string) {
  try {
    console.log("[R2] Downloading file");

    const file = await r2.send(
      new GetObjectCommand({
        Bucket: env.CLOUD_FLARE_S3_UPLOAD_BUCKET,
        Key: fileName,
      })
    );
    if (!file) {
      throw new Error("File not found");
    }
    return file;
  } catch (err) {
    console.error("[R2] Downloading file", err);
    throw err;
  }
}

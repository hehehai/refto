import type { ComponentProps } from "react";

// Cloudflare Image Transformations options
export interface CFImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: "cover" | "contain" | "scale-down" | "crop";
  format?: "auto" | "webp" | "avif" | "json";
}

// Image presets for common use cases
export const IMAGE_PRESETS = {
  // Avatars
  avatar: { width: 80, height: 80, fit: "cover", quality: 80 },
  avatarSm: { width: 40, height: 40, fit: "cover", quality: 80 },
  avatarLg: { width: 160, height: 160, fit: "cover", quality: 80 },

  // Site logos
  logo: { width: 64, height: 64, fit: "contain", quality: 85 },
  logoSm: { width: 32, height: 32, fit: "contain", quality: 85 },

  // Version covers
  webCover: { width: 800, quality: 80, fit: "cover" },
  webCoverThumb: { width: 400, quality: 75, fit: "cover" },
  mobileCover: { width: 400, quality: 80, fit: "cover" },
  mobileCoverThumb: { width: 200, quality: 75, fit: "cover" },

  // OG images
  og: { width: 1200, height: 630, quality: 85, fit: "cover" },
} as const satisfies Record<string, CFImageOptions>;

export type ImagePreset = keyof typeof IMAGE_PRESETS;

const R2_BASE_URL = import.meta.env.VITE_CLOUD_FLARE_R2_URL as string;

/**
 * Generate Cloudflare Image Transformations URL
 * @param src - Original image URL
 * @param options - Transformation options
 * @returns Transformed image URL
 */
export function getCFImageUrl(
  src: string | undefined | null,
  options: CFImageOptions = {}
): string {
  if (!src) return "";

  // Only transform R2 images
  if (!(R2_BASE_URL && src.startsWith(R2_BASE_URL))) {
    return src;
  }

  // Extract path from URL
  const path = src.replace(`${R2_BASE_URL}/`, "");

  // Build transformation params
  const params = [
    options.width && `width=${options.width}`,
    options.height && `height=${options.height}`,
    options.quality && `quality=${options.quality}`,
    options.fit && `fit=${options.fit}`,
    `format=${options.format || "auto"}`,
  ]
    .filter(Boolean)
    .join(",");

  return `${R2_BASE_URL}/cdn-cgi/image/${params}/${path}`;
}

/**
 * Get transformed image URL using preset
 * @param src - Original image URL
 * @param preset - Preset name
 * @returns Transformed image URL
 */
export function getCFImageUrlByPreset(
  src: string | undefined | null,
  preset: ImagePreset
): string {
  return getCFImageUrl(src, IMAGE_PRESETS[preset]);
}

// CFImage component props
interface CFImageProps extends Omit<ComponentProps<"img">, "src"> {
  src: string | undefined | null;
  preset?: ImagePreset;
  cfWidth?: number;
  cfHeight?: number;
  cfQuality?: number;
  cfFit?: CFImageOptions["fit"];
}

/**
 * CFImage - Cloudflare Image Transformations component
 *
 * Usage:
 * - With preset: <CFImage src={url} preset="avatar" />
 * - With custom options: <CFImage src={url} cfWidth={200} cfHeight={200} />
 * - Fallback to original: <CFImage src={externalUrl} /> (non-R2 URLs pass through)
 */
export function CFImage({
  src,
  preset,
  cfWidth,
  cfHeight,
  cfQuality,
  cfFit,
  alt = "",
  ...props
}: CFImageProps) {
  const options: CFImageOptions = preset
    ? IMAGE_PRESETS[preset]
    : {
        width: cfWidth,
        height: cfHeight,
        quality: cfQuality,
        fit: cfFit,
      };

  const transformedSrc = getCFImageUrl(src, options);

  return <img alt={alt} src={transformedSrc} {...props} />;
}

const SITE_NAME = "Refto";
const DEFAULT_DESCRIPTION =
  "Unleash limitless inspiration. Embrace pure simplicity.";
const DEFAULT_OG_IMAGE = "/og-image.png";
const SITE_URL = "https://refto.one";

interface PageMetaOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

interface MetaTag {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
}

interface LinkTag {
  rel: string;
  href: string;
}

interface HeadConfig {
  meta: MetaTag[];
  links: LinkTag[];
}

export function createPageMeta(options: PageMetaOptions = {}): HeadConfig {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_OG_IMAGE,
    url,
    type = "website",
    noIndex = false,
  } = options;

  const fullTitle = title ? `${title} - ${SITE_NAME}` : SITE_NAME;
  const fullImageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : undefined;

  const meta: MetaTag[] = [
    { title: fullTitle },
    { name: "description", content: description },

    // Open Graph
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:image", content: fullImageUrl },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: fullImageUrl },
  ];

  if (canonicalUrl) {
    meta.push({ property: "og:url", content: canonicalUrl });
  }

  if (noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  const links: LinkTag[] = [];
  if (canonicalUrl) {
    links.push({ rel: "canonical", href: canonicalUrl });
  }

  return { meta, links };
}

export function createDetailPageMeta(
  siteName: string,
  siteDescription?: string | null,
  coverImage?: string | null,
  pageVersionId?: string
): HeadConfig {
  return createPageMeta({
    title: siteName,
    description:
      siteDescription ||
      `Explore ${siteName} design on Refto. ${DEFAULT_DESCRIPTION}`,
    image: coverImage || DEFAULT_OG_IMAGE,
    url: pageVersionId ? `/${pageVersionId}` : undefined,
    type: "article",
  });
}

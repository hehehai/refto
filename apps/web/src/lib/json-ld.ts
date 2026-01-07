import { site } from "@refto-one/common";

interface ScriptTag {
  type: string;
  children: string;
}

/**
 * Organization schema for the website
 */
export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.siteName,
    url: site.url,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/images/logo.png`,
    },
    sameAs: [site.githubUrl],
  };
}

/**
 * WebSite schema with search action
 */
export function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.siteName,
    url: site.url,
    description: site.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

interface ArticleSchemaParams {
  title: string;
  description: string;
  image: string;
  url: string;
  datePublished?: Date;
  dateModified?: Date;
  tags?: string[];
}

/**
 * Article/CreativeWork schema for site detail pages
 */
export function createSiteArticleSchema(params: ArticleSchemaParams) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: params.title,
    headline: params.title,
    description: params.description,
    image: params.image.startsWith("http")
      ? params.image
      : `${site.url}${params.image}`,
    url: `${site.url}${params.url}`,
    publisher: {
      "@type": "Organization",
      name: site.siteName,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/images/logo.png`,
      },
    },
    datePublished: params.datePublished?.toISOString(),
    dateModified: params.dateModified?.toISOString(),
    keywords: params.tags?.join(", "),
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * BreadcrumbList schema
 */
export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.url}`,
    })),
  };
}

/**
 * Helper to create script tag for head config
 */
export function createJsonLdScript(schema: object): ScriptTag {
  return {
    type: "application/ld+json",
    children: JSON.stringify(schema),
  };
}

import "@/styles/globals.css";

import { Providers } from "@/app/_components/providers";
import { GoogleAnalytics } from "@next/third-parties/google";

import { cn } from "@/lib/utils";
import { site } from "@/lib/config/site";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { outfit } from "@/lib/font";
import { env } from "@/env";
import { type SiteLocale } from "@/i18n";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Meta" });

  const metadata: Metadata = {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} - ${t("title")}`,
      template: `%s | ${site.name}`,
    },
    description: t("description"),
    keywords: site.keywords[locale as SiteLocale],
    icons: site.icons,
    openGraph: {
      title: site.name,
      description: site.description[locale as SiteLocale],
      url: site.url,
      siteName: site.name,
      locale: locale,
      type: "website",
      images: [
        {
          url: site.ogImage,
          width: 1200,
          height: 630,
        },
      ],
    },
  };

  return metadata;
}

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          outfit.variable,
        )}
      >
        {locale === "zh-CN" && (
          <link
            rel="stylesheet"
            crossOrigin="anonymous"
            href="https://cdn.jsdelivr.net/npm/misans@4.0.0/lib/Normal/MiSans-Regular.min.css"
          />
        )}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
      {env.NODE_ENV !== "development" && <GoogleAnalytics gaId={site.ga} />}
    </html>
  );
}

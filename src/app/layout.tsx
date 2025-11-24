import "@/styles/globals.css";

import type { Metadata } from "next";
import { Providers } from "@/app/_components/providers";
import { site } from "@/lib/config/site";
import { outfit } from "@/lib/font";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - ${site.description}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  icons: site.icons,
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "en",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          outfit.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

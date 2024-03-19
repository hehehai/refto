import "@/styles/globals.css";

import { Outfit } from "next/font/google";
import { Providers } from "@/app/_components/providers";
import { GoogleAnalytics } from '@next/third-parties/google'

import { cn } from "@/lib/utils";
import { site } from "@/lib/config/site";
import { type Metadata } from "next";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - Unleash limitless inspiration Embrace pure simplicity`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  icons: site.icons,
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
          outfit.variable,
        )}
      >
        <Providers>{children}</Providers>
      </body>
      <GoogleAnalytics gaId="G-SHWYRC6QM5" />
    </html>
  );
}

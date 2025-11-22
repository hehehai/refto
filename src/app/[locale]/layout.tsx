import '@/styles/globals.css'

import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { Providers } from '@/app/_components/providers'
import type { SiteLocale } from '@/i18n'
import { site } from '@/lib/config/site'
import { outfit } from '@/lib/font'
import { cn } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Meta' })

  const metadata: Metadata = {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} - ${t('title')}`,
      template: `%s | ${site.name}`,
    },
    description: t('description'),
    keywords: site.keywords[locale as SiteLocale],
    icons: site.icons,
    openGraph: {
      title: site.name,
      description: site.description[locale as SiteLocale],
      url: site.url,
      siteName: site.name,
      locale,
      type: 'website',
      images: [
        {
          url: site.ogImage,
          width: 1200,
          height: 630,
        },
      ],
    },
  }

  return metadata
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          outfit.variable,
        )}
      >
        {locale === 'zh-CN' && (
          <link
            crossOrigin="anonymous"
            href="https://cdn.jsdelivr.net/npm/misans@4.0.0/lib/Normal/MiSans-Regular.min.css"
            rel="stylesheet"
          />
        )}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

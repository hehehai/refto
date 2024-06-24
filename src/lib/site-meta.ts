import { env } from '@/env'
import { load } from 'cheerio'
import { ProxyAgent } from 'undici'

export const formatUrl = (url: string, site: string) => {
  if (!url.startsWith('http://') || !url.startsWith('https://')) {
    return new URL(url, site).href
  }
  return url
}

export async function getSiteMetaByUrl(url: string) {
  try {
    const res = await fetch(url, {
      next: {
        revalidate: 3600,
      },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
      },
      agent: env.LOCAL_PROXY_URL
        ? new ProxyAgent(env.LOCAL_PROXY_URL)
        : undefined,
    } as any)
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`)
    }

    const text = await res.text()
    if (!text?.length) {
      throw new Error('Empty response')
    }

    const $doc = load(text)
    const siteTitle = $doc('title').text()
    const siteDescription = $doc('meta[name=description]').attr('content')
    const siteName = $doc('meta[property=og:site_name]').attr('content')
    const siteOGImage = $doc('meta[property=og:image]').attr('content')
    let siteFavicon = ''
    const iconSelectors = [
      'link[rel=icon]',
      `link[rel="shortcut icon"]`,
      `link[rel="apple-touch-icon"]`,
      `link[rel="icon shortcut"]`,
    ]

    for (const selector of iconSelectors) {
      const $element = $doc(selector)
      if ($element.length > 0) {
        siteFavicon = $element.eq(0).attr('href')!
        break
      }
    }

    if (env.NODE_ENV === 'development') {
      console.log('siteFavicon', siteFavicon ? formatUrl(siteFavicon, url) : '')
      console.log('siteOGImage', siteOGImage ? formatUrl(siteOGImage, url) : '')
    }

    return {
      siteName,
      siteTitle,
      siteDescription,
      siteFavicon: siteFavicon ? formatUrl(siteFavicon, url) : '',
      siteOGImage: siteOGImage ? formatUrl(siteOGImage, url) : '',
    }
  } catch (err) {
    console.log(err)
    return null
  }
}

export function getMetaInSite() {
  const title = document.head.title
  const favicon = document.querySelector('link[rel=icon]')?.getAttribute('href')
  const ogImage = document
    .querySelector('meta[property=og:image]')
    ?.getAttribute('content')
  const description = document
    .querySelector('meta[name=description]')
    ?.getAttribute('content')

  return {
    title,
    favicon,
    ogImage,
    description,
  }
}

'use client'

import { MenuIcon } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { supportedLanguages } from '@/i18n'
import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import Link from 'next/link'

export const SiteMenu = () => {
  const t = useTranslations('Header')
  const locale = useLocale()
  const { setTheme, theme = 'system' } = useTheme()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'secondary'} className="space-x-2 rounded-full">
          <MenuIcon className="text-xl" />
          <span className="hidden md:inline">{t('menu')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex flex-col space-y-2 rounded-2xl border-zinc-100 dark:border-zinc-900 text-right shadow-none"
        align="end"
        sideOffset={10}
      >
        <div className="group inline-flex items-center justify-end space-x-4">
          <Link href="/about">
            <span>{t('about')}</span>
          </Link>
          <span className="h-px w-[20px] bg-zinc-700 transition-all group-hover:w-[30px]" />
        </div>
        <div className="group inline-flex items-center justify-end space-x-4">
          {supportedLanguages.map((lang) => (
            <Link
              key={lang.id}
              className={cn('cursor-pointer hover:text-foreground', {
                'text-foreground/55': lang.locale !== locale,
              })}
              href={`/${lang.locale}`}
              locale={lang.locale}
            >
              {lang.title}
            </Link>
          ))}
          <span className="h-px w-[20px] bg-zinc-700 transition-all group-hover:w-[30px]" />
        </div>
        <div className="group inline-flex items-center justify-end space-x-4">
          {['light', 'dark', 'system'].map((mode) => (
            <button
              className={cn('cursor-pointer hover:text-foreground capitalize', {
                'text-foreground/55': theme !== mode,
              })}
              type="button"
              onClick={() => setTheme(mode)}
              key={mode}
            >
              {mode}
            </button>
          ))}
          <span className="h-px w-[20px] bg-zinc-700 transition-all group-hover:w-[30px]" />
        </div>
      </PopoverContent>
    </Popover>
  )
}

'use client'

import { MenuIcon } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { supportedLanguages } from '@/i18n'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export const SiteMenu = () => {
  const t = useTranslations('Header')
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'secondary'} className="space-x-2 rounded-full">
          <MenuIcon className="text-xl" />
          <span className="hidden md:inline">{t('menu')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex flex-col space-y-2 rounded-2xl border-zinc-100 text-right shadow-none"
        align="end"
        sideOffset={10}
      >
        <div className="group inline-flex items-center justify-end space-x-4">
          <Link href="/about">
            <span>{t('about')}</span>
          </Link>
          <span className="h-[1px] w-[20px] bg-zinc-700 transition-all group-hover:w-[30px]" />
        </div>
        {supportedLanguages.map((lang) => (
          <div
            className="group inline-flex items-center justify-end space-x-4"
            key={lang.id}
          >
            <Link
              className="cursor-pointer"
              href={`/${lang.locale}`}
              locale={lang.locale}
            >
              {lang.title}
            </Link>
            <span className="h-[1px] w-[20px] bg-zinc-700 transition-all group-hover:w-[30px]" />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}

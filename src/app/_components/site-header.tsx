import { SendIcon } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { site } from '@/lib/config/site'
import { outfit } from '@/lib/font'
import { cn } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { SiteFilterCommand } from './site-filter-dialog'
import { SiteMenu } from './site-menu'
import { SubmitDialog } from './submit-dialog'

export const SiteHeader = async ({ filter = true }: { filter?: boolean }) => {
  const t = await getTranslations('Header')
  return (
    <div className="w-full">
      <div className="max-auto container flex h-20 items-center justify-between">
        <div>
          <Link
            href={'/'}
            className={cn(
              'text-[32px] font-medium text-foreground md:text-[40px]',
              outfit.className,
            )}
          >
            {site.name}
          </Link>
        </div>
        <div className="flex-center flex space-x-3">
          {filter && <SiteFilterCommand />}
          <SubmitDialog>
            <Button variant={'secondary'} className="space-x-2 rounded-full">
              <SendIcon className="text-xl" />
              <span className="hidden md:inline">{t('submit')}</span>
            </Button>
          </SubmitDialog>
          <SiteMenu />
        </div>
      </div>
    </div>
  )
}

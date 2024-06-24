import { UserAccountNav } from '@/components/shared/user-account-nav'
import { site } from '@/lib/config/site'
import { outfit } from '@/lib/font'
import { cn } from '@/lib/utils'
import type { Session } from 'next-auth'
import Link from 'next/link'
import { AddSiteButton } from './add-site-button'
import { PanelNav } from './panel-nav'

interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Session['user']
}

export const PanelHeader = ({ user }: PanelHeaderProps) => {
  return (
    <div className="sticky inset-x-0 top-0 flex h-16 w-full items-center justify-between border-b border-zinc-100 px-5">
      <div>
        <Link
          href={'/'}
          className={cn(
            'text-4xl font-medium text-foreground',
            outfit.className,
          )}
        >
          {site.name}
        </Link>
      </div>
      <div className="container h-full flex-grow">
        <PanelNav className="flex h-full items-stretch space-x-8 px-8 lg:px-[82px]" />
      </div>
      <div className="flex-center flex space-x-3">
        <AddSiteButton />
        <UserAccountNav user={user} />
      </div>
    </div>
  )
}

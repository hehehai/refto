import { BlurImage } from '@/components/shared/blur-image'
import { VisitIcon } from '@/components/shared/icons'
import { VideoWrapper } from '@/components/shared/video-wrapper'
import { cn } from '@/lib/utils'
import { VisitLink } from './visit-link'

interface SiteShowcaseProps extends React.ComponentPropsWithoutRef<'div'> {
  item: {
    id: string
    siteUrl: string
    siteName: string
    siteFavicon: string
    siteCover: string
    siteCoverRecord: string
    siteCoverWidth?: number
    siteCoverHeight?: number
    visits: number
  }
  fixedHeight?: number
  onDetail?: (id: string) => void
}

export const SiteShowcase = ({
  item,
  fixedHeight,
  onDetail,
  ...props
}: SiteShowcaseProps) => {
  return (
    <div
      key={item.id}
      className={cn(
        'flex w-full cursor-pointer flex-col rounded-[14px] p-1 bg-transparent transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 duration-300',
        props.className,
      )}
    >
      <div
        className="relative w-full overflow-hidden rounded-xl border border-[rgba(241,245,248,0.80)] dark:border-zinc-800"
        style={{ height: fixedHeight ? `${fixedHeight}px` : undefined }}
        onClick={() => onDetail?.(item.id)}
      >
        {item.siteCoverRecord ? (
          <VideoWrapper
            src={item.siteCoverRecord}
            cover={item.siteCover}
            width={item.siteCoverWidth}
            height={item.siteCoverHeight}
            className='hover:scale-[1.02] duration-500'
          />
        ) : fixedHeight ? (
          <BlurImage
            src={item.siteCover}
            alt={item.siteName}
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-top hover:scale-[1.02]"
          />
        ) : (
          <BlurImage
            src={item.siteCover}
            alt={item.siteName}
            width={item.siteCoverWidth}
            height={item.siteCoverHeight}
            className='hover:scale-[1.02]'
          />
        )}
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex grow items-center space-x-1">
          {item.siteFavicon && (
            <div className="overflow-hidden rounded-sm">
              <BlurImage
                src={item.siteFavicon}
                width={16}
                height={16}
                alt={item.siteName}
              />
            </div>
          )}
          <div className="text-sm font-medium text-foreground/80">
            {item.siteName}
          </div>
        </div>
        <div className="flex items-center space-x-3 px-0.5 py-1">
          {/* <div className="flex items-center space-x-1 opacity-80 transition-opacity hover:opacity-100">
            <LikeIcon className="text-lg" />
            <span>{item.likes}</span>
          </div> */}
          <VisitLink
            id={item.id}
            href={item.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 opacity-80 transition-opacity hover:opacity-100"
            count={item.visits}
          >
            <VisitIcon className="text-[16px]" />
          </VisitLink>
        </div>
      </div>
    </div>
  )
}

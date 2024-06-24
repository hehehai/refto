'use client'

import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

interface VideoWrapper extends React.ComponentPropsWithoutRef<'video'> {
  cover: string
}

export const VideoWrapper = ({ className, src, cover }: VideoWrapper) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const inView = useIntersectionObserver(videoRef, {
    rootMargin: '50% 0px 50% 0px',
    threshold: 0,
  })

  useEffect(() => {
    if (inView) {
      videoRef.current?.play()
    } else {
      videoRef.current?.pause()
    }
  }, [inView])

  return (
    <video
      ref={videoRef}
      className={cn('block w-full', className)}
      autoPlay={false}
      loop
      muted
      playsInline
      preload="none"
      aria-label="Video player"
      poster={cover}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}

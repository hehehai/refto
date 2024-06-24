'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

interface BlurImageProps extends React.ComponentPropsWithoutRef<typeof Image> {}

export function BlurImage(props: BlurImageProps) {
  const [isLoading, setLoading] = useState(true)

  return (
    <Image
      {...props}
      alt={props.alt}
      loading="lazy"
      className={cn(
        props.className,
        'duration-700 ease-in-out',
        isLoading
          ? 'scale-110 blur-2xl grayscale'
          : 'scale-100 blur-0 grayscale-0',
      )}
      onLoad={() => setLoading(false)}
    />
  )
}

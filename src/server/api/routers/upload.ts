import { getR2SignedUploadUrl } from '@/lib/upload'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const uploadRouter = createTRPCRouter({
  getUploadUrl: protectedProcedure
    .input(
      z
        .string()
        .min(1)
        .max(1024)
        .refine(
          (value) => {
            const suffix = value.split('.').pop()
            return (
              suffix &&
              ['jpg', 'jpeg', 'png', 'svg', 'webp', 'ico', 'mp4'].includes(
                suffix,
              )
            )
          },
          { message: 'Invalid file type' },
        ),
    )
    .query(async ({ input }) => {
      return getR2SignedUploadUrl(input)
    }),
})

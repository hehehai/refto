import { SupportLocale } from '@/i18n'
import { db } from '@/lib/db'
import { pagination } from '@/lib/pagination'
import { formatOrders, genOrderValidSchema } from '@/lib/utils'
import { subscribe, unsubscribe } from '@/server/functions/subscriber'
import type { Prisma, Subscriber } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const subscriberRouter = createTRPCRouter({
  // 查询
  query: protectedProcedure
    .meta({
      requiredRoles: ['ADMIN'],
    })
    .input(
      z.object({
        search: z.coerce.string().trim().max(1024).optional(),
        limit: z.number().min(1).max(50).optional().default(10),
        page: z.number().min(0).optional().default(0),
        status: z.enum(['subscribed', 'unsubscribed']).optional(),
        orderBy: genOrderValidSchema<Subscriber>(['createdAt', 'unSubDate'])
          .optional()
          .transform((v) => (v?.length ? v : ['-createdAt']))
          .transform(formatOrders),
      }),
    )
    .query(async ({ input }) => {
      const { search, limit, page, status, orderBy } = input

      const whereInput: Prisma.SubscriberWhereInput = {
        email: {
          contains: search,
          mode: 'insensitive',
        },
      }

      if (status === 'unsubscribed') {
        whereInput.unSubDate = { not: null }
      } else if (status === 'subscribed') {
        whereInput.unSubDate = null
      }

      const rows = await db.subscriber.findMany({
        where: whereInput,
        select: {
          id: true,
          email: true,
          unSubDate: true,
          createdAt: true,
          locale: true,
          weekly: true,
        },
        skip: page * limit,
        take: limit,
        orderBy: orderBy?.reduce(
          (acc, item) => ({ ...acc, [item.key]: item.dir }),
          {},
        ),
      })

      const total = await db.subscriber.count({
        where: whereInput,
      })

      return {
        rows,
        ...pagination(page, limit, total),
      }
    }),

  // 订阅
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        locale: z
          .nativeEnum(SupportLocale)
          .optional()
          .default(SupportLocale.en),
      }),
    )
    .mutation(async ({ input }) => {
      return subscribe(input.email, input.locale)
    }),

  // 取消订阅
  unsubscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        token: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return unsubscribe(input)
    }),

  unsubscribeBatch: protectedProcedure
    .meta({
      requiredRoles: ['ADMIN'],
    })
    .input(
      z.object({
        emails: z.array(z.string().email()).min(1).max(50),
      }),
    )
    .mutation(async ({ input }) => {
      const { emails } = input

      const subscriber = await db.subscriber.findMany({
        where: {
          email: {
            in: emails,
          },
        },
      })
      const canUnSubs = subscriber.filter((item) => !item.unSubDate)
      if (canUnSubs.length !== emails.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Some subscribers are already unsubscribed',
        })
      }
      await db.subscriber.updateMany({
        where: {
          email: {
            in: emails,
          },
        },
        data: {
          unSubDate: new Date(),
        },
      })
      return canUnSubs.length
    }),
})

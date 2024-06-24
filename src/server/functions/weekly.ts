import { db } from '@/lib/db'

export async function detail(id: string) {
  'use server'
  return db.weekly.findUnique({
    where: {
      id,
    },
  })
}

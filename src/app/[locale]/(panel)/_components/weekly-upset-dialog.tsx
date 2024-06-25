'use client'

import { Spinner } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/trpc/react'
import { weeklySchema } from '@/lib/validations/weekly'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Weekly } from '@prisma/client'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { weeklyDialogAtom, weeklyDialogEmitter } from '../_store/dialog.store'
import { WeekPicker } from './week-picker'
import { RefSelectDataTable } from '../panel/weekly/_components/ref-select/data-table'
import WeeklyEmail from '@/lib/email/templates/weekly'
import { SupportLocale } from '@/i18n'
import { renderAsync } from '@react-email/render'

const emptyData = {
  title: '',
  sites: [],
}

const emailStatus = {
  count: 24,
  sites: [
    {
      id: 'clu1d5p8j001xwzrbgifl4jpa',
      cover:
        'https://storage.refto.one/24-05-04/17148301251023671e2f8d4be79ea2a1b1ad8bb656506.webp',
      title: 'roasti.co',
      url: 'https://roasti.co',
      tags: ['design', 'agency', 'parallax', 'fun'],
    },
    {
      id: 'clu1d5p8j001xwzrbgifl4jpa',
      cover:
        'https://storage.refto.one/24-03-21/171103344476225a0e552a332a7ef7c51e17f16d66f69.webp',
      title: 'authkit',
      url: 'https://authkit.com',
      tags: ['development', 'dark', 'transitions', 'gradient'],
    },
  ],
  unsubscribeUrl: 'https://refto.one/unsub?email=rivehohai@gmail.com&token=123',
  baseUrl: 'https://refto.one',
  locale: SupportLocale.zh_CN,
}

export async function getWeeklyMarkup() {
  const markup = await renderAsync(<WeeklyEmail {...emailStatus} />, {
    pretty: true,
  })
  return markup
}

export function WeeklyUpsetSheet() {
  const utils = api.useUtils()
  const { toast } = useToast()

  const [status, setStatus] = useAtom(weeklyDialogAtom)
  const statusId = useMemo(() => status.id, [status.id])
  const [detailData, setDetailData] = useState<Partial<Weekly>>(emptyData)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const isEdit = status.isAdd === false && status.id !== null

  const form = useForm<z.infer<typeof weeklySchema>>({
    resolver: zodResolver(weeklySchema),
    defaultValues: {
      ...emptyData,
    },
  })

  const handleInitData = useCallback(async () => {
    if (!statusId) {
      setDetailData(emptyData)
      return
    }

    try {
      setDetailLoading(true)
      const detail = await utils.weekly.detail.fetch({ id: statusId })
      if (!detail) {
        throw new Error('Detail not found')
      }
      setDetailData(detail)
      form.reset({ ...detail })
    } catch (err: any) {
      toast({
        title: 'Fetch detail err',
        description: err?.message ?? 'Please try agin',
      })
    } finally {
      setDetailLoading(false)
    }
  }, [statusId, utils, form, toast])

  useEffect(() => {
    handleInitData()
  }, [handleInitData])

  const handleClose = useCallback(
    (value: boolean) => {
      if (!value) {
        form.reset({ ...emptyData })
        setStatus({ show: false, isAdd: true, id: null })
      }
    },
    [setStatus, form],
  )

  const onSubmit = useCallback(
    async (values: z.infer<typeof weeklySchema>, thenAdd = false) => {
      const title = isEdit ? 'Save' : 'Create'
      try {
        setSaveLoading(true)
        if (isEdit) {
          await utils.client.weekly.update.mutate({
            ...values,
            id: statusId!,
          })
        } else {
          await utils.client.weekly.create.mutate(values)
        }
        toast({
          title: `${title} success`,
          description: `${title} success`,
        })
        weeklyDialogEmitter.emit('success')
        if (!isEdit && thenAdd) {
          form.reset({ ...emptyData })
        } else {
          handleClose(false)
        }
      } catch (err: any) {
        console.log('ref site submit err', err)
        toast({
          title: `${title} failed`,
          description: err.message || 'Please try again',
          variant: 'destructive',
        })
      } finally {
        setSaveLoading(false)
      }
    },
    [isEdit, statusId, handleClose, form, utils, toast],
  )

  const [mailMark, setMailMark] = useState('')

  useEffect(() => {
    getWeeklyMarkup().then((m) => setMailMark(m))
  }, [])

  return (
    <Sheet open={status.show} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[94vw] flex flex-col" side="left">
        <SheetHeader>
          <SheetTitle>
            <span>{isEdit ? 'Edit Weekly' : 'Create Weekly'}</span>
            {detailLoading && <Spinner className="ml-2" />}
          </SheetTitle>
        </SheetHeader>
        <div className="flex">
          <div className="w-[540px] mr-3">
            <div className="text-sm font-medium mb-2">Preview</div>
            <iframe
              srcDoc={mailMark}
              title="Weekly"
              className="h-[calc(100vh_-_180px)] w-full border border-input rounded-lg"
            />
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => onSubmit(v, false))}
              className="flex-grow flex flex-col max-w-[45vw]"
            >
              <div className="space-y-2 h-[calc(100dvh-144px)] overflow-y-auto px-3 -mx-3 mb-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  key="weekRange"
                  control={form.control}
                  name="weekRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Week Range</FormLabel>
                      <FormControl>
                        <WeekPicker
                          disabled={field.disabled}
                          value={field.value as [Date, Date]}
                          placeholder="Pick a week"
                          onChange={(value) => {
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  key="sites"
                  control={form.control}
                  name="sites"
                  render={({ field }) => (
                    <FormItem key={field.name}>
                      <FormLabel>Sites</FormLabel>
                      <FormControl>
                        {/* <Textarea
                          {...field}
                          placeholder="Type sites id, separated by ','"
                          value={field.value.join(',')}
                          onChange={(e) => {
                            field.onChange(e.target.value.split(','))
                          }}
                        /> */}
                        <RefSelectDataTable />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <SheetFooter className="mt-auto">
                <Button
                  type="button"
                  variant={'outline'}
                  disabled={saveLoading}
                  onClick={() => {
                    if (statusId) {
                      form.reset({
                        ...detailData,
                      })
                    } else {
                      form.reset({ ...emptyData })
                    }
                  }}
                >
                  <span>Reset</span>
                </Button>
                <Button type="submit" disabled={saveLoading}>
                  {saveLoading && <Spinner className="mr-2 text-xl" />}
                  <span>Submit</span>
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

WeeklyUpsetSheet.displayName = 'WeeklyUpsetSheet'

export default WeeklyUpsetSheet

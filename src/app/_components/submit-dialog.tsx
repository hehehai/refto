'use client'

import { Spinner } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/trpc/react'
import {
  type SubmitSiteCreate,
  submitSiteCreateSchema,
} from '@/lib/validations/submit-site'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const emptyData = {
  email: '',
  site: '',
  title: '',
  description: '',
}

export const SubmitDialog = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations('Submit')
  const locale = useLocale()
  const utils = api.useUtils()
  const { toast } = useToast()

  const form = useForm<SubmitSiteCreate>({
    resolver: zodResolver(submitSiteCreateSchema(locale)),
    defaultValues: {
      ...emptyData,
    },
  })

  const submitAction = api.submitSite.recommend.useMutation({
    onSuccess: () => {
      toast({
        title: t('success.title'),
        description: t('success.description'),
      })
      form.reset({ ...emptyData })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const [getUrlLoading, setGetUrlLoading] = useState(false)

  const onSubmit = useCallback(
    async (values: SubmitSiteCreate) => {
      submitAction.mutate(values)
    },
    [submitAction],
  )

  const handleGetUrlMeta = useCallback(
    async (e: React.SyntheticEvent<HTMLButtonElement>) => {
      e.preventDefault()
      const currentUrl = form.getValues('site')
      const validUrl = z.string().trim().url().safeParse(currentUrl)
      if (!validUrl.success) {
        toast({
          title: 'Error',
          description: 'Please input site url',
          variant: 'destructive',
        })
        return
      }
      setGetUrlLoading(true)
      try {
        const data = await utils.siteMeta.meta.fetch({ url: validUrl.data })

        if (!data) {
          toast({
            title: 'Error',
            description: 'Failed to get site meta',
            variant: 'destructive',
          })
          return
        }

        form.reset({
          email: form.getValues('email'),
          site: validUrl.data,
          title: data.siteTitle,
          description: data.siteDescription,
        })
      } finally {
        setGetUrlLoading(false)
      }
    },
    [form, toast, utils.siteMeta.meta],
  )

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col max-sm:h-dvh max-sm:border-none max-sm:shadow-none sm:grid sm:max-w-[526px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col max-sm:mt-3 max-sm:grow"
          >
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email.label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('email.placeholder')}
                        {...field}
                        disabled={getUrlLoading}
                      />
                    </FormControl>
                    <FormDescription>{t('email.msg')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('siteUrl.label')}</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          placeholder={t('siteUrl.placeholder')}
                          {...field}
                          disabled={getUrlLoading}
                        />
                        <Button
                          onClick={handleGetUrlMeta}
                          disabled={getUrlLoading}
                        >
                          {getUrlLoading && <Spinner className="mr-1" />}
                          <span>{t('siteUrl.button')}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('siteTitle.label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('siteTitle.placeholder')}
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('siteDescription.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('siteDescription.placeholder')}
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-auto sm:mt-4">
              <Button
                type="submit"
                disabled={submitAction.isLoading}
                className="max-sm:w-full"
              >
                {submitAction.isLoading && <Spinner className="mr-2 text-xl" />}
                <span>{t('button.submit')}</span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

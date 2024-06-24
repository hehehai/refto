'use client'

import { BoxAddIcon } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { useAtom } from 'jotai'
import { refSiteDialogAtom } from '../[locale]/(panel)/_store/dialog.store'

export function AddSiteButton() {
  const [status, setStatus] = useAtom(refSiteDialogAtom)

  return (
    <Button
      variant={'secondary'}
      className="rounded-full"
      disabled={status.show}
      onClick={() => setStatus({ show: true, isAdd: true, id: null })}
    >
      <BoxAddIcon className="mr-2 text-xl" />
      <span>Add Site</span>
    </Button>
  )
}

import { atom } from 'jotai'

interface RefSiteSheetState {
  id: string | null
}

export const refSiteSheetAtom = atom<RefSiteSheetState>({
  id: null,
})

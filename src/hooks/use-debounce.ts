import { useRef, useEffect } from 'react'
import { debounce } from 'lodash'

type AsyncCallback = (...args: any[]) => Promise<any>

function useDebounce<T extends AsyncCallback>(callback: T, delay: number): T {
  const debouncedFunction = useRef(debounce(callback, delay))

  useEffect(() => {
    return () => {
      debouncedFunction.current.cancel()
    }
  }, [])

  return debouncedFunction.current as unknown as T
}

export default useDebounce

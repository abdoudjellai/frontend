import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../services/api'

/**
 * Run an async loader and track { data, error, loading }. Re-runs when `deps` change or `reload()` is called.
 * Results of outdated runs are ignored.
 */
export function useApi(load, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    load().then(
      (data) => !cancelled && setState({ data, error: null, loading: false }),
      (err) => !cancelled && setState({ data: null, error: errorMessage(err), loading: false }),
    )
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { ...state, reload }
}

import { useEffect, useState, useCallback } from 'react'
import api from '../services/api'

/**
 * Fetches from the Express backend at http://localhost:5000.
 * If the backend isn't running yet, falls back to the provided sample
 * dataset so the UI stays fully explorable during frontend development.
 * Swap `fallback` for `null` once your API is live to enforce real data only.
 */
export function useApiData(endpoint, fallback = null) {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFallback, setIsFallback] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get(endpoint)
      setData(res)
      setIsFallback(false)
    } catch (err) {
      setError(err)
      if (fallback !== null) {
        setData(fallback)
        setIsFallback(true)
      }
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint])

  return { data, loading, error, isFallback, refetch: load }
}

'use client'

import { useState, useEffect } from 'react'
import { Period } from '@/types/period.type'
import { api } from '@/lib/api'

function usePeriod() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch periods on mount
  useEffect(() => {
    fetchPeriods()
  }, [])

  const fetchPeriods = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.getPeriods()
      const periodData = response.data || []

      setPeriods(periodData)

      // Find current period: currentDate >= period_start && currentDate <= period_end
      const now = new Date()
      const active = periodData.find((period: Period) => {
        const startDate = new Date(period.period_start)
        const endDate = new Date(period.period_end)
        return now >= startDate && now <= endDate
      })

      setCurrentPeriod(active || null)
    } catch (err) {
      console.error('Period fetch failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch periods')
    } finally {
      setLoading(false)
    }
  }

  return {
    periods,
    currentPeriod,
    loading,
    error,
    refetch: fetchPeriods,
  }
}

export default usePeriod

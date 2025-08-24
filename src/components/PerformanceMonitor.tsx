'use client'

import { useEffect, useRef } from 'react'

interface PerformanceMonitorProps {
  pageName: string
  onMetrics?: (metrics: {
    loadTime: number
    renderTime: number
    pageName: string
  }) => void
}

export default function PerformanceMonitor({ pageName, onMetrics }: PerformanceMonitorProps) {
  const startTimeRef = useRef(Date.now())
  const renderStartRef = useRef(Date.now())

  useEffect(() => {
    const renderTime = Date.now() - renderStartRef.current
    const loadTime = Date.now() - startTimeRef.current

    // Log performance metrics
    console.log(`[Performance] ${pageName}:`, {
      loadTime: `${loadTime}ms`,
      renderTime: `${renderTime}ms`,
      timestamp: new Date().toISOString()
    })

    // Call callback if provided
    onMetrics?.({
      loadTime,
      renderTime,
      pageName
    })

    // Report to browser performance API if available
    if (typeof window !== 'undefined' && window.performance?.mark) {
      window.performance.mark(`${pageName}-loaded`)
      window.performance.measure(`${pageName}-load-duration`, 'navigationStart', `${pageName}-loaded`)
    }
  }, [pageName, onMetrics])

  // This component renders nothing
  return null
}

// Hook for measuring specific operations
export function usePerformanceTimer(operationName: string) {
  const startTimeRef = useRef<number | null>(null)

  const startTimer = () => {
    startTimeRef.current = Date.now()
  }

  const endTimer = () => {
    if (startTimeRef.current) {
      const duration = Date.now() - startTimeRef.current
      console.log(`[Performance] ${operationName}: ${duration}ms`)
      return duration
    }
    return 0
  }

  return { startTimer, endTimer }
}
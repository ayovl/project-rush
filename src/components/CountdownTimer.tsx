'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  showDemoMode?: boolean
  showOnly?: 'demo' | 'launch' | 'both'
}

const CountdownTimer = ({ showDemoMode = false, showOnly = 'both' }: CountdownTimerProps) => {
  const calculateTimeLeft = () => {
    const difference = +new Date('2025-10-05T00:00:00Z') - +new Date()
    let timeLeft: {
      days?: number,
      hours?: number,
      minutes?: number,
      seconds?: number,
    } = {}

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }
    return timeLeft
  }

  // Initialize with empty state to prevent hydration mismatch
  const [timeLeft, setTimeLeft] = useState<{
    days?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
  }>({})
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set client flag and initial time
    setIsClient(true)
    setTimeLeft(calculateTimeLeft())
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const format = (num: number | undefined) => (num || 0).toString().padStart(2, '0');

  // Don't render until client-side to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="bg-gradient-to-r from-[#00D1FF]/20 to-[#00B8E6]/20 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg tracking-wide uppercase whitespace-nowrap border border-[#00D1FF]/30 backdrop-blur-sm">
        {showDemoMode && (
          <span className="opacity-90 mr-2 text-[#00D1FF]">Demo •</span>
        )}
        <span className="opacity-80 mr-2">Launching in:</span>
        <span>--d</span>
        <span className="mx-1">:</span>
        <span>--h</span>
        <span className="mx-1">:</span>
        <span>--m</span>
        <span className="mx-1">:</span>
        <span>--s</span>
      </div>
    )
  }

  if (!timeLeft.days && !timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds) {
    return (
      <span className="bg-[#E6F4FF] text-[#005577] text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wide uppercase whitespace-nowrap border border-[#B3E0FF]" suppressHydrationWarning>
        Launching Soon!
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Demo Mode Badge */}
      {(showDemoMode && (showOnly === 'both' || showOnly === 'demo')) && (
        <div className="h-6 sm:h-7 flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-full backdrop-blur-sm">
          <span className="text-xs font-bold text-purple-100">Demo Mode</span>
        </div>
      )}
      
      {/* Launch Badge */}
      {(showOnly === 'both' || showOnly === 'launch') && (
        <div className="h-7 sm:h-7 flex items-center bg-gradient-to-r from-[#00D1FF]/20 to-[#00B8E6]/20 text-white text-xs font-bold px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg tracking-wide uppercase whitespace-nowrap border border-[#00D1FF]/30 backdrop-blur-sm" suppressHydrationWarning>
          <span className="opacity-80 mr-2">Launching in:</span>
          <span>{format(timeLeft.days)}d</span>
          <span className="mx-1">:</span>
          <span>{format(timeLeft.hours)}h</span>
          <span className="mx-1">:</span>
          <span>{format(timeLeft.minutes)}m</span>
          <span className="mx-1">:</span>
          <span>{format(timeLeft.seconds)}s</span>
        </div>
      )}
    </div>
  )
}

export default CountdownTimer

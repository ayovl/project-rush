'use client'

import { useState, useEffect } from 'react'

const CountdownTimer = () => {
  const calculateTimeLeft = () => {
    const difference = +new Date('2025-09-16T00:00:00Z') - +new Date()
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

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const format = (num: number | undefined) => (num || 0).toString().padStart(2, '0');

  if (!timeLeft.days && !timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds) {
    return (
      <span className="bg-[#E6F4FF] text-[#005577] text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wide uppercase whitespace-nowrap border border-[#B3E0FF]">
        Launching Soon!
      </span>
    )
  }

  return (
    <div className="bg-gradient-to-r from-[#00D1FF]/20 to-[#00B8E6]/20 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg tracking-wide uppercase whitespace-nowrap border border-[#00D1FF]/30 backdrop-blur-sm">
      <span className="opacity-80 mr-2">Launching in:</span>
      <span>{format(timeLeft.days)}d</span>
      <span className="mx-1">:</span>
      <span>{format(timeLeft.hours)}h</span>
      <span className="mx-1">:</span>
      <span>{format(timeLeft.minutes)}m</span>
      <span className="mx-1">:</span>
      <span>{format(timeLeft.seconds)}s</span>
    </div>
  )
}

export default CountdownTimer
